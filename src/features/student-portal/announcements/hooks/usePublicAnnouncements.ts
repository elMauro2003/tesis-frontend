"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { communicationService } from "@/core/services/communication.service";

const PAGE_SIZE = 10;

export function usePublicAnnouncements() {
  return useInfiniteQuery({
    queryKey: ["portal", "announcements"],
    queryFn: ({ pageParam = 1 }) =>
      communicationService.getPublicInformations({ page: pageParam, page_size: PAGE_SIZE }),
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
