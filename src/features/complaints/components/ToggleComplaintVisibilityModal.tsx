"use client";

import { useEffect } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import { getComplaintTitle } from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";

interface ToggleComplaintVisibilityModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function ToggleComplaintVisibilityModal({
  complaint,
  open,
  onClose,
}: ToggleComplaintVisibilityModalProps) {
  const { visibilityMutation } = useComplaintMutations();
  const isPublic = Boolean(complaint?.visibility ?? complaint?.is_public);
  const nextVisibility = !isPublic;

  useEffect(() => {
    if (!open) {
      visibilityMutation.reset();
    }
  }, [open]);

  const handleConfirm = () => {
    if (!complaint || visibilityMutation.isPending) {
      return;
    }

    visibilityMutation.mutate(
      { id: complaint.id, visibility: nextVisibility },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet open={open && !!complaint} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-4 bg-[var(--color-primary-selected)]/40 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
            <span className="material-symbols-outlined text-2xl">shield_lock</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-extrabold leading-tight text-[var(--color-primary-dark)]">
              {nextVisibility ? "Hacer pública la queja" : "Marcar como privada"}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
              {nextVisibility
                ? "La queja aparecerá en el archivo visible del portal estudiantil."
                : "Solo la administración podrá consultar esta queja."}
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
          <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Queja</p>
            <p className="mt-2 text-base font-bold text-[var(--color-primary-dark)]">
              {complaint ? getComplaintTitle(complaint.description) : "—"}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/40 p-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={visibilityMutation.isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleConfirm} disabled={visibilityMutation.isPending}>
            {visibilityMutation.isPending
              ? "Guardando..."
              : nextVisibility
                ? "Confirmar visibilidad pública"
                : "Confirmar visibilidad privada"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
