"use client";

import { Complaint } from "@/types/models";

interface ComplaintVisibilityCellProps {
  complaint: Complaint;
}

export function ComplaintVisibilityCell({ complaint }: ComplaintVisibilityCellProps) {
  const isPublic = Boolean(complaint.visibility ?? complaint.is_public);

  return (
    <div className="flex items-center gap-1.5 text-[var(--color-outline)]">
      <span className="material-symbols-outlined text-[18px]">{isPublic ? "public" : "lock"}</span>
      <span className="text-xs font-medium">{isPublic ? "Pública" : "Privada"}</span>
    </div>
  );
}
