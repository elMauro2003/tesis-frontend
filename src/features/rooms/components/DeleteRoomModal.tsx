"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { infrastructureCascadeService } from "@/core/services/infrastructureCascade.service";
import { getCascadeErrorMessage } from "@/core/services/infrastructureCascade.errors";
import { Room } from "@/types/models";

interface DeleteRoomModalProps {
  room: Room | null;
  roomLabel: string;
  assignmentCount: number;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

export function DeleteRoomModal({
  room,
  roomLabel,
  assignmentCount,
  open,
  onClose,
  onDeleted,
}: DeleteRoomModalProps) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["room-deletion-summary", room?.id],
    queryFn: () => infrastructureCascadeService.getRoomDeletionSummary(room!.id),
    enabled: open && !!room,
    staleTime: 15 * 1000,
  });

  const summary = summaryQuery.data;
  const canDelete = summary?.canDelete ?? assignmentCount === 0;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      await infrastructureCascadeService.deleteRoomWithDependents(room.id);
    },
    onSuccess: async () => {
      if (room) {
        queryClient.removeQueries({ queryKey: ["room-detail", room.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["rooms-all"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      await queryClient.invalidateQueries({ queryKey: ["room-deletion-summary"] });
      toast.success("Cuarto eliminado", {
        description: "El cuarto y sus cuartelerías fueron removidos correctamente.",
      });
      onDeleted?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar el cuarto", {
        description: getCascadeErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) deleteMutation.reset();
  }, [open]);

  const roomNumber = useMemo(() => room?.number ?? roomLabel, [room, roomLabel]);

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-4 bg-red-50 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-extrabold leading-tight text-red-900">Eliminar Cuarto</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
              Se eliminarán las cuartelerías antes de quitar el cuarto.
            </p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3 rounded-xl bg-[var(--color-surface-container-low)] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuarto</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{roomNumber}</p>
            </div>
            {summaryQuery.isLoading ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">Consultando dependencias...</p>
            ) : !canDelete ? (
              <p className="text-sm text-amber-900">
                Este cuarto tiene asignaciones registradas
                {summary?.assignmentRecordCount ? ` (${summary.assignmentRecordCount})` : ""}. La API no permite eliminarlo mientras exista historial de asignaciones.
              </p>
            ) : summary && summary.roomDutyCount > 0 ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Se eliminarán {summary.roomDutyCount} cuartelería{summary.roomDutyCount === 1 ? "" : "s"} asociadas antes de quitar el cuarto.
              </p>
            ) : null}
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Si necesita conservar el historial, considere clausurar el cuarto en lugar de eliminarlo.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={!canDelete || deleteMutation.isPending || summaryQuery.isLoading}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar cuarto"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
