"use client";

import Link from "next/link";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { AnnouncementsBoardFooter } from "@/features/student-portal/announcements/components/AnnouncementsBoardFooter";
import { useArchivedPublicAnnouncements } from "@/features/student-portal/announcements/hooks/useArchivedPublicAnnouncements";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalAnnouncementListSkeleton } from "@/components/student-portal/PortalSkeleton";

export function AnnouncementsArchiveFeed() {
  const archiveQuery = useArchivedPublicAnnouncements();
  const announcements = archiveQuery.data ?? [];

  return (
    <PortalPageShell>
      <Link
        href={PORTAL_ROUTES.anuncios}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al tablón
      </Link>

      <header className="mb-8 text-left md:mb-12">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
          Anuncios archivados
        </h1>
        <p className="mt-2 text-base font-medium text-on-surface-variant opacity-80 md:text-lg">
          Comunicados públicos que ya no están vigentes en el tablón.
        </p>
      </header>

      {archiveQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar los archivados"
          onRetry={() => archiveQuery.refetch()}
        />
      ) : archiveQuery.isLoading ? (
        <PortalAnnouncementListSkeleton count={3} />
      ) : announcements.length === 0 ? (
        <PortalEmptyState
          icon="inventory_2"
          title="Sin anuncios archivados"
          description="Los comunicados vencidos aparecerán aquí cuando dejen de estar vigentes."
        />
      ) : (
        <>
          <div className="space-y-8">
            {announcements.map((announcement) => (
              <PortalAnnouncementCard key={announcement.id} announcement={announcement} />
            ))}
          </div>

          <AnnouncementsBoardFooter
            message="Has llegado al final de los anuncios archivados."
            archiveHref={PORTAL_ROUTES.anuncios}
            archiveLabel="Volver al tablón activo"
          />
        </>
      )}
    </PortalPageShell>
  );
}
