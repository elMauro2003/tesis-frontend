"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { communicationService } from "@/core/services/communication.service";
import { formatAnnouncementDate } from "@/features/announcements/utils/announcementPresentation";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";

interface AnnouncementDetailProps {
  id: number;
}

export function AnnouncementDetail({ id }: AnnouncementDetailProps) {
  const announcementQuery = useQuery({
    queryKey: ["portal", "announcements", id],
    queryFn: () => communicationService.getInformationById(id),
    staleTime: 60_000,
  });

  if (announcementQuery.isLoading) {
    return (
      <PortalPageShell>
        <PortalListSkeleton count={1} />
      </PortalPageShell>
    );
  }

  if (announcementQuery.isError || !announcementQuery.data) {
    return (
      <PortalPageShell>
        <PortalEmptyState
          icon="error"
          title="Anuncio no disponible"
          description="No fue posible cargar este comunicado."
          onRetry={() => announcementQuery.refetch()}
        />
      </PortalPageShell>
    );
  }

  const announcement = announcementQuery.data;

  return (
    <PortalPageShell>
      <Link
        href={PORTAL_ROUTES.anuncios}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver a comunicados
      </Link>

      <article className="rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
        <time className="text-xs text-outline">
          {formatAnnouncementDate(announcement.published_date)}
        </time>
        <h1 className="mt-2 font-headline text-2xl font-bold text-on-surface">{announcement.title}</h1>
        <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-on-surface-variant">
          {announcement.content}
        </p>
      </article>
    </PortalPageShell>
  );
}
