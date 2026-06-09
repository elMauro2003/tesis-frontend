"use client";

import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { AnnouncementsBoardFooter } from "@/features/student-portal/announcements/components/AnnouncementsBoardFooter";
import { usePublicAnnouncements } from "@/features/student-portal/announcements/hooks/usePublicAnnouncements";
import { isActivePublicAnnouncement } from "@/features/student-portal/announcements/utils/portalAnnouncementPresentation";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalAnnouncementsPageSkeleton } from "@/components/student-portal/PortalSkeleton";

export function AnnouncementsFeed() {
  const announcementsQuery = usePublicAnnouncements();
  const isInitialLoading = announcementsQuery.isLoading && !announcementsQuery.data;

  const announcements =
    announcementsQuery.data?.pages
      .flatMap((page) => page.results)
      .filter(isActivePublicAnnouncement) ?? [];

  const hasMore = Boolean(announcementsQuery.hasNextPage);
  const showBoardFooter = !hasMore && announcements.length > 0;

  if (isInitialLoading) {
    return (
      <PortalPageShell>
        <PortalAnnouncementsPageSkeleton />
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell>
      <PortalSectionTitle
        title="Tablón de Anuncios"
        description="Informaciones importantes de la administración"
      />

      {announcementsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar los anuncios"
          onRetry={() => announcementsQuery.refetch()}
        />
      ) : announcements.length === 0 ? (
        <PortalEmptyState
          icon="campaign"
          title="Sin comunicados vigentes"
          description="Los anuncios públicos de la residencia aparecerán aquí."
        />
      ) : (
        <>
          <div className="space-y-8">
            {announcements.map((announcement) => (
              <PortalAnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>

          <PortalLoadMore
            onClick={() => announcementsQuery.fetchNextPage()}
            isLoading={announcementsQuery.isFetchingNextPage}
            hasMore={hasMore}
          />

          {showBoardFooter ? <AnnouncementsBoardFooter /> : null}
        </>
      )}
    </PortalPageShell>
  );
}
