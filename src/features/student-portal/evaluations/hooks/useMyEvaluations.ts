"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { evaluationService } from "@/core/services/evaluation.service";

const PAGE_SIZE = 10;

export function useMyEvaluations() {
  return useInfiniteQuery({
    queryKey: ["portal", "evaluations"],
    queryFn: ({ pageParam = 1 }) =>
      evaluationService.getMyEvaluations({ page: pageParam, page_size: PAGE_SIZE }),
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
