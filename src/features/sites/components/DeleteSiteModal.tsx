"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Site } from "@/types/models";

interface DeleteSiteModalProps {
  site: Site | null;
  open: boolean;
  onClose: () => void;
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

export function DeleteSiteModal({ site, open, onClose }: DeleteSiteModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!site) {
        return;
      }

      await infrastructureService.deleteSite(site.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Sede eliminada", {
        description: "La sede fue removida del sistema correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar la sede", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      deleteMutation.reset();
    }
  }, [open]);

  const siteName = useMemo(() => site?.name ?? "Sede", [site]);
  const siteAddress = useMemo(() => site?.address ?? "Dirección no registrada", [site]);
  const buildingCount = useMemo(() => site?.building_count ?? 0, [site]);
  const wingCountLabel = buildingCount > 0 ? "alas y cuartos" : "alas y cuartos";

  return (
    <BottomSheet open={open && !!site} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-red-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-red-900 leading-tight font-headline">Eliminar Sede</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">Esta acción eliminará la sede y todo su contenido relacionado.</p>
          </div>
          <button type="button" className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[var(--color-surface-container-low)] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Sede</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{siteName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Dirección</p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{siteAddress}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificios asociados</p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{buildingCount} edificio{buildingCount === 1 ? "" : "s"}</p>
            </div>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Efecto en cascada</p>
            <p className="mt-2 text-sm text-red-900 leading-relaxed">
              Si elimina esta sede, también se perderán sus {buildingCount} edificio{buildingCount === 1 ? "" : "s"}, junto con sus {wingCountLabel} vinculadas. Confirme antes de continuar.
            </p>
          </div>

          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Esta operación no se puede deshacer desde la interfaz. Si necesita conservar información, realice una revisión previa de la estructura territorial.
          </p>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-6 flex justify-end items-center gap-3 bg-[var(--color-surface-container-lowest)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => deleteMutation.mutate()}
            disabled={!site || deleteMutation.isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 shadow-[0_14px_24px_rgba(186,26,26,0.18)] hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar sede"}
          </button>
        </footer>
      </div>
    </BottomSheet>
  );
}