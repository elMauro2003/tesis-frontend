"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { ComplaintStatusBadge } from "@/features/complaints/components/ComplaintStatusBadge";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import {
  formatComplaintDate,
  getComplaintSenderSubtitle,
  getComplaintTypeLabel,
} from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";

interface DeleteComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
  onDeleted?: (complaintId: number) => void;
}

export function DeleteComplaintModal({
  complaint,
  open,
  onClose,
  onDeleted,
}: DeleteComplaintModalProps) {
  const { deleteMutation } = useComplaintMutations();
  const { mutate, reset, isPending } = deleteMutation;

  useEffect(() => {
    if (!open) reset();
  }, [open, reset]);

  const handleDelete = () => {
    if (!complaint || isPending) return;

    mutate(complaint.id, {
      onSuccess: () => {
        onDeleted?.(complaint.id);
        onClose();
      },
    });
  };

  return (
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Eliminar queja"
      complaint={complaint}
      icon="delete_forever"
      iconWrapperClassName="bg-red-50 text-[var(--color-error)]"
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Eliminando..." : "Eliminar queja"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 rounded-xl border border-red-100 bg-red-50/80 p-4">
          <span className="material-symbols-outlined shrink-0 text-xl text-[var(--color-error)]">warning</span>
          <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
            Esta acción es permanente. La queja se retirará del historial y no podrá recuperarse.
            Úsela para depurar registros duplicados, inválidos o ya cerrados que ya no requieran seguimiento.
          </p>
        </div>

        {complaint ? (
          <div className="rounded-xl bg-[var(--color-surface-container-low)] p-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
              <dt className="font-semibold text-[var(--color-on-surface)]">Fecha</dt>
              <dd className="text-[var(--color-on-surface-variant)]">{formatComplaintDate(complaint.date)}</dd>
              <dt className="font-semibold text-[var(--color-on-surface)]">Emisor</dt>
              <dd className="text-[var(--color-on-surface-variant)]">{getComplaintSenderSubtitle(complaint)}</dd>
              <dt className="font-semibold text-[var(--color-on-surface)]">Categoría</dt>
              <dd className="text-[var(--color-on-surface-variant)]">{getComplaintTypeLabel(complaint)}</dd>
              <dt className="font-semibold text-[var(--color-on-surface)]">Estado</dt>
              <dd>
                <ComplaintStatusBadge complaint={complaint} className="px-2 py-0.5 text-[10px]" />
              </dd>
            </dl>

            <div className="mt-4 border-t border-[var(--color-outline-variant)]/15 pt-4">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                Descripción
              </p>
              <p className="line-clamp-4 break-words text-sm leading-relaxed text-[var(--color-on-surface)]">
                {complaint.description}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </ComplaintActionDialog>
  );
}
