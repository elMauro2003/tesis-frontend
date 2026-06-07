"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClient, FetchError } from "@/lib/fetchClient";
import { Building, PaginatedResponse } from "@/types/models";

export function useComplaintBuildings(enabled: boolean) {
  return useQuery({
    queryKey: ["portal", "complaint-buildings"],
    enabled,
    queryFn: async () => {
      try {
        const response = await fetchClient<PaginatedResponse<Building>>(
          "/api/v1/edificios/?page=1&page_size=100",
          { suppressForbiddenEvent: true }
        );
        return response.results;
      } catch (error) {
        if (error instanceof FetchError && error.status === 403) {
          return [];
        }

        throw error;
      }
    },
    staleTime: 5 * 60_000,
    retry: false,
  });
}
