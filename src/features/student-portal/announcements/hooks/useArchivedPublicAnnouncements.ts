"use client";

import { useQuery } from "@tanstack/react-query";
import { communicationService } from "@/core/services/communication.service";
import { isAnnouncementArchived } from "@/features/announcements/utils/announcementPresentation";
import { sortAnnouncementsByPublishedDateDesc } from "@/features/student-portal/announcements/utils/portalAnnouncementPresentation";

export function useArchivedPublicAnnouncements() {
  return useQuery({
    queryKey: ["portal", "announcements", "archived"],
    queryFn: async () => {
      const response = await communicationService.getAllPublicInformations();
      return sortAnnouncementsByPublishedDateDesc(
        response.results.filter((announcement) => isAnnouncementArchived(announcement))
      );
    },
    staleTime: 60_000,
  });
}
