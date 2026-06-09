"use client";

import { Complaint } from "@/types/models";
import {
  getComplaintStatusLabel,
  getDashboardStatusBadgeClass,
} from "@/features/complaints/utils/complaintDashboard";
import { cn } from "@/utils/helpers/shadcn/index";

interface ComplaintStatusBadgeProps {
  complaint: Complaint;
  className?: string;
}

export function ComplaintStatusBadge({ complaint, className }: ComplaintStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
        getDashboardStatusBadgeClass(complaint.status),
        className
      )}
    >
      {getComplaintStatusLabel(complaint)}
    </span>
  );
}
