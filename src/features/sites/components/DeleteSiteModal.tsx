"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { infrastructureCascadeService } from "@/core/services/infrastructureCascade.service";
import { getCascadeErrorMessage } from "@/core/services/infrastructureCascade.errors";
import { Site } from "@/types/models";

interface DeleteSiteModalProps {
  site: Site | null;
  open: boolean;
  onClose: () => void;
}

const getErrorMessage = getCascadeErrorMessage;

export function DeleteSiteModal({ site, open, onClose }: DeleteSiteModalProps) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["site-deletion-summary", site?.id],
    queryFn: () => infrastructureCascadeService.getSiteDeletionSummary(site!.id),
    enabled: open && !!site,
    staleTime: 15 * 1000,
  });

  const summary = summaryQuery.data;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!site) {
        return;
      }

      await infrastructureCascadeService.deleteSiteWithDependents(site.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["sites"] }),
        queryClient.invalidateQueries({ queryKey: ["buildings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["wings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms-all"] }),
        queryClient.invalidateQueries({ queryKey: ["active-assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["wing-supervisors"] }),
        queryClient.invalidateQueries({ queryKey: ["site-deletion-summary"] }),
      ]);
      toast.success("Sede eliminada", {
        description: "La sede y sus recursos dependientes fueron removidos correctamente.",
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
  const buildingCount = summary?.buildingCount ?? site?.building_count ?? 0;
  const wingCount = summary?.wingCount ?? 0;
  const roomCount = summary?.roomCount ?? 0;

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
            {summaryQuery.isLoading ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">Calculando dependencias...</p>
            ) : summaryQuery.isError ? (
              <p className="text-sm text-[var(--color-error)]">No se pudieron consultar las dependencias de la sede.</p>
            ) : summary ? (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Alas y cuartos</p>
                  <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                    {wingCount} ala{wingCount === 1 ? "" : "s"} · {roomCount} cuarto{roomCount === 1 ? "" : "s"}
                  </p>
                </div>
                {summary.activeAssignmentCount > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Asignaciones activas</p>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{summary.activeAssignmentCount}</p>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>

          {!summaryQuery.isLoading && summary && !summary.canDelete ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <span className="material-symbols-outlined text-amber-600">block</span>
              <p className="text-sm text-amber-900">
                Hay cuartos con asignaciones registradas ({summary.blockedRoomNumbers.join(", ")}). La sede no puede eliminarse mientras existan esas dependencias.
              </p>
            </div>
          ) : (
            <div className="rounded-xl bg-red-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Efecto en cascada</p>
              <p className="mt-2 text-sm text-red-900 leading-relaxed">
                Se eliminarán edificios, alas, cuartelerías y cuartos sin historial antes de quitar la sede.
              </p>
            </div>
          )}

          <p className="text-sm text-[var(--color-on-surface-variant)] leading-relaxed">
            Esta operación no se puede deshacer desde la interfaz. Si necesita conservar información, realice una revisión previa de la estructura territorial.
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
            disabled={!site || !summary?.canDelete || deleteMutation.isPending || summaryQuery.isLoading}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar sede"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}