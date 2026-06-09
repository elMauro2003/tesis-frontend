"use client";

import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

interface ComplaintVisibilityCellProps {
  complaint: Complaint;
  compact?: boolean;
  className?: string;
}

export function ComplaintVisibilityCell({ complaint, compact = false, className }: ComplaintVisibilityCellProps) {
  const isPublic = Boolean(complaint.visibility ?? complaint.is_public);

  return (
    <div
      className={cn("flex items-center gap-1.5 text-[var(--color-outline)]", className)}
      title={isPublic ? "Pública" : "Privada"}
    >
      <span className="material-symbols-outlined text-[18px]">{isPublic ? "public" : "lock"}</span>
      {!compact ? <span className="text-xs font-medium">{isPublic ? "Pública" : "Privada"}</span> : null}
    </div>
  );
}
