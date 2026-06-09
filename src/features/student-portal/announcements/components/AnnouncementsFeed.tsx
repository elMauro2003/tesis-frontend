"use client";

import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { AnnouncementsBoardFooter } from "@/features/student-portal/announcements/components/AnnouncementsBoardFooter";
import { usePublicAnnouncements } from "@/features/student-portal/announcements/hooks/usePublicAnnouncements";
import { isActivePublicAnnouncement } from "@/features/student-portal/announcements/utils/portalAnnouncementPresentation";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalAnnouncementListSkeleton } from "@/components/student-portal/PortalSkeleton";

export function AnnouncementsFeed() {
  const announcementsQuery = usePublicAnnouncements();
  const announcements =
    announcementsQuery.data?.pages
      .flatMap((page) => page.results)
      .filter(isActivePublicAnnouncement) ?? [];

  const hasMore = Boolean(announcementsQuery.hasNextPage);
  const showBoardFooter = !hasMore && announcements.length > 0;

  return (
    <PortalPageShell>
      <header className="mb-8 text-left md:mb-12">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          Tablón de Anuncios
        </h1>
        <p className="mt-2 text-base font-medium text-on-surface-variant opacity-80 md:text-lg">
          Informaciones importantes de la administración
        </p>
      </header>

      {announcementsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar los anuncios"
          onRetry={() => announcementsQuery.refetch()}
        />
      ) : announcementsQuery.isLoading ? (
        <PortalAnnouncementListSkeleton count={3} />
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
