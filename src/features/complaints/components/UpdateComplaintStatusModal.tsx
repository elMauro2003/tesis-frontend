"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import { COMPLAINT_STATUS_CARD_OPTIONS } from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

interface UpdateComplaintStatusModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function UpdateComplaintStatusModal({ complaint, open, onClose }: UpdateComplaintStatusModalProps) {
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

  const handleSave = () => {
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
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Modificar estado"
      complaint={complaint}
      icon="published_with_changes"
      iconWrapperClassName="bg-[var(--color-primary-selected)] text-[var(--color-primary)]"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={statusMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="confirm"
            onClick={handleSave}
            disabled={!hasChanges || statusMutation.isPending}
          >
            {statusMutation.isPending ? "Guardando..." : "Guardar estado"}
          </Button>
        </div>
      }
    >
      <div className="space-y-2.5">
        {COMPLAINT_STATUS_CARD_OPTIONS.map((option) => {
          const active = status === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setStatus(option.value)}
              className={cn(
                "group flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-all",
                active
                  ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-selected)]/50 shadow-sm"
                  : "border-[var(--color-outline-variant)]/25 bg-[var(--color-surface-container-lowest)] hover:bg-[var(--color-surface-container-low)]"
              )}
            >
              <div className="flex min-w-0 items-start gap-3">
                <span
                  className={cn(
                    "material-symbols-outlined shrink-0 text-[var(--color-outline)]",
                    active ? "text-[var(--color-primary)]" : option.hoverIconClass
                  )}
                >
                  {option.icon}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      "text-sm font-bold leading-none",
                      active ? "text-[var(--color-primary-dark)]" : "text-[var(--color-on-surface)]"
                    )}
                  >
                    {option.label}
                  </p>
                  <p
                    className={cn(
                      "mt-0.5 line-clamp-2 text-[10px] leading-relaxed",
                      active ? "text-[var(--color-primary)]/80" : "text-[var(--color-on-surface-variant)]"
                    )}
                  >
                    {option.description}
                  </p>
                </div>
              </div>
              {active ? (
                <span className="material-symbols-outlined shrink-0 text-[var(--color-primary)]">check_circle</span>
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--color-outline-variant)]/40" />
              )}
            </button>
          );
        })}
      </div>
    </ComplaintActionDialog>
  );
}
