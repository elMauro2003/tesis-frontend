"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { SearchField } from "@/components/shared/SearchField";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { teacherService } from "@/core/services/teacher.service";
import { FetchError } from "@/lib/fetchClient";
import { Building, PaginatedResponse, Site, Teacher, Wing } from "@/types/models";

interface AssignInstructorModalProps {
  building: Building | null;
  wings: Wing[];
  sites: Site[];
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
  onRequestRegisterWing?: (building: Building) => void;
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const SCROLL_LOAD_THRESHOLD_PX = 96;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const getNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  if (value && typeof value === "object" && "id" in value) return getNumericId((value as Record<string, unknown>).id);
  return null;
};

const getTeacherDisplayName = (teacher: Teacher): string => {
  if (teacher.full_name?.trim()) return teacher.full_name.trim();
  const composed = [teacher.first_name, teacher.last_name].filter(Boolean).join(" ").trim();
  return composed || `Profesor #${teacher.id}`;
};

const getTeachersNextPageParam = (
  lastPage: PaginatedResponse<Teacher>,
  allPages: PaginatedResponse<Teacher>[]
): number | undefined => {
  const loadedCount = allPages.reduce((sum, page) => sum + page.results.length, 0);

  if (lastPage.results.length === 0) return undefined;
  if (loadedCount >= lastPage.count) return undefined;
  if (lastPage.results.length < PAGE_SIZE) return undefined;

  return allPages.length + 1;
};

const getBuildingSiteLabel = (building: Building, sitesById: Map<number, Site>): string => {
  if (typeof building.site === "object" && building.site && "name" in building.site) {
    return String(building.site.name);
  }

  const siteId = getNumericId(building.site);
  if (siteId !== null) {
    return sitesById.get(siteId)?.name ?? "-";
  }

  return "-";
};

export function AssignInstructorModal({
  building,
  wings,
  sites,
  open,
  onClose,
  onAssigned,
  onRequestRegisterWing,
}: AssignInstructorModalProps) {
  const queryClient = useQueryClient();
  const [selectedWingId, setSelectedWingId] = useState<number | "">("");
  const [selectedProfessorId, setSelectedProfessorId] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [wingFieldError, setWingFieldError] = useState<string | undefined>(undefined);
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);

  const sitesById = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);

  const buildingWings = useMemo(() => {
    if (!building) return [];

    return wings
      .filter((wing) => getNumericId(wing.building) === building.id)
      .sort((left, right) => left.name.localeCompare(right.name, "es"));
  }, [building, wings]);

  const wingIds = useMemo(() => buildingWings.map((wing) => wing.id), [buildingWings]);
  const hasWings = buildingWings.length > 0;

  const supervisorsQuery = useQuery({
    queryKey: ["wing-supervisors", building?.id, wingIds.join(",")],
    queryFn: () => teacherService.getSupervisorsByWingIds(wingIds),
    enabled: open && !!building && hasWings,
    staleTime: 30 * 1000,
  });

  const selectedWingSupervisor = useMemo(() => {
    if (selectedWingId === "") return null;
    return supervisorsQuery.data?.get(selectedWingId) ?? null;
  }, [selectedWingId, supervisorsQuery.data]);

  const searchTerm = debouncedSearch.trim();
  const listEnabled = open && !!building && hasWings && selectedWingId !== "";

  const professorsInfiniteQuery = useInfiniteQuery({
    queryKey: ["professors-assign", { search: searchTerm }],
    queryFn: ({ pageParam }) =>
      teacherService.getTeachers({
        page: pageParam,
        page_size: PAGE_SIZE,
        ...(searchTerm ? { search: searchTerm } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: getTeachersNextPageParam,
    enabled: listEnabled,
    staleTime: 30 * 1000,
  });

  const pages = professorsInfiniteQuery.data?.pages ?? [];
  const professors = useMemo(() => pages.flatMap((page) => page.results), [pages]);
  const paginationMeta = useMemo(() => {
    const lastPage = pages[pages.length - 1];
    const totalCount = lastPage?.count ?? 0;
    const loadedCount = professors.length;
    const hasNextPage = professorsInfiniteQuery.hasNextPage;
    const reachedEnd = !hasNextPage && !professorsInfiniteQuery.isFetchingNextPage;

    return { totalCount, loadedCount, hasNextPage, reachedEnd };
  }, [pages, professors.length, professorsInfiniteQuery.hasNextPage, professorsInfiniteQuery.isFetchingNextPage]);

  const selectedProfessor = useMemo(
    () => (selectedProfessorId === "" ? null : professors.find((professor) => professor.id === selectedProfessorId) ?? null),
    [professors, selectedProfessorId]
  );

  const selectedProfessorAssignmentQuery = useQuery({
    queryKey: ["professor-wing-supervisor", selectedProfessorId],
    queryFn: () => teacherService.getWingSupervisor(selectedProfessorId as number),
    enabled: open && selectedProfessorId !== "" && Boolean(selectedProfessor?.is_wing_supervisor),
    retry: false,
    staleTime: 30 * 1000,
  });

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!building || selectedWingId === "" || selectedProfessorId === "") {
        throw new Error("Seleccione un ala y un instructor para continuar.");
      }

      await teacherService.assignWingSupervisor(selectedProfessorId, selectedWingId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wing-supervisors"] });
      await queryClient.invalidateQueries({ queryKey: ["professor-wing-supervisor"] });

      const wingName = buildingWings.find((wing) => wing.id === selectedWingId)?.name ?? "el ala";
      const professorName = selectedProfessor ? getTeacherDisplayName(selectedProfessor) : "el instructor";

      toast.success("Instructor asignado", {
        description: `${professorName} quedó como responsable de ${wingName}.`,
      });

      onAssigned?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo asignar el instructor", {
        description: getErrorMessage(error, "Revise la selección e intente nuevamente."),
      });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async (professorId: number) => {
      await teacherService.removeWingSupervisor(professorId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["wing-supervisors"] });
      await queryClient.invalidateQueries({ queryKey: ["professor-wing-supervisor"] });

      toast.success("Asignación removida", {
        description: "El ala quedó sin instructor asignado.",
      });

      setSelectedProfessorId("");
      onAssigned?.();
    },
    onError: (error) => {
      toast.error("No se pudo quitar la asignación", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) return;

    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [open, search]);

  useEffect(() => {
    if (!open) return;

    setSelectedWingId(buildingWings.length === 1 ? buildingWings[0].id : "");
    setSelectedProfessorId("");
    setSearch("");
    setDebouncedSearch("");
    setWingFieldError(undefined);
    assignMutation.reset();
    removeMutation.reset();
  }, [open, building?.id]);

  useEffect(() => {
    setSelectedProfessorId("");
  }, [selectedWingId]);

  const loadMoreProfessors = useCallback(async () => {
    if (
      loadMoreLockRef.current ||
      !listEnabled ||
      !professorsInfiniteQuery.hasNextPage ||
      professorsInfiniteQuery.isFetchingNextPage
    ) {
      return;
    }

    loadMoreLockRef.current = true;

    try {
      await professorsInfiniteQuery.fetchNextPage();
    } finally {
      loadMoreLockRef.current = false;
    }
  }, [listEnabled, professorsInfiniteQuery]);

  const handleListScroll = useCallback(() => {
    const element = listRef.current;
    if (!element) return;

    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceToBottom <= SCROLL_LOAD_THRESHOLD_PX) {
      void loadMoreProfessors();
    }
  }, [loadMoreProfessors]);

  const handleSubmit = () => {
    if (!hasWings) return;

    if (selectedWingId === "") {
      setWingFieldError("Seleccione el ala a la que desea asignar un instructor.");
      toast.error("Falta seleccionar el ala", {
        description: "Elija una ala del edificio para continuar.",
      });
      return;
    }

    if (selectedProfessorId === "") {
      toast.error("Falta seleccionar el instructor", {
        description: "Elija un profesor de la lista para completar la asignación.",
      });
      return;
    }

    setWingFieldError(undefined);
    assignMutation.mutate();
  };

  const handleRegisterWing = () => {
    if (!building || !onRequestRegisterWing) return;
    onClose();
    onRequestRegisterWing(building);
  };

  const buildingLabel = building?.name ?? "Edificio";
  const siteLabel = building ? getBuildingSiteLabel(building, sitesById) : "-";
  const isPending = assignMutation.isPending || removeMutation.isPending;
  const isSearchPending = search.trim() !== debouncedSearch.trim();
  const isInitialLoading =
    professorsInfiniteQuery.isLoading ||
    (professorsInfiniteQuery.isFetching && !professorsInfiniteQuery.isFetchingNextPage && professors.length === 0);

  const selectedProfessorCurrentWing = selectedProfessorAssignmentQuery.data;
  const willReplaceCurrentSupervisor =
    selectedWingSupervisor !== null && selectedWingSupervisor.professor !== selectedProfessorId;
  const willMoveProfessor =
    selectedProfessorCurrentWing !== undefined &&
    selectedProfessorCurrentWing.wing !== selectedWingId;

  const showEmptyProfessors =
    listEnabled &&
    !isInitialLoading &&
    !isSearchPending &&
    !professorsInfiniteQuery.isFetchingNextPage &&
    professors.length === 0 &&
    paginationMeta.reachedEnd &&
    !professorsInfiniteQuery.isError;

  return (
    <BottomSheet open={open && !!building} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="flex w-full min-w-0 flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-lowest)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-2xl">person_add</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-xl font-extrabold text-[var(--color-on-surface)]">
                Asignar instructor
              </h3>
              <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                Designe un responsable de ala dentro de {buildingLabel}.
              </p>
            </div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </header>

        <div className="space-y-5 p-6">
          <div className="rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificio</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--color-on-surface)]">{buildingLabel}</p>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">Sede: {siteLabel}</p>
          </div>

          {!hasWings ? (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] px-6 py-10 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
                <span className="material-symbols-outlined text-3xl">apartment</span>
              </div>
              <p className="font-headline text-lg font-bold text-[var(--color-on-surface)]">Este edificio no tiene alas</p>
              <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
                Para asignar un instructor primero debe registrar al menos una ala en el edificio.
              </p>
              {onRequestRegisterWing ? (
                <Button type="button" variant="confirm" className="mt-6" onClick={handleRegisterWing}>
                  <span className="material-symbols-outlined text-lg">add</span>
                  Registrar ala
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Ala a supervisar
                </label>
                <Select
                  value={selectedWingId === "" ? undefined : String(selectedWingId)}
                  onValueChange={(value) => {
                    setSelectedWingId(Number(value));
                    setWingFieldError(undefined);
                  }}
                >
                  <SelectTrigger
                    aria-label="Seleccionar ala"
                    aria-invalid={Boolean(wingFieldError)}
                    className="h-12 rounded-2xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none"
                  >
                    <SelectValue placeholder="Seleccione un ala del edificio" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingWings.map((wing) => {
                      const supervisor = supervisorsQuery.data?.get(wing.id);
                      return (
                        <SelectItem key={wing.id} value={String(wing.id)}>
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate">{wing.name}</span>
                            {supervisor ? (
                              <span className="truncate text-[10px] font-medium text-[var(--color-on-surface-variant)]">
                                · {supervisor.professor_name}
                              </span>
                            ) : null}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                <FormFieldError message={wingFieldError} />
              </div>

              {selectedWingId !== "" ? (
                <div className="rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)] px-4 py-3">
                  {supervisorsQuery.isLoading ? (
                    <p className="text-sm text-[var(--color-on-surface-variant)]">Consultando asignación actual...</p>
                  ) : selectedWingSupervisor ? (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                          Responsable actual
                        </p>
                        <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">
                          {selectedWingSupervisor.professor_name}
                        </p>
                        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                          Supervisa {selectedWingSupervisor.wing_name}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => removeMutation.mutate(selectedWingSupervisor.professor)}
                      >
                        Quitar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[var(--color-outline)]">info</span>
                      <p className="text-sm text-[var(--color-on-surface-variant)]">
                        Esta ala aún no tiene instructor asignado. Seleccione uno de la lista inferior.
                      </p>
                    </div>
                  )}
                </div>
              ) : null}

              {selectedWingId !== "" ? (
                <>
                  <SearchField
                    value={search}
                    onChange={setSearch}
                    placeholder="Buscar instructor por nombre o ID de empleado..."
                  />

                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                        Instructores disponibles
                      </label>
                      {!isInitialLoading && paginationMeta.totalCount > 0 ? (
                        <span className="text-[10px] font-medium text-[var(--color-outline)]">
                          {professors.length} mostrados
                          {paginationMeta.reachedEnd
                            ? ` · ${paginationMeta.totalCount} en total`
                            : ` · cargando de ${paginationMeta.totalCount}`}
                        </span>
                      ) : null}
                    </div>

                    {professorsInfiniteQuery.isError && professors.length === 0 ? (
                      <p className="text-sm text-[var(--color-error)]">No se pudo cargar el listado de instructores.</p>
                    ) : isInitialLoading || isSearchPending ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <div
                            key={`professor-skeleton-${index}`}
                            className="h-16 animate-pulse rounded-xl bg-[var(--color-surface-container-high)]"
                          />
                        ))}
                      </div>
                    ) : showEmptyProfessors ? (
                      <div className="rounded-xl border border-dashed border-[var(--color-outline-variant)]/30 px-4 py-8 text-center">
                        <p className="text-sm font-medium text-[var(--color-on-surface)]">Sin instructores encontrados</p>
                        <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                          {searchTerm
                            ? "Pruebe con otro término de búsqueda."
                            : "No hay profesores registrados en el sistema."}
                        </p>
                      </div>
                    ) : (
                      <div
                        ref={listRef}
                        onScroll={handleListScroll}
                        className="max-h-64 space-y-2 overflow-y-auto pr-1"
                      >
                        {professors.map((professor) => {
                          const isSelected = selectedProfessorId === professor.id;
                          const displayName = getTeacherDisplayName(professor);

                          return (
                            <button
                              key={professor.id}
                              type="button"
                              onClick={() => setSelectedProfessorId(professor.id)}
                              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                                isSelected
                                  ? "border-[var(--color-primary)] bg-[var(--color-primary-selected)]"
                                  : "border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container-low)]"
                              }`}
                            >
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-sm font-bold text-[var(--color-primary)]">
                                {displayName
                                  .split(" ")
                                  .filter(Boolean)
                                  .slice(0, 2)
                                  .map((part) => part[0]?.toUpperCase() ?? "")
                                  .join("")}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-[var(--color-on-surface)]">{displayName}</p>
                                <p className="truncate text-xs text-[var(--color-on-surface-variant)]">
                                  {professor.employee_id ? `ID ${professor.employee_id}` : "Sin ID de empleado"}
                                  {professor.department ? ` · ${professor.department}` : ""}
                                </p>
                              </div>
                              {professor.is_wing_supervisor ? (
                                <span className="shrink-0 rounded-full bg-[var(--color-surface-container-high)] px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--color-on-surface-variant)]">
                                  Responsable
                                </span>
                              ) : null}
                            </button>
                          );
                        })}

                        {professorsInfiniteQuery.isFetchingNextPage ? (
                          <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--color-on-surface-variant)]">
                            <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
                            Cargando más instructores...
                          </div>
                        ) : paginationMeta.hasNextPage ? (
                          <p className="py-2 text-center text-[10px] text-[var(--color-outline)]">Desplácese para ver más</p>
                        ) : professors.length > 0 ? (
                          <p className="py-2 text-center text-[10px] text-[var(--color-outline)]">Fin del listado</p>
                        ) : null}
                      </div>
                    )}
                  </div>

                  {willReplaceCurrentSupervisor ? (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <span className="material-symbols-outlined text-amber-600">warning</span>
                      <p className="text-sm text-amber-900">
                        {selectedWingSupervisor?.professor_name} dejará de ser responsable de esta ala al confirmar la nueva asignación.
                      </p>
                    </div>
                  ) : null}

                  {willMoveProfessor && selectedProfessorCurrentWing ? (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <span className="material-symbols-outlined text-amber-600">swap_horiz</span>
                      <p className="text-sm text-amber-900">
                        {getTeacherDisplayName(selectedProfessor!)} supervisa actualmente {selectedProfessorCurrentWing.wing_name}. La asignación se trasladará a la ala seleccionada.
                      </p>
                    </div>
                  ) : null}
                </>
              ) : (
                <div className="flex items-start gap-3 rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)] p-4">
                  <span className="material-symbols-outlined text-[var(--color-outline)]">touch_app</span>
                  <p className="text-sm text-[var(--color-on-surface-variant)]">
                    Seleccione primero el ala para ver instructores y completar la asignación.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <footer className="flex flex-col-reverse gap-2 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          {hasWings ? (
            <Button
              type="button"
              variant="confirm"
              disabled={isPending || selectedWingId === "" || selectedProfessorId === ""}
              onClick={handleSubmit}
            >
              <span className="material-symbols-outlined text-lg">person_add</span>
              {isPending ? "Asignando..." : "Confirmar asignación"}
            </Button>
          ) : null}
        </footer>
      </div>
    </BottomSheet>
  );
}

export default AssignInstructorModal;
