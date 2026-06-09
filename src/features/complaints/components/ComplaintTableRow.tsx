"use client";

import { Complaint } from "@/types/models";
import { Button } from "@/components/ui/button";
import { ComplaintStatusBadge } from "@/features/complaints/components/ComplaintStatusBadge";
import { ComplaintVisibilityCell } from "@/features/complaints/components/ComplaintVisibilityCell";
import {
  formatComplaintDateCompact,
  getComplaintSenderSubtitle,
  getComplaintTitle,
  getComplaintTypeLabel,
} from "@/features/complaints/utils/complaintDashboard";
import { cn } from "@/utils/helpers/shadcn/index";

const actionButtonClass =
  "h-8 w-8 shrink-0 p-0 text-[var(--color-outline)] hover:bg-[var(--color-surface-container-low)]";

interface ComplaintTableRowProps {
  complaint: Complaint;
  canManage?: boolean;
  onView: (complaint: Complaint) => void;
  onToggleVisibility: (complaint: Complaint) => void;
  onAssign: (complaint: Complaint) => void;
  onUpdateStatus: (complaint: Complaint) => void;
  onRespond: (complaint: Complaint) => void;
}

export function ComplaintTableRow({
  complaint,
  canManage = true,
  onView,
  onToggleVisibility,
  onAssign,
  onUpdateStatus,
  onRespond,
}: ComplaintTableRowProps) {
  const isPublic = Boolean(complaint.visibility ?? complaint.is_public);

  return (
    <tr className="group transition-colors hover:bg-[var(--color-primary-selected)]/30">
      <td className="px-4 py-3.5 align-top">
        <div className="min-w-0">
          <p
            className="line-clamp-2 break-words text-sm font-bold leading-snug text-[var(--color-primary-dark)] transition-colors group-hover:text-[var(--color-primary)]"
            title={getComplaintTitle(complaint.description)}
          >
            {getComplaintTitle(complaint.description)}
          </p>
          <p className="mt-0.5 line-clamp-1 break-words text-xs text-[var(--color-on-secondary-container)]">
            {getComplaintSenderSubtitle(complaint)}
          </p>
        </div>
      </td>
      <td className="px-3 py-3.5 align-top text-sm font-medium whitespace-nowrap text-[var(--color-on-surface-variant)]">
        {formatComplaintDateCompact(complaint.date)}
      </td>
      <td className="px-3 py-3.5 align-top">
        <span
          className="inline-flex max-w-full items-center truncate rounded-full bg-[var(--color-surface-container-high)] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-on-surface)]"
          title={getComplaintTypeLabel(complaint)}
        >
          {getComplaintTypeLabel(complaint)}
        </span>
      </td>
      <td className="px-3 py-3.5 align-top">
        <ComplaintVisibilityCell complaint={complaint} compact />
      </td>
      <td className="px-3 py-3.5 align-top">
        <ComplaintStatusBadge complaint={complaint} className="px-2 py-0.5 text-[10px]" />
      </td>
      <td className="px-4 py-3.5 align-top">
        <div className="flex items-center justify-end gap-1.5">
          {canManage ? (
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(actionButtonClass, "hover:text-amber-600")}
                title={isPublic ? "Cambiar visibilidad" : "Cambiar visibilidad"}
                aria-label="Cambiar visibilidad"
                onClick={() => onToggleVisibility(complaint)}
              >
                <span className="material-symbols-outlined text-[20px]">shield_lock</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(actionButtonClass, "hover:text-[var(--color-success)]")}
                title="Asignar responsable"
                aria-label="Asignar responsable"
                onClick={() => onAssign(complaint)}
              >
                <span className="material-symbols-outlined text-[20px]">person_add</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(actionButtonClass, "hover:text-[var(--color-primary)]")}
                title="Actualizar estado"
                aria-label="Actualizar estado"
                onClick={() => onUpdateStatus(complaint)}
              >
                <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(actionButtonClass, "hover:bg-[var(--color-primary-selected)] hover:text-[var(--color-primary-dark)]")}
                title="Responder queja"
                aria-label="Responder queja"
                onClick={() => onRespond(complaint)}
              >
                <span className="material-symbols-outlined text-[20px]">reply</span>
              </Button>
            </div>
          ) : null}
          {canManage ? (
            <span className="mx-0.5 h-5 w-px shrink-0 bg-[var(--color-outline-variant)]/25" aria-hidden />
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(actionButtonClass, "hover:text-[var(--color-primary-dark)]")}
            title="Ver detalle"
            aria-label="Ver detalle de la queja"
            onClick={() => onView(complaint)}
          >
            <span className="material-symbols-outlined text-[20px]">visibility</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}
