"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Room } from "@/types/models";

interface DeleteRoomModalProps {
  room: Room | null;
  roomLabel: string;
  assignmentCount: number;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

export function DeleteRoomModal({
  room,
  roomLabel,
  assignmentCount,
  open,
  onClose,
  onDeleted,
}: DeleteRoomModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      await infrastructureService.deleteRoom(room.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["rooms-all"] });
      toast.success("Cuarto eliminado", {
        description: "El cuarto fue removido del sistema correctamente.",
      });
      onDeleted?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar el cuarto", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
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
              Esta acción no se puede deshacer desde la interfaz.
            </p>
          </div>
          <button
            type="button"
            className="cursor-pointer text-[var(--color-outline)] transition-colors hover:text-[var(--color-on-surface)]"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-3 rounded-xl bg-[var(--color-surface-container-low)] p-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuarto</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{roomNumber}</p>
            </div>
            {assignmentCount > 0 ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">
                Tiene {assignmentCount} asignación{assignmentCount === 1 ? "" : "es"} activa
                {assignmentCount === 1 ? "" : "s"}. Libere las plazas antes de eliminar si el sistema lo requiere.
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
          <Button type="button" variant="destructive" onClick={() => deleteMutation.mutate()} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar cuarto"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
