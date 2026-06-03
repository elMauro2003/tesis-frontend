"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Wing } from "@/types/models";

interface DeleteWingModalProps {
  wing: Wing | null;
  buildingName?: string;
  roomCount: number;
  open: boolean;
  onClose: () => void;
  onDeleted?: () => void;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export function DeleteWingModal({ wing, buildingName, roomCount, open, onClose, onDeleted }: DeleteWingModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!wing) {
        return;
      }

      await infrastructureService.deleteWing(wing.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms-all-active"] }),
        queryClient.invalidateQueries({ queryKey: ["buildings-all"] }),
      ]);
      toast.success("Ala eliminada", {
        description: "La ala fue removida del sistema correctamente.",
      });
      onDeleted?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar la ala", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      deleteMutation.reset();
    }
  }, [open]);

  const wingName = useMemo(() => wing?.name ?? "Ala", [wing]);
  const resolvedBuildingName = useMemo(() => buildingName ?? "Edificio", [buildingName]);

  return (
    <BottomSheet open={open && !!wing} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-red-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-red-900 leading-tight font-headline">Eliminar ala</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Esta acción eliminará el ala y todo su contenido relacionado.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[var(--color-surface-container-low)] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Ala</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{wingName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificio</p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{resolvedBuildingName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuartos asociados</p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{roomCount} cuarto{roomCount === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Efecto en cascada</p>
            <p className="mt-2 text-sm text-red-900 leading-relaxed">
              Si elimina esta ala, también se perderán sus {roomCount} cuarto{roomCount === 1 ? "" : "s"} vinculados. Confirme antes de continuar.
            </p>
          </div>

          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Esta operación no se puede deshacer desde la interfaz.
          </p>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-6 flex justify-end items-center gap-3 bg-[var(--color-surface-container-lowest)]">
          <Button type="button" variant="cancel" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            disabled={!wing || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar ala"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}

export default DeleteWingModal;