"use client";

import Link from "next/link";
import { Complaint } from "@/types/models";
import { CollapsibleText } from "@/components/student-portal/CollapsibleText";
import { PortalStatusBadge } from "@/components/student-portal/PortalStatusBadge";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  canEditComplaint,
  formatComplaintDate,
  formatComplaintDateTime,
  getBuildingLabel,
  getComplaintBorderClass,
  getComplaintStatusTone,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { cn } from "@/utils/helpers/shadcn/index";

interface MyComplaintCardProps {
  complaint: Complaint;
  canCreateFollowUp?: boolean;
  onEdit?: (complaint: Complaint) => void;
  onDelete?: (complaint: Complaint) => void;
  onFollowUp?: (complaint: Complaint) => void;
}

export function MyComplaintCard({
  complaint,
  canCreateFollowUp = true,
  onEdit,
  onDelete,
  onFollowUp,
}: MyComplaintCardProps) {
  const isResolved = complaint.status === "resuelta";
  const isRejected = complaint.status === "rechazada";
  const isEditable = canEditComplaint(complaint.status);
  const responseDateLabel = formatComplaintDateTime(complaint.response_date);
  const typeLabel = complaint.type_display ?? COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type;

  return (
    <article
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border-l-4 bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)] transition-transform active:scale-[0.99]",
        getComplaintBorderClass(complaint.status)
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-outline">
              {formatComplaintDate(complaint.date)}
            </span>
            <span className="rounded-full bg-surface-container-low px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-on-surface-variant">
              {typeLabel}
            </span>
          </div>
        </div>

        {isEditable ? (
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
              className="p-2 text-outline transition-colors hover:text-error"
              aria-label="Eliminar queja"
            >
              <span className="material-symbols-outlined text-xl">delete</span>
            </button>
          </div>
        ) : (
          <PortalStatusBadge
            label={COMPLAINT_STATUS_LABELS[complaint.status]}
            tone={getComplaintStatusTone(complaint.status)}
            showDot={false}
            className="shrink-0 text-[10px] uppercase tracking-wider"
          />
        )}
      </div>

      <div className="mb-3 flex min-w-0 items-start gap-2 text-sm text-on-surface-variant">
        <span className="material-symbols-outlined shrink-0 text-sm text-outline">location_on</span>
        <span className="min-w-0 break-words">{getBuildingLabel(complaint)}</span>
      </div>

      <CollapsibleText
        text={complaint.description}
        className="mb-4 font-headline text-base font-semibold leading-snug text-on-surface"
        maxCharsBeforeCollapse={220}
      />

      {complaint.response ? (
        <div className="mb-4 flex min-w-0 gap-3 rounded-lg bg-surface-container-low p-4">
          <span
            className="material-symbols-outlined shrink-0 text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            assignment_turned_in
          </span>
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-sm font-semibold text-on-secondary-fixed-variant">
              Respuesta de la administración
              {responseDateLabel ? (
                <span className="font-normal text-on-surface-variant"> · {responseDateLabel}</span>
              ) : null}
            </p>
            <CollapsibleText
              text={complaint.response}
              className="text-sm italic text-on-surface-variant"
              maxCharsBeforeCollapse={220}
            />
          </div>
        </div>
      ) : null}

      {isRejected ? (
        <div className="mb-4 rounded-lg border border-error/20 bg-error-container/30 p-4">
          <p className="text-sm font-semibold text-error">Queja rechazada</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            La administración cerró esta solicitud. Si el problema continúa, puede registrar una nueva
            queja cuando tenga cupo disponible.
          </p>
          {canCreateFollowUp ? (
            <Link
              href={PORTAL_ROUTES.quejasNueva}
              className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-primary underline underline-offset-4"
            >
              Registrar nueva queja
            </Link>
          ) : null}
        </div>
      ) : null}

      {!isResolved && !isRejected ? (
        <PortalStatusBadge
          label={
            complaint.status === "en_proceso"
              ? "En revisión por la administración"
              : "Pendiente de revisión"
          }
          tone={getComplaintStatusTone(complaint.status)}
        />
      ) : null}

      {isResolved ? (
        canCreateFollowUp ? (
          <button
            type="button"
            onClick={() => onFollowUp?.(complaint)}
            className="flex items-center gap-1 text-sm font-bold text-primary underline underline-offset-4 transition-opacity hover:opacity-70"
          >
            Añadir reclamación
          </button>
        ) : (
          <p className="text-xs text-on-surface-variant">
            Límite diario alcanzado. Podrá registrar una reclamación mañana.
          </p>
        )
      ) : null}
    </article>
  );
}
