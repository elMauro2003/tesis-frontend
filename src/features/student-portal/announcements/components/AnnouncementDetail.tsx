"use client";

import { useQuery } from "@tanstack/react-query";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { communicationService } from "@/core/services/communication.service";
import { PortalAnnouncementCard } from "@/features/student-portal/announcements/components/PortalAnnouncementCard";
import { PortalBackLink } from "@/components/student-portal/PortalBackLink";
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
        <PortalBackLink href={PORTAL_ROUTES.anuncios} label="Volver al tablón" />
        <PortalAnnouncementListSkeleton count={1} />
      </PortalPageShell>
    );
  }

  if (announcementQuery.isError || !announcementQuery.data) {
    return (
      <PortalPageShell>
        <PortalBackLink href={PORTAL_ROUTES.anuncios} label="Volver al tablón" />
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

  if (!announcement.is_public) {
    return (
      <PortalPageShell>
        <PortalBackLink href={PORTAL_ROUTES.anuncios} label="Volver al tablón" />
        <PortalEmptyState
          icon="lock"
          title="Comunicado no disponible"
          description="Este anuncio no está publicado en el tablón estudiantil."
        />
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell>
      <PortalBackLink href={PORTAL_ROUTES.anuncios} label="Volver al tablón" />
      <PortalAnnouncementCard announcement={announcement} showDetailLink={false} />
    </PortalPageShell>
  );
}
