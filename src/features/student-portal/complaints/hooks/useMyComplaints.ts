"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { complaintService } from "@/core/services/complaint.service";

const PAGE_SIZE = 10;

export function useMyComplaints() {
  return useInfiniteQuery({
    queryKey: ["portal", "complaints"],
    queryFn: ({ pageParam = 1 }) =>
      complaintService.getMyComplaints({ page: pageParam, page_size: PAGE_SIZE }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (!lastPage.next) {
        return undefined;
      }

      return lastPageParam + 1;
    },
    staleTime: 60_000,
  });
}
