"use client";

import { Complaint } from "@/types/models";
import {
  COMPLAINT_STATUS_LABELS,
  canEditComplaint,
  formatComplaintDate,
  getComplaintBorderClass,
  getComplaintTitle,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { cn } from "@/utils/helpers/shadcn/index";

interface MyComplaintCardProps {
  complaint: Complaint;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
  onFollowUp?: (complaint: Complaint) => void;
  isDeleting?: boolean;
}

export function MyComplaintCard({
  complaint,
  onEdit,
  onDelete,
  onFollowUp,
  isDeleting = false,
}: MyComplaintCardProps) {
  const isResolved = complaint.status === "resuelta";
  const isEditable = canEditComplaint(complaint.status);

  return (
    <article
      className={cn(
        "rounded-xl border-l-4 bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)] transition-transform active:scale-[0.99]",
        getComplaintBorderClass(complaint.status)
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-outline">
            {formatComplaintDate(complaint.date)}
          </span>
          <h3 className="font-headline text-lg font-bold leading-tight text-on-surface">
            {getComplaintTitle(complaint.description)}
          </h3>
        </div>

        {isResolved ? (
          <span className="shrink-0 rounded bg-success-light px-2 py-1 text-[10px] font-black uppercase tracking-wider text-green-800">
            {COMPLAINT_STATUS_LABELS.resuelta}
          </span>
        ) : isEditable ? (
          <div className="flex shrink-0 gap-1">
            <button
              type="button"
              onClick={() => onEdit?.(complaint)}
              className="p-2 text-outline transition-colors hover:text-primary"
              aria-label="Editar queja"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(complaint)}
              disabled={isDeleting}
              className="p-2 text-outline transition-colors hover:text-error disabled:opacity-50"
              aria-label="Eliminar queja"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        ) : (
          <span className="shrink-0 rounded bg-surface-container-high px-2 py-1 text-[10px] font-black uppercase tracking-wider text-on-surface-variant">
            {COMPLAINT_STATUS_LABELS[complaint.status]}
          </span>
        )}
      </div>

      <p className="mb-4 text-sm leading-relaxed text-on-surface-variant">{complaint.description}</p>

      {complaint.response ? (
        <div className="mb-4 flex gap-3 rounded-lg bg-surface-container-low p-4">
          <span
            className="material-symbols-outlined shrink-0 text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            assignment_turned_in
          </span>
          <div>
            <p className="mb-1 text-sm font-semibold text-on-secondary-fixed-variant">
              Respuesta de la administración:
            </p>
            <p className="text-sm italic text-on-surface-variant">&ldquo;{complaint.response}&rdquo;</p>
          </div>
        </div>
      ) : null}

      {!isResolved && complaint.status !== "rechazada" ? (
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <span className="text-xs font-bold uppercase tracking-wide text-primary">
            {complaint.status === "en_proceso"
              ? "En revisión por la administración"
              : "Pendiente de revisión"}
          </span>
        </div>
      ) : null}

      {isResolved ? (
        <button
          type="button"
          onClick={() => onFollowUp?.(complaint)}
          className="flex items-center gap-1 text-sm font-bold text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
        >
          Añadir reclamación
        </button>
      ) : null}
    </article>
  );
}
