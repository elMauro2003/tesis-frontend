"use client";

import { Button } from "@/components/ui/button";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { Complaint } from "@/types/models";

interface AssignComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function AssignComplaintModal({ complaint, open, onClose }: AssignComplaintModalProps) {
  return (
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Asignar trabajador"
      complaint={complaint}
      icon="person_add"
      iconWrapperClassName="bg-emerald-50 text-emerald-600"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" variant="success" disabled>
            Confirmar asignación
          </Button>
        </div>
      }
    >
      <div className="flex flex-col items-center rounded-xl border border-dashed border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] px-6 py-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <span className="material-symbols-outlined text-3xl">construction</span>
        </div>
        <p className="font-headline text-lg font-bold text-[var(--color-on-surface)]">Próximamente</p>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
          La asignación de trabajadores a quejas estará disponible cuando el backend exponga este
          flujo en la API.
        </p>
      </div>
    </ComplaintActionDialog>
  );
}
