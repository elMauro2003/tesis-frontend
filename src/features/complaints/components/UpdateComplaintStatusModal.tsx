"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import {
  COMPLAINT_STATUS_UPDATE_OPTIONS,
  getComplaintTitle,
} from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";

interface UpdateComplaintStatusModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function UpdateComplaintStatusModal({ complaint, open, onClose }: UpdateComplaintStatusModalProps) {
  const formId = useId();
  const [status, setStatus] = useState<Complaint["status"]>("pendiente");
  const { statusMutation } = useComplaintMutations();

  useEffect(() => {
    if (!open || !complaint) {
      statusMutation.reset();
      return;
    }

    setStatus(complaint.status);
  }, [open, complaint?.id, complaint?.status]);

  const hasChanges = complaint ? status !== complaint.status : false;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint || !hasChanges || statusMutation.isPending) {
      return;
    }

    statusMutation.mutate(
      { id: complaint.id, status },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet
      open={open && !!complaint}
      onClose={onClose}
      title="Actualizar estado"
      subtitle="Seleccione el nuevo estado de seguimiento para la queja."
      maxWidthClassName="max-w-md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={statusMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="confirm"
            disabled={!hasChanges || statusMutation.isPending}
          >
            {statusMutation.isPending ? "Guardando..." : "Guardar estado"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Queja</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-primary-dark)]">
            {complaint ? getComplaintTitle(complaint.description) : "—"}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${formId}-status`}
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]"
          >
            Estado
          </label>
          <Select value={status} onValueChange={(value) => setStatus(value as Complaint["status"])}>
            <SelectTrigger id={`${formId}-status`} className="h-12 rounded-2xl border-0 bg-[var(--color-surface-container-low)]">
              <SelectValue placeholder="Seleccionar estado" />
            </SelectTrigger>
            <SelectContent>
              {COMPLAINT_STATUS_UPDATE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </BottomSheet>
  );
}
