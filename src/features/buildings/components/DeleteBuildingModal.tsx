"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import {
  BuildingDeletionSummary,
  infrastructureCascadeService,
} from "@/core/services/infrastructureCascade.service";
import { FetchError } from "@/lib/fetchClient";
import { Building } from "@/types/models";

interface DeleteBuildingModalProps {
  building: Building | null;
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

const emptySummary: BuildingDeletionSummary = {
  wingCount: 0,
  roomCount: 0,
  activeAssignmentCount: 0,
  roomDutyCount: 0,
  supervisorCount: 0,
};

export function DeleteBuildingModal({ building, open, onClose, onDeleted }: DeleteBuildingModalProps) {
  const queryClient = useQueryClient();

  const summaryQuery = useQuery({
    queryKey: ["building-deletion-summary", building?.id],
    queryFn: () => infrastructureCascadeService.getBuildingDeletionSummary(building!.id),
    enabled: open && !!building,
    staleTime: 15 * 1000,
  });

  const summary = summaryQuery.data ?? emptySummary;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!building) {
        return;
      }

      await infrastructureCascadeService.deleteBuildingWithDependents(building.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["buildings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["wings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms-all"] }),
        queryClient.invalidateQueries({ queryKey: ["rooms"] }),
        queryClient.invalidateQueries({ queryKey: ["sites"] }),
        queryClient.invalidateQueries({ queryKey: ["active-assignments"] }),
        queryClient.invalidateQueries({ queryKey: ["wing-supervisors"] }),
        queryClient.invalidateQueries({ queryKey: ["building-deletion-summary"] }),
      ]);
      toast.success("Edificio eliminado", {
        description: "El edificio y sus recursos dependientes fueron removidos correctamente.",
      });
      onDeleted?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar el edificio", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      deleteMutation.reset();
    }
  }, [open]);

  const buildingName = useMemo(() => building?.name ?? "Edificio", [building]);
  const buildingGender = useMemo(() => building?.gender ?? "Tipo no definido", [building]);

  return (
    <BottomSheet open={open && !!building} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-red-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-red-900 leading-tight font-headline">Eliminar Edificio</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
              Esta acción eliminará el edificio y limpiará automáticamente sus dependencias.
            </p>
          </div>
          <button type="button" className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="bg-[var(--color-surface-container-low)] rounded-xl p-4 space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificio</p>
              <p className="mt-1 text-sm font-semibold text-[var(--color-on-surface)]">{buildingName}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Tipo de bloque</p>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{buildingGender}</p>
            </div>
            {summaryQuery.isLoading ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">Calculando dependencias...</p>
            ) : summaryQuery.isError ? (
              <p className="text-sm text-[var(--color-error)]">No se pudieron consultar las dependencias del edificio.</p>
            ) : (
              <>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Alas asociadas</p>
                  <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{summary.wingCount} ala{summary.wingCount === 1 ? "" : "s"}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuartos asociados</p>
                  <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{summary.roomCount} cuarto{summary.roomCount === 1 ? "" : "s"}</p>
                </div>
                {summary.activeAssignmentCount > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Asignaciones activas</p>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{summary.activeAssignmentCount}</p>
                  </div>
                ) : null}
                {summary.supervisorCount > 0 ? (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Responsables de ala</p>
                    <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{summary.supervisorCount}</p>
                  </div>
                ) : null}
              </>
            )}
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-red-700">Efecto en cascada</p>
            <p className="mt-2 text-sm text-red-900 leading-relaxed">
              Se eliminarán en orden las asignaciones activas, cuartelerías, cuartos, responsables de ala y alas antes de quitar el edificio.
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
            disabled={!building || deleteMutation.isPending || summaryQuery.isLoading}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar edificio"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}

export default DeleteBuildingModal;
