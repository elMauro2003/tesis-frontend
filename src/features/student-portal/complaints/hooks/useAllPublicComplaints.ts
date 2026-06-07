"use client";

import { useQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";

export function useAllPublicComplaints() {
  return useQuery({
    queryKey: ["portal", "complaints", "public", "all"],
    queryFn: () => complaintService.getAllPublicComplaints(),
    staleTime: 60_000,
  });
}
