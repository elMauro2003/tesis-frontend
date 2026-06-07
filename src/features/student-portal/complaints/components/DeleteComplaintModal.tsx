"use client";

import { useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CollapsibleText } from "@/components/student-portal/CollapsibleText";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { complaintService } from "@/core/services/complaint.service";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  canDeleteComplaint,
  formatComplaintDate,
  getBuildingLabel,
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

      if (!canDeleteComplaint(complaint.status)) {
        throw new Error("Solo puede eliminar quejas pendientes o en proceso.");
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

  if (!complaint) {
    return null;
  }

  const typeLabel = COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type;
  const statusLabel = COMPLAINT_STATUS_LABELS[complaint.status];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      scrollable
      maxWidthClassName="max-w-md"
      title="Eliminar queja"
      subtitle="Esta acción es permanente. Solo puede eliminar quejas pendientes o en proceso."
      footer={
        <div className="flex gap-2">
          <Button
            type="button"
            variant="cancel"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending || !canDeleteComplaint(complaint.status)}
            className="flex-[1.2]"
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4 p-4">
        <div className="flex items-start gap-3 rounded-xl bg-error-container/30 p-3">
          <span className="material-symbols-outlined shrink-0 text-xl text-error">delete_forever</span>
          <p className="text-xs leading-relaxed text-on-surface-variant">
            Si elimina esta queja, perderá el seguimiento asociado y deberá registrar una nueva
            solicitud si el problema persiste.
          </p>
        </div>

        <div className="min-w-0 rounded-xl bg-surface-container-low p-4">
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
            <dt className="font-semibold text-on-surface">Fecha</dt>
            <dd className="min-w-0 break-words text-on-surface-variant">
              {formatComplaintDate(complaint.date)}
            </dd>
            <dt className="font-semibold text-on-surface">Tipo</dt>
            <dd className="min-w-0 break-words text-on-surface-variant">{typeLabel}</dd>
            <dt className="font-semibold text-on-surface">Estado</dt>
            <dd className="min-w-0 break-words text-on-surface-variant">{statusLabel}</dd>
            <dt className="font-semibold text-on-surface">Ubicación</dt>
            <dd className="min-w-0 break-words text-on-surface-variant">
              {getBuildingLabel(complaint)}
            </dd>
          </dl>

          <div className="mt-4 border-t border-outline-variant/15 pt-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-outline">
              Descripción
            </p>
            <CollapsibleText
              text={complaint.description}
              className="text-sm leading-relaxed text-on-surface"
              maxCharsBeforeCollapse={140}
              clampLines={4}
            />
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
