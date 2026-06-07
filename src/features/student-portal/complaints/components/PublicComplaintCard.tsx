"use client";

import { Complaint } from "@/types/models";
import { CollapsibleText } from "@/components/student-portal/CollapsibleText";
import {
  COMPLAINT_STATUS_LABELS,
  formatComplaintDate,
  getBuildingLabel,
  getComplaintTitle,
  getPublicStatusBadgeClass,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { cn } from "@/utils/helpers/shadcn/index";

interface PublicComplaintCardProps {
  complaint: Complaint;
}

export function PublicComplaintCard({ complaint }: PublicComplaintCardProps) {
  const isInProcess = complaint.status === "pendiente" || complaint.status === "en_proceso";

  return (
    <article
      className={cn(
        "group rounded-xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] transition-all hover:-translate-y-1 md:p-8",
        isInProcess && "border-l-4 border-tertiary"
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              getPublicStatusBadgeClass(complaint.status)
            )}
          >
            {COMPLAINT_STATUS_LABELS[complaint.status]}
          </span>
          <span className="text-sm text-outline">{formatComplaintDate(complaint.date)}</span>
        </div>

        <h3 className="font-headline text-xl font-bold text-on-surface transition-colors group-hover:text-primary md:text-2xl">
          {getComplaintTitle(complaint.description)}
        </h3>

        <div className="flex items-center gap-2 text-sm text-on-surface-variant">
          <span className="material-symbols-outlined text-sm">location_on</span>
          <span>{getBuildingLabel(complaint)}</span>
        </div>

        <CollapsibleText
          text={complaint.description}
          className="max-w-3xl text-sm text-on-surface-variant md:text-base"
        />
      </div>

      {complaint.response ? (
        <div className="mt-6 border-t border-outline-variant/15 pt-6 md:mt-8 md:pt-8">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-container-highest">
              <span
                className="material-symbols-outlined text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                account_balance
              </span>
            </div>
            <div className="min-w-0 flex-1 rounded-xl bg-surface-container-low p-5">
              {isInProcess ? (
                <div className="mb-3 flex items-center gap-3">
                  <p className="shrink-0 text-sm font-bold uppercase tracking-wider text-primary">
                    Estado de la solicitud
                  </p>
                  <div className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-outline-variant/20">
                    <div className="h-full w-[60%] rounded-full bg-tertiary" />
                  </div>
                </div>
              ) : (
                <p className="mb-2 text-sm font-bold uppercase tracking-wider text-primary">
                  Respuesta administrativa
                </p>
              )}
              <CollapsibleText
                text={complaint.response}
                className="text-sm italic text-on-surface-variant"
                maxCharsBeforeCollapse={220}
              />
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
