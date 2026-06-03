"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { accommodationService } from "@/core/services/accommodation.service";
import { FetchError } from "@/lib/fetchClient";
import { Room, RoomAssignment } from "@/types/models";
import { getStudentInitials } from "@/features/rooms/utils/roomLabels";

interface ReleaseAssignmentsModalProps {
  room: Room | null;
  roomLabel: string;
  assignments: RoomAssignment[];
  open: boolean;
  onClose: () => void;
  onReleased?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const getStudentLabel = (assignment: RoomAssignment) =>
  assignment.student_name ?? `Estudiante #${assignment.id}`;

export function ReleaseAssignmentsModal({
  room,
  roomLabel,
  assignments,
  open,
  onClose,
  onReleased,
}: ReleaseAssignmentsModalProps) {
  const queryClient = useQueryClient();
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | "">("");
  const [justification, setJustification] = useState("");

  const releaseMutation = useMutation({
    mutationFn: async () => {
      if (selectedAssignmentId === "") {
        throw new Error("Seleccione un estudiante.");
      }
      if (!justification.trim()) {
        throw new Error("La justificación es obligatoria.");
      }
      await accommodationService.releaseAssignment(selectedAssignmentId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      toast.success("Revocación confirmada", {
        description: "La plaza del estudiante quedó liberada correctamente.",
      });
      onReleased?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo revocar la asignación", {
        description: getErrorMessage(
          error,
          "El servidor rechazó la liberación. Verifique que la asignación siga activa."
        ),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      releaseMutation.reset();
      return;
    }
    setSelectedAssignmentId(assignments.length === 1 ? assignments[0].id : "");
    setJustification("");
  }, [open, assignments]);

  const roomNumber = useMemo(() => room?.number ?? roomLabel, [room, roomLabel]);
  const isPending = releaseMutation.isPending;
  const canSubmit = selectedAssignmentId !== "" && justification.trim().length >= 10;

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="flex w-full min-w-0 flex-col">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-lowest)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <span className="material-symbols-outlined text-2xl">do_not_disturb_on</span>
            </div>
            <div>
              <h3 className="font-headline text-xl font-extrabold text-[var(--color-on-surface)]">
                Revocar derecho de residencia
              </h3>
              <p className="mt-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                Retirar la asignación de cuarto en {roomNumber}.
              </p>
            </div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </header>

        <div className="space-y-6 p-6">
          <div>
            <label className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
              Seleccione estudiante afectado
            </label>
            <div className="space-y-2">
              {assignments.map((assignment) => {
                const isSelected = selectedAssignmentId === assignment.id;
                const name = getStudentLabel(assignment);
                return (
                  <button
                    key={assignment.id}
                    type="button"
                    onClick={() => setSelectedAssignmentId(assignment.id)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-red-500 bg-red-50/40"
                        : "border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] hover:border-red-300"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-light)] text-[10px] font-bold text-[var(--color-primary)]">
                      {getStudentInitials(name)}
                    </div>
                    <span
                      className={`text-sm ${isSelected ? "font-bold text-[var(--color-on-surface)]" : "font-medium text-[var(--color-on-surface-variant)]"}`}
                    >
                      {name}
                    </span>
                    {isSelected ? (
                      <span className="material-symbols-outlined ml-auto text-red-600">check_circle</span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label
              htmlFor="revoke-justification"
              className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-red-600"
            >
              Justificación de la medida
            </label>
            <Textarea
              id="revoke-justification"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              placeholder="Especifique el motivo (incumplimiento de reglamento, fin de beca, sanción disciplinaria...)"
              rows={3}
              className="rounded-xl border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] text-sm"
            />
            <p className="mt-1.5 text-[11px] text-[var(--color-on-surface-variant)]">Mínimo 10 caracteres.</p>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <span className="material-symbols-outlined text-xl text-red-600">warning</span>
            <p className="text-[11px] font-medium leading-relaxed text-red-800">
              Atención: esta acción liberará la plaza y el estudiante perderá el acceso al edificio hasta una nueva
              asignación.
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => releaseMutation.mutate()}
            disabled={isPending || !canSubmit}
          >
            <span className="material-symbols-outlined text-lg">do_not_disturb_on</span>
            {isPending ? "Revocando..." : "Confirmar revocación"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
