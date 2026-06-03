"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/shared/SearchField";
import { accommodationService } from "@/core/services/accommodation.service";
import { studentService } from "@/core/services/student.service";
import { getRoomAvailableSpots } from "@/features/rooms/utils/roomStatus";
import { getStudentInitials } from "@/features/rooms/utils/roomLabels";
import { FetchError } from "@/lib/fetchClient";
import { PaginatedResponse, Room, RoomAssignment, Student } from "@/types/models";

interface AssignStudentModalProps {
  room: Room | null;
  roomLabel: string;
  assignments: RoomAssignment[];
  open: boolean;
  onClose: () => void;
  onAssigned?: () => void;
}

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const SCROLL_LOAD_THRESHOLD_PX = 96;
const MAX_EMPTY_AUTO_PAGES = 8;

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const getAssignmentStudentId = (assignment: RoomAssignment): number | null => {
  if (typeof assignment.student === "number") return assignment.student;
  if (typeof assignment.student === "object" && assignment.student && "id" in assignment.student) {
    return Number((assignment.student as { id: number }).id);
  }
  return null;
};

const isStudentWithoutRoom = (student: Student, assignedStudentIds: Set<number>): boolean => {
  const hasRoom =
    typeof student.has_room === "boolean" ? student.has_room : assignedStudentIds.has(student.id);
  return !hasRoom;
};

const getStudentsNextPageParam = (
  lastPage: PaginatedResponse<Student>,
  allPages: PaginatedResponse<Student>[]
): number | undefined => {
  const loadedCount = allPages.reduce((sum, page) => sum + page.results.length, 0);

  if (lastPage.results.length === 0) return undefined;
  if (loadedCount >= lastPage.count) return undefined;
  if (lastPage.results.length < PAGE_SIZE) return undefined;

  return allPages.length + 1;
};

export function AssignStudentModal({
  room,
  roomLabel,
  assignments,
  open,
  onClose,
  onAssigned,
}: AssignStudentModalProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const listRef = useRef<HTMLDivElement>(null);
  const loadMoreLockRef = useRef(false);

  const activeAssignmentsQuery = useQuery({
    queryKey: ["active-assignments"],
    queryFn: () => accommodationService.getAllActiveAssignments(),
    enabled: open,
    staleTime: 60 * 1000,
  });

  const roomNumber = useMemo(() => room?.number ?? roomLabel, [room, roomLabel]);
  const availableSpots = useMemo(() => {
    if (!room) return 0;
    const fromAssignments = Math.max(0, room.capacity - assignments.length);
    const fromRoom = getRoomAvailableSpots(room);
    return Math.min(fromAssignments, fromRoom);
  }, [room, assignments.length]);

  const roomDisabled = !room?.is_active;
  const listEnabled = open && !!room && !roomDisabled && availableSpots > 0;

  const assignedStudentIds = useMemo(() => {
    const ids = new Set<number>();
    for (const assignment of activeAssignmentsQuery.data?.results ?? []) {
      const studentId = getAssignmentStudentId(assignment);
      if (studentId !== null) ids.add(studentId);
    }
    return ids;
  }, [activeAssignmentsQuery.data]);

  const searchTerm = debouncedSearch.trim();

  const studentsInfiniteQuery = useInfiniteQuery({
    queryKey: ["students-without-room", { search: searchTerm }],
    queryFn: ({ pageParam }) =>
      studentService.getStudents({
        has_room: false,
        page: pageParam,
        page_size: PAGE_SIZE,
        ...(searchTerm ? { search: searchTerm } : {}),
      }),
    initialPageParam: 1,
    getNextPageParam: getStudentsNextPageParam,
    enabled: listEnabled,
    staleTime: 30 * 1000,
  });

  const pages = studentsInfiniteQuery.data?.pages ?? [];

  const paginationMeta = useMemo(() => {
    const lastPage = pages[pages.length - 1];
    const rawLoadedCount = pages.reduce((sum, page) => sum + page.results.length, 0);
    const totalCount = pages[0]?.count ?? 0;
    const hasNextPage = Boolean(studentsInfiniteQuery.hasNextPage);

    return {
      lastPage,
      rawLoadedCount,
      totalCount,
      hasNextPage,
      reachedEnd: pages.length > 0 && !hasNextPage,
    };
  }, [pages, studentsInfiniteQuery.hasNextPage]);

  const studentsWithoutRoom = useMemo(() => {
    const seen = new Set<number>();
    const merged: Student[] = [];

    for (const page of pages) {
      for (const student of page.results) {
        if (seen.has(student.id)) continue;
        seen.add(student.id);
        if (isStudentWithoutRoom(student, assignedStudentIds)) {
          merged.push(student);
        }
      }
    }

    return merged;
  }, [pages, assignedStudentIds]);

  const assignMutation = useMutation({
    mutationFn: async () => {
      if (!room || selectedStudentId === "") {
        throw new Error("Seleccione un estudiante.");
      }
      await accommodationService.createAssignment({
        student: selectedStudentId,
        room: room.id,
        assigned_date: todayIsoDate(),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      await queryClient.invalidateQueries({ queryKey: ["students-without-room"] });
      toast.success("Estudiante asignado", {
        description: "El estudiante quedó registrado en el cuarto seleccionado.",
      });
      onAssigned?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo registrar la asignación", {
        description: getErrorMessage(error, "Verifique que el estudiante no tenga otra plaza activa."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      assignMutation.reset();
      return;
    }
    setSearch("");
    setDebouncedSearch("");
    setSelectedStudentId("");
    loadMoreLockRef.current = false;
  }, [open]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setSelectedStudentId("");
    listRef.current?.scrollTo({ top: 0 });
    loadMoreLockRef.current = false;
  }, [debouncedSearch]);

  const isSearchPending = search !== debouncedSearch;

  const loadMoreStudents = useCallback(async () => {
    if (!paginationMeta.hasNextPage) return;
    if (studentsInfiniteQuery.isFetchingNextPage || loadMoreLockRef.current) return;

    loadMoreLockRef.current = true;
    try {
      await studentsInfiniteQuery.fetchNextPage();
    } finally {
      loadMoreLockRef.current = false;
    }
  }, [
    paginationMeta.hasNextPage,
    studentsInfiniteQuery.isFetchingNextPage,
    studentsInfiniteQuery.fetchNextPage,
  ]);

  const handleListScroll = useCallback(() => {
    const element = listRef.current;
    if (!element || !paginationMeta.hasNextPage) return;

    const distanceToBottom = element.scrollHeight - element.scrollTop - element.clientHeight;
    if (distanceToBottom <= SCROLL_LOAD_THRESHOLD_PX) {
      void loadMoreStudents();
    }
  }, [loadMoreStudents, paginationMeta.hasNextPage]);

  useEffect(() => {
    if (
      !listEnabled ||
      isSearchPending ||
      studentsInfiniteQuery.isLoading ||
      studentsInfiniteQuery.isFetchingNextPage ||
      !paginationMeta.hasNextPage ||
      pages.length === 0 ||
      pages.length >= MAX_EMPTY_AUTO_PAGES
    ) {
      return;
    }

    const element = listRef.current;
    if (!element) return;

    const isScrollable = element.scrollHeight > element.clientHeight + 1;
    const shouldPrefetchEmptyPage = studentsWithoutRoom.length === 0;
    const shouldFillShortList = !isScrollable && studentsWithoutRoom.length > 0;

    if (shouldPrefetchEmptyPage || shouldFillShortList) {
      void loadMoreStudents();
    }
  }, [
    listEnabled,
    isSearchPending,
    studentsWithoutRoom.length,
    studentsInfiniteQuery.isLoading,
    studentsInfiniteQuery.isFetchingNextPage,
    paginationMeta.hasNextPage,
    pages.length,
    loadMoreStudents,
  ]);

  const isPending = assignMutation.isPending;
  const canSubmit = selectedStudentId !== "" && availableSpots > 0;
  const isInitialLoading =
    studentsInfiniteQuery.isLoading ||
    (studentsInfiniteQuery.isFetching && !studentsInfiniteQuery.isFetchingNextPage && studentsWithoutRoom.length === 0);
  const showEmpty =
    !isInitialLoading &&
    !isSearchPending &&
    !studentsInfiniteQuery.isFetchingNextPage &&
    studentsWithoutRoom.length === 0 &&
    paginationMeta.reachedEnd &&
    !studentsInfiniteQuery.isError;

  const listFooter = (() => {
    if (studentsInfiniteQuery.isFetchingNextPage) {
      return (
        <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--color-on-surface-variant)]">
          <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
          Cargando más estudiantes...
        </div>
      );
    }

    if (studentsInfiniteQuery.isFetchNextPageError) {
      return (
        <div className="flex flex-col items-center gap-2 py-3">
          <p className="text-xs text-[var(--color-error)]">No se pudieron cargar más resultados.</p>
          <button
            type="button"
            className="cursor-pointer text-xs font-semibold text-[var(--color-primary)] hover:underline"
            onClick={() => void studentsInfiniteQuery.fetchNextPage()}
          >
            Reintentar
          </button>
        </div>
      );
    }

    if (paginationMeta.hasNextPage) {
      return (
        <p className="py-2 text-center text-[10px] text-[var(--color-outline)]">Desplácese para ver más</p>
      );
    }

    if (studentsWithoutRoom.length > 0) {
      return (
        <p className="py-2 text-center text-[10px] text-[var(--color-outline)]">Fin del listado</p>
      );
    }

    return null;
  })();

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="flex w-full min-w-0 flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-lowest)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                person_add
              </span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-xl font-extrabold text-[var(--color-on-surface)]">
                Registrar estudiante
              </h3>
              <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                Asignar un estudiante sin ubicación al {roomNumber}.
              </p>
            </div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </header>

        <div className="space-y-5 p-6">
          <div className="rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Plazas disponibles</p>
            <p className="mt-0.5 text-sm font-semibold text-[var(--color-on-surface)]">
              {availableSpots > 0
                ? `${availableSpots} de ${room?.capacity ?? "—"}`
                : "Sin plazas libres en este cuarto"}
            </p>
          </div>

          {roomDisabled ? (
            <div className="flex items-start gap-3 rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] p-4">
              <span className="material-symbols-outlined text-[var(--color-outline)]">block</span>
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Este cuarto está clausurado. Reactive el cuarto antes de registrar estudiantes.
              </p>
            </div>
          ) : availableSpots === 0 ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <span className="material-symbols-outlined text-amber-600">info</span>
              <p className="text-sm font-medium text-amber-900">
                El cuarto alcanzó su capacidad máxima. Libere una plaza o permute estudiantes para continuar.
              </p>
            </div>
          ) : (
            <>
              <SearchField
                value={search}
                onChange={setSearch}
                placeholder="Buscar por nombre, CI o carné..."
              />

              <div>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                    Estudiantes sin ubicación
                  </label>
                  {!isInitialLoading && paginationMeta.totalCount > 0 ? (
                    <span className="text-[10px] font-medium text-[var(--color-outline)]">
                      {studentsWithoutRoom.length} mostrados
                      {paginationMeta.reachedEnd
                        ? ` · ${paginationMeta.totalCount} en total`
                        : ` · cargando de ${paginationMeta.totalCount}`}
                    </span>
                  ) : null}
                </div>

                {studentsInfiniteQuery.isError && studentsWithoutRoom.length === 0 ? (
                  <p className="text-sm text-[var(--color-error)]">No se pudo cargar el listado de estudiantes.</p>
                ) : isInitialLoading || isSearchPending ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div
                        key={`student-skeleton-${index}`}
                        className="h-14 animate-pulse rounded-xl bg-[var(--color-surface-container-low)]"
                      />
                    ))}
                  </div>
                ) : showEmpty ? (
                  <p className="rounded-xl bg-[var(--color-surface-container-low)] px-4 py-6 text-center text-sm text-[var(--color-on-surface-variant)]">
                    {searchTerm
                      ? "No hay coincidencias con la búsqueda."
                      : "No hay estudiantes sin ubicación disponibles."}
                  </p>
                ) : (
                  <div
                    ref={listRef}
                    onScroll={handleListScroll}
                    className="max-h-[min(16rem,40vh)] space-y-2 overflow-y-auto pr-1"
                  >
                    {studentsWithoutRoom.map((student) => {
                      const isSelected = selectedStudentId === student.id;
                      return (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => setSelectedStudentId(student.id)}
                          className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                            isSelected
                              ? "border-[var(--color-primary)] bg-[var(--color-primary-selected)]"
                              : "border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-primary)]/40"
                          }`}
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[10px] font-bold text-[var(--color-primary)]">
                            {getStudentInitials(student.full_name)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm ${isSelected ? "font-bold text-[var(--color-on-surface)]" : "font-medium text-[var(--color-on-surface-variant)]"}`}
                            >
                              {student.full_name}
                            </p>
                            <p className="truncate text-[11px] text-[var(--color-outline)]">
                              {student.student_id} · {student.ci}
                            </p>
                          </div>
                          {isSelected ? (
                            <span className="material-symbols-outlined shrink-0 text-[var(--color-primary)]">
                              check_circle
                            </span>
                          ) : null}
                        </button>
                      );
                    })}

                    {listFooter}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="confirm"
            onClick={() => assignMutation.mutate()}
            disabled={isPending || !canSubmit || roomDisabled}
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Registrando..." : "Confirmar asignación"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
