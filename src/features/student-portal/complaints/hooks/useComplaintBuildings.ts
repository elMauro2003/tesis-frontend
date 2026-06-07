"use client";

import { useQuery } from "@tanstack/react-query";
import { infrastructureService } from "@/core/services/infrastructure.service";

export function useComplaintBuildings() {
  return useQuery({
    queryKey: ["portal", "complaint-buildings"],
    queryFn: async () => {
      const response = await infrastructureService.getBuildings({ page: 1, page_size: 100 });
      return response.results;
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
