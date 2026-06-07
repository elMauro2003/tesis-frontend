"use client";

import { useQuery } from "@tanstack/react-query";
import { accommodationService } from "@/core/services/accommodation.service";

export function useNextRoomDuty() {
  return useQuery({
    queryKey: ["portal", "room-duties", "next"],
    queryFn: async () => {
      const response = await accommodationService.getMyRoomDuties();
      const upcoming = response.results
        .filter((duty) => !duty.completed)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      return upcoming[0] ?? null;
    },
    staleTime: 60_000,
  });
}
