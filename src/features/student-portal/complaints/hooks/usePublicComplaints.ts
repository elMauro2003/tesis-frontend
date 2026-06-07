"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";

export function usePublicComplaints() {
  return useQuery({
    queryKey: ["portal", "complaints", "public"],
    queryFn: () => complaintService.getPublicComplaints({ page: 1, page_size: 100 }),
    staleTime: 60_000,
  });
}
