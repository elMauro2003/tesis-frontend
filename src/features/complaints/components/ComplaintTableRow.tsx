"use client";

import { Complaint } from "@/types/models";
import { Button } from "@/components/ui/button";
import { ComplaintStatusBadge } from "@/features/complaints/components/ComplaintStatusBadge";
import { ComplaintVisibilityCell } from "@/features/complaints/components/ComplaintVisibilityCell";
import {
  formatComplaintDate,
  getComplaintSenderSubtitle,
  getComplaintTitle,
  getComplaintTypeLabel,
} from "@/features/complaints/utils/complaintDashboard";
import { cn } from "@/utils/helpers/shadcn/index";

const actionButtonClass =
  "h-8 w-8 shrink-0 text-[var(--color-outline)] hover:bg-[var(--color-surface-container-low)]";

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
      <td className="px-6 py-5">
        <div className="flex min-w-0 flex-col">
          <span className="text-sm font-bold text-[var(--color-primary-dark)] transition-colors group-hover:text-[var(--color-primary)]">
            {getComplaintTitle(complaint.description)}
          </span>
          <span className="mt-0.5 text-xs text-[var(--color-on-secondary-container)]">
            {getComplaintSenderSubtitle(complaint)}
          </span>
        </div>
      </td>
      <td className="px-6 py-5 text-sm font-medium text-[var(--color-on-surface-variant)]">
        {formatComplaintDate(complaint.date)}
      </td>
      <td className="px-6 py-5">
        <span className="inline-flex items-center rounded-full bg-[var(--color-surface-container-high)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-on-surface)]">
          {getComplaintTypeLabel(complaint)}
        </span>
      </td>
      <td className="px-6 py-5">
        <ComplaintVisibilityCell complaint={complaint} />
      </td>
      <td className="px-6 py-5">
        <ComplaintStatusBadge complaint={complaint} />
      </td>
      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-1">
          {canManage ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(actionButtonClass, "hover:text-amber-600")}
                title={isPublic ? "Marcar como privada" : "Marcar como pública"}
                aria-label={isPublic ? "Marcar como privada" : "Marcar como pública"}
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
            </>
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
