"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Room } from "@/types/models";

interface CloseRoomModalProps {
  room: Room | null;
  roomLabel: string;
  open: boolean;
  onClose: () => void;
  onClosed?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

export function CloseRoomModal({ room, roomLabel, open, onClose, onClosed }: CloseRoomModalProps) {
  const queryClient = useQueryClient();

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      await infrastructureService.updateRoom(room.id, { is_active: false });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      toast.success("Cuarto clausurado", {
        description: "El cuarto quedó fuera de servicio sin eliminar su historial.",
      });
      onClosed?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo clausurar el cuarto", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) closeMutation.reset();
  }, [open]);

  const roomNumber = useMemo(() => room?.number ?? roomLabel, [room, roomLabel]);

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-4 bg-[var(--color-tertiary-fixed)]/30 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]">
            <span className="material-symbols-outlined text-2xl">block</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-extrabold leading-tight text-[var(--color-tertiary)]">
              Clausurar Cuarto
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
              El cuarto dejará de estar disponible para nuevas asignaciones.
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

        <div className="space-y-4 p-6">
          <div className="rounded-xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuarto</p>
            <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{roomNumber}</p>
          </div>
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Puede reactivarlo más adelante desde la edición del cuarto.
          </p>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={closeMutation.isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={() => closeMutation.mutate()} disabled={closeMutation.isPending}>
            {closeMutation.isPending ? "Clausurando..." : "Clausurar cuarto"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
