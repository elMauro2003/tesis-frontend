"use client";

import { useEffect, useState } from "react";
import { Complaint } from "@/types/models";
import { Button } from "@/components/ui/button";
import { ComplaintStatusBadge } from "@/features/complaints/components/ComplaintStatusBadge";
import { ComplaintVisibilityCell } from "@/features/complaints/components/ComplaintVisibilityCell";
import {
  formatComplaintDate,
  getComplaintSenderName,
  getComplaintSenderSubtitle,
  getComplaintTypeLabel,
} from "@/features/complaints/utils/complaintDashboard";
import { formatComplaintDateTime } from "@/features/student-portal/complaints/utils/complaintPresentation";

const ANIM_MS = 320;

interface ViewComplaintPanelProps {
  complaint: Complaint | null;
  onClose: () => void;
  onRespond?: (complaint: Complaint) => void;
  onUpdateStatus?: (complaint: Complaint) => void;
  canManage?: boolean;
}

export function ViewComplaintPanel({
  complaint,
  onClose,
  onRespond,
  onUpdateStatus,
  canManage = false,
}: ViewComplaintPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!complaint) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }, [complaint]);

  const handleRequestClose = () => {
    setIsOpen(false);
    window.setTimeout(() => onClose(), ANIM_MS);
  };

  if (!isOpen && !complaint) {
    return null;
  }

  const responseDateLabel = formatComplaintDateTime(complaint?.response_date);

  return (
    <>
      <div
        className={`fixed inset-0 z-[60] bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={handleRequestClose}
        aria-hidden
      />

      <div
        className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-lg transform flex-col overflow-hidden bg-[var(--color-surface-container-lowest)] shadow-2xl transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="complaint-panel-title"
      >
        <header className="relative flex flex-col gap-4 border-b border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-lowest)] p-6">
          <button
            type="button"
            className="absolute right-4 top-4 cursor-pointer text-[var(--color-outline)] transition-colors hover:text-[var(--color-on-surface)]"
            onClick={handleRequestClose}
            aria-label="Cerrar panel"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          <div className="mt-2 flex items-start gap-4 pr-8">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-primary-selected)] text-[var(--color-primary)] shadow-sm">
              <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                emergency_home
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                Queja #{complaint?.id}
              </p>
              <h3
                id="complaint-panel-title"
                className="mt-1 line-clamp-3 break-words font-headline text-xl font-bold leading-snug text-[var(--color-primary-dark)] sm:text-2xl"
              >
                {complaint?.description}
              </h3>
            </div>
          </div>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Emisor</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                {complaint ? getComplaintSenderName(complaint) : "—"}
              </p>
              <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">
                {complaint ? getComplaintSenderSubtitle(complaint) : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Fecha</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                {complaint ? formatComplaintDate(complaint.date) : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Categoría</p>
              <p className="mt-2 text-sm font-semibold text-[var(--color-on-surface)]">
                {complaint ? getComplaintTypeLabel(complaint) : "—"}
              </p>
            </div>

            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Visibilidad</p>
              <div className="mt-2">{complaint ? <ComplaintVisibilityCell complaint={complaint} /> : null}</div>
            </div>
          </div>

          <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Estado</p>
            <div className="mt-3">{complaint ? <ComplaintStatusBadge complaint={complaint} /> : null}</div>
          </div>

          <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Descripción</p>
            <p className="mt-3 break-words text-sm leading-relaxed text-[var(--color-on-surface)]">
              {complaint?.description}
            </p>
          </div>

          {complaint?.response ? (
            <div className="rounded-2xl border border-[var(--color-primary)]/10 bg-[var(--color-primary-selected)]/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <span
                  className="material-symbols-outlined text-[var(--color-primary)]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  assignment_turned_in
                </span>
                <p className="text-sm font-semibold text-[var(--color-primary-dark)]">Respuesta de la administración</p>
              </div>
              {responseDateLabel ? (
                <p className="mb-2 text-xs text-[var(--color-on-surface-variant)]">{responseDateLabel}</p>
              ) : null}
              <p className="text-sm italic leading-relaxed text-[var(--color-on-surface-variant)]">{complaint.response}</p>
            </div>
          ) : null}
        </div>

        {canManage && complaint ? (
          <footer className="flex flex-col-reverse gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/40 p-6 sm:flex-row sm:justify-end">
            <Button type="button" variant="neutral" onClick={handleRequestClose}>
              Cerrar
            </Button>
            <Button type="button" variant="neutral" onClick={() => onUpdateStatus?.(complaint)}>
              <span className="material-symbols-outlined text-lg">published_with_changes</span>
              Cambiar estado
            </Button>
            <Button type="button" variant="default" onClick={() => onRespond?.(complaint)}>
              <span className="material-symbols-outlined text-lg">reply</span>
              Responder
            </Button>
          </footer>
        ) : null}
      </div>
    </>
  );
}
