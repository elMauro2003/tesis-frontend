"use client";

import Link from "next/link";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { formatAnnouncementDate } from "@/features/announcements/utils/announcementPresentation";
import { Information } from "@/types/models";

interface PortalAnnouncementCardProps {
  announcement: Information;
}

export function PortalAnnouncementCard({ announcement }: PortalAnnouncementCardProps) {
  return (
    <Link
      href={PORTAL_ROUTES.anuncioDetalle(announcement.id)}
      className="block rounded-xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)] transition-colors hover:bg-surface-container-low"
    >
      <div className="mb-2 flex items-start justify-between gap-3">
        <h2 className="font-headline text-base font-bold text-on-surface">{announcement.title}</h2>
        <time className="shrink-0 text-xs text-outline">
          {formatAnnouncementDate(announcement.published_date)}
        </time>
      </div>
      <p className="line-clamp-3 text-sm leading-relaxed text-on-surface-variant whitespace-pre-line">
        {announcement.content}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
        Leer más
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </span>
    </Link>
  );
}
