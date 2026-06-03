"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { accommodationService } from "@/core/services/accommodation.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Building, Room, RoomAssignment, Site, Wing } from "@/types/models";
import { getBuildingSiteId, getNumericId } from "@/features/rooms/utils/roomLabels";
import { getRoomAvailableSpots, isRoomSelectable } from "@/features/rooms/utils/roomStatus";

interface PermuteRoomModalProps {
  room: Room | null;
  sourceLocationLabel: string;
  assignments: RoomAssignment[];
  sites: Site[];
  buildings: Building[];
  wings: Wing[];
  open: boolean;
  onClose: () => void;
  onPermuted?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const getAssignmentStudentId = (assignment: RoomAssignment): number | null =>
  getNumericId(assignment.student);

export function PermuteRoomModal({
  room,
  sourceLocationLabel,
  assignments,
  sites,
  buildings,
  wings,
  open,
  onClose,
  onPermuted,
}: PermuteRoomModalProps) {
  const queryClient = useQueryClient();
  const [assignmentId, setAssignmentId] = useState<number | "">("");
  const [siteId, setSiteId] = useState<number | "">("");
  const [buildingId, setBuildingId] = useState<number | "">("");
  const [targetRoomId, setTargetRoomId] = useState<number | "">("");

  const selectedAssignment = useMemo(
    () => assignments.find((a) => a.id === assignmentId) ?? null,
    [assignments, assignmentId]
  );

  const buildingsForSite = useMemo(() => {
    if (siteId === "") return buildings;
    return buildings.filter((b) => getBuildingSiteId(b) === siteId);
  }, [buildings, siteId]);

  const destinationRoomsQuery = useQuery({
    queryKey: ["rooms-permute-dest", buildingId, room?.id],
    queryFn: () =>
      infrastructureService.getRooms({
        wing__building: buildingId === "" ? undefined : buildingId,
        is_active: true,
        page_size: 100,
      }),
    enabled: open && buildingId !== "",
    staleTime: 30 * 1000,
  });

  const destinationRoomOptions = useMemo(() => {
    const results = destinationRoomsQuery.data?.results ?? [];
    return results.filter((candidate) => {
      if (room && candidate.id === room.id) return false;
      return isRoomSelectable(candidate);
    });
  }, [destinationRoomsQuery.data, room]);

  const permuteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAssignment || targetRoomId === "") {
        throw new Error("Seleccione estudiante y cuarto destino.");
      }
      const studentId = getAssignmentStudentId(selectedAssignment);
      if (studentId === null) {
        throw new Error("No se pudo identificar al estudiante de la asignación.");
      }
      await accommodationService.transferStudentAssignment(
        selectedAssignment.id,
        studentId,
        Number(targetRoomId)
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      toast.success("Permuta realizada", {
        description: "El estudiante fue trasladado al cuarto destino.",
      });
      onPermuted?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo completar la permuta", {
        description: getErrorMessage(error, "Verifique disponibilidad e intente de nuevo."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      permuteMutation.reset();
      return;
    }
    setAssignmentId(assignments.length === 1 ? assignments[0].id : "");
    setSiteId("");
    setBuildingId("");
    setTargetRoomId("");
  }, [open, assignments]);

  const sourceTitle = room?.number ?? "Cuarto origen";
  const isPending = permuteMutation.isPending;

  const handleBuildingChange = (value: string) => {
    setBuildingId(value ? Number(value) : "");
    setTargetRoomId("");
  };

  const handleSiteChange = (value: string) => {
    setSiteId(value ? Number(value) : "");
    setBuildingId("");
    setTargetRoomId("");
  };

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-3xl">
      <div className="flex w-full min-w-0 flex-col">
        <div className="flex items-center justify-between border-b border-[var(--color-outline-variant)]/15 p-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center rounded-xl bg-[var(--color-primary-selected)] p-2 text-[var(--color-primary)]">
              <span className="material-symbols-outlined">swap_horiz</span>
            </div>
            <h3 className="font-headline text-xl font-extrabold text-[var(--color-primary-dark)]">
              Permutar estudiante
            </h3>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="w-full min-w-0 space-y-6 bg-[var(--color-surface-container-low)]/40 p-6">
          <div className="grid w-full min-w-0 grid-cols-1 items-stretch gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
            <div className="min-w-0 rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                Ubicación actual
              </p>
              <p className="font-bold text-[var(--color-on-surface)]">{sourceTitle}</p>
              <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">{sourceLocationLabel}</p>
              <div className="mt-4 space-y-1.5">
                <label className="text-[11px] font-bold uppercase text-[var(--color-on-surface-variant)]">
                  Estudiante a trasladar
                </label>
                <Select
                  value={assignmentId === "" ? "" : String(assignmentId)}
                  onValueChange={(value) => setAssignmentId(Number(value))}
                  disabled={assignments.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Seleccione un estudiante" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignments.map((assignment) => (
                      <SelectItem key={assignment.id} value={String(assignment.id)}>
                        {assignment.student_name ?? `Estudiante #${getAssignmentStudentId(assignment) ?? assignment.id}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div
              className="mx-auto flex h-10 w-10 shrink-0 items-center justify-center self-center rounded-full border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] shadow-md md:mx-0"
              aria-hidden
            >
              <span className="material-symbols-outlined">sync_alt</span>
            </div>

            <div className="min-w-0 rounded-xl border-2 border-[var(--color-primary)]/15 bg-[var(--color-primary-selected)]/30 p-5 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--color-primary)]">
                Nueva ubicación
              </p>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[var(--color-primary)]">Sede destino</label>
                  <Select value={siteId === "" ? "" : String(siteId)} onValueChange={handleSiteChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((site) => (
                        <SelectItem key={site.id} value={String(site.id)}>
                          {site.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[var(--color-primary)]">Edificio destino</label>
                  <Select
                    value={buildingId === "" ? "" : String(buildingId)}
                    onValueChange={handleBuildingChange}
                    disabled={siteId === ""}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleccione edificio" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildingsForSite.map((building) => (
                        <SelectItem key={building.id} value={String(building.id)}>
                          {building.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase text-[var(--color-primary)]">Cuarto disponible</label>
                  <Select
                    value={targetRoomId === "" ? "" : String(targetRoomId)}
                    onValueChange={(value) => setTargetRoomId(Number(value))}
                    disabled={buildingId === "" || destinationRoomsQuery.isLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder={
                          destinationRoomsQuery.isLoading
                            ? "Cargando cuartos..."
                            : "Seleccione cuarto destino"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {destinationRoomOptions.length === 0 ? (
                        <SelectItem value="__none" disabled>
                          Sin cuartos con plazas libres
                        </SelectItem>
                      ) : (
                        destinationRoomOptions.map((candidate) => {
                          const free = getRoomAvailableSpots(candidate);
                          const wing =
                            typeof candidate.wing === "object" && candidate.wing
                              ? candidate.wing.name
                              : wings.find((w) => w.id === candidate.wing)?.name;
                          return (
                            <SelectItem key={candidate.id} value={String(candidate.id)}>
                              {candidate.number}
                              {wing ? ` · ${wing}` : ""} ({free} {free === 1 ? "libre" : "libres"})
                            </SelectItem>
                          );
                        })
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-amber-200/80 bg-amber-50 p-3">
            <span className="material-symbols-outlined text-lg text-amber-600">info</span>
            <p className="text-xs leading-relaxed text-amber-900">
              Se liberará la plaza actual del estudiante y se creará una asignación activa en el cuarto destino. La
              ocupación de ambos cuartos se actualiza en el servidor.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="confirm"
            onClick={() => permuteMutation.mutate()}
            disabled={isPending || assignmentId === "" || targetRoomId === ""}
          >
            <span className="material-symbols-outlined text-lg">swap_horiz</span>
            {isPending ? "Ejecutando permuta..." : "Ejecutar permuta"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
