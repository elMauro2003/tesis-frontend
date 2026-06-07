"use client";

import { useQuery } from "@tanstack/react-query";
import { accommodationService } from "@/core/services/accommodation.service";

export function useMyRoomDuties() {
  return useQuery({
    queryKey: ["portal", "room-duties"],
    queryFn: () => accommodationService.getMyRoomDuties(),
    staleTime: 60_000,
  });
}
