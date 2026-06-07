"use client";

import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { usePublicAnnouncements } from "@/features/student-portal/announcements/hooks/usePublicAnnouncements";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";

export function AnnouncementsFeed() {
  const announcementsQuery = usePublicAnnouncements();
  const announcements = announcementsQuery.data?.pages.flatMap((page) => page.results) ?? [];

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Comunicados"
        description="Anuncios públicos vigentes de la residencia."
      />

      {announcementsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar los anuncios"
          onRetry={() => announcementsQuery.refetch()}
        />
      ) : announcementsQuery.isLoading ? (
        <PortalListSkeleton count={4} />
      ) : announcements.length === 0 ? (
        <PortalEmptyState
          icon="campaign"
          title="Sin comunicados vigentes"
          description="Los anuncios públicos de la residencia aparecerán aquí."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <PortalAnnouncementCard key={announcement.id} announcement={announcement} />
          ))}

          <PortalLoadMore
            onClick={() => announcementsQuery.fetchNextPage()}
            isLoading={announcementsQuery.isFetchingNextPage}
            hasMore={Boolean(announcementsQuery.hasNextPage)}
          />
        </div>
      )}
    </PortalPageShell>
  );
}
