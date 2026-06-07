"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService, GetComplaintsFilters } from "@/core/services/complaint.service";
import { usePermissions } from "@/hooks/usePermissions";

export function useComplaintsForRole(filters: GetComplaintsFilters = {}) {
  const { can, canManageComplaints } = usePermissions();
  const isManager = canManageComplaints();

  return useQuery({
    queryKey: ["complaints", isManager ? "manage" : "mine", filters],
    queryFn: () => {
      if (isManager) {
        return complaintService.getComplaints(filters);
      }

      return complaintService.getMyComplaints();
    },
    enabled: can("complaints", "view"),
    staleTime: 60 * 1000,
  });
}
