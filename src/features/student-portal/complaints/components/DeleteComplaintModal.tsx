"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { complaintService } from "@/core/services/complaint.service";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  formatComplaintDate,
  getBuildingLabel,
  getComplaintTitle,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";

interface DeleteComplaintModalProps {
  complaint: Complaint | null;
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

export function DeleteComplaintModal({ complaint, open, onClose }: DeleteComplaintModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!complaint) {
        return;
      }

      await complaintService.deleteComplaint(complaint.id);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal", "complaints"] }),
        queryClient.invalidateQueries({ queryKey: ["portal", "complaints", "daily-quota"] }),
      ]);
      toast.success("Queja eliminada", {
        description: "Su solicitud fue retirada correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar la queja", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      deleteMutation.reset();
    }
  }, [open]);

  const title = useMemo(
    () => (complaint ? getComplaintTitle(complaint.description) : "Queja"),
    [complaint]
  );

  const dateLabel = useMemo(
    () => (complaint ? formatComplaintDate(complaint.date) : ""),
    [complaint]
  );

  const typeLabel = useMemo(
    () => (complaint ? COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type : ""),
    [complaint]
  );

  const statusLabel = useMemo(
    () => (complaint ? COMPLAINT_STATUS_LABELS[complaint.status] : ""),
    [complaint]
  );

  const locationLabel = useMemo(
    () => (complaint ? getBuildingLabel(complaint) : ""),
    [complaint]
  );

  return (
    <BottomSheet open={open && !!complaint} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-4 bg-error-container/40 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-error-container text-error">
            <span className="material-symbols-outlined text-2xl">delete_forever</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-lg font-extrabold leading-tight text-error">
              Eliminar queja
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
              Esta acción es permanente. Solo puede eliminar quejas pendientes o en proceso.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 text-outline transition-colors hover:text-on-surface"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            aria-label="Cerrar"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl bg-surface-container-low p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-outline">Queja</p>
            <p className="mt-2 font-headline text-base font-bold leading-snug text-on-surface">
              {title}
            </p>
            <dl className="mt-3 space-y-1.5 text-sm text-on-surface-variant">
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-on-surface">Fecha:</dt>
                <dd>{dateLabel}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-on-surface">Tipo:</dt>
                <dd>{typeLabel}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-on-surface">Estado:</dt>
                <dd>{statusLabel}</dd>
              </div>
              <div className="flex flex-wrap gap-x-2">
                <dt className="font-semibold text-on-surface">Ubicación:</dt>
                <dd>{locationLabel}</dd>
              </div>
            </dl>
          </div>

          <p className="text-sm leading-relaxed text-on-surface-variant">
            Si elimina esta queja, perderá el seguimiento asociado y deberá registrar una nueva
            solicitud si el problema persiste.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-outline-variant/15 bg-surface-container-low/40 p-5 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="cancel"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="w-full sm:w-auto"
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar queja"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
