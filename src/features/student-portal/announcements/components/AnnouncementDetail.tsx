"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { communicationService } from "@/core/services/communication.service";
import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalAnnouncementListSkeleton } from "@/components/student-portal/PortalSkeleton";

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
        <PortalAnnouncementListSkeleton count={1} />
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

  return (
    <PortalPageShell>
      <Link
        href={PORTAL_ROUTES.anuncios}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-primary"
      >
        <span className="material-symbols-outlined text-lg">arrow_back</span>
        Volver al tablón
      </Link>

      <PortalAnnouncementCard announcement={announcementQuery.data} />
    </PortalPageShell>
  );
}
