"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";

export function usePendingComplaintsCount() {
  return useQuery({
    queryKey: ["portal", "complaints", "pending-count"],
    queryFn: async () => {
      const response = await complaintService.getMyComplaints({ page: 1, page_size: 100 });
      return response.results.filter((complaint) => complaint.status === "pendiente").length;
    },
    staleTime: 60_000,
  });
}
