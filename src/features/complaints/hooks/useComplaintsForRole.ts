"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService, GetComplaintsFilters } from "@/core/services/complaint.service";
import {
  ComplaintStatusSegment,
  filterComplaintsBySegment,
} from "@/features/complaints/utils/complaintDashboard";
import { usePermissions } from "@/hooks/usePermissions";

export interface ComplaintsQueryFilters extends GetComplaintsFilters {
  statusSegment?: ComplaintStatusSegment;
}

export function useComplaintsForRole(filters: ComplaintsQueryFilters = {}) {
  const { can, canManageComplaints } = usePermissions();
  const isManager = canManageComplaints();
  const { statusSegment = "all", ...apiFilters } = filters;

  return useQuery({
    queryKey: ["complaints", isManager ? "manage" : "mine", { ...apiFilters, statusSegment }],
    queryFn: async () => {
      if (isManager) {
        if (statusSegment === "cerradas") {
          const all = await complaintService.getAllComplaints({
            search: apiFilters.search,
            type: apiFilters.type,
            building: apiFilters.building,
            ordering: apiFilters.ordering ?? "-date",
          });
          const filtered = filterComplaintsBySegment(all.results, "cerradas");
          const page = Math.max(1, apiFilters.page ?? 1);
          const pageSize = Math.max(1, apiFilters.page_size ?? 10);
          const start = (page - 1) * pageSize;

          return {
            count: filtered.length,
            next: start + pageSize < filtered.length ? "client" : null,
            previous: page > 1 ? "client" : null,
            results: filtered.slice(start, start + pageSize),
          };
        }

        const status =
          statusSegment === "pendiente" || statusSegment === "en_proceso"
            ? statusSegment
            : apiFilters.status;

        return complaintService.getComplaints({
          ...apiFilters,
          status,
        });
      }

      return complaintService.getMyComplaints({
        page: apiFilters.page,
        page_size: apiFilters.page_size,
      });
    },
    enabled: can("complaints", "view"),
    staleTime: 60 * 1000,
  });
}
