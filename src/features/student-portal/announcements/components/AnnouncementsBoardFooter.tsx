"use client";

import Link from "next/link";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";

interface AnnouncementsBoardFooterProps {
  message?: string;
  archiveHref?: string;
  archiveLabel?: string;
}

export function AnnouncementsBoardFooter({
  message = "Has llegado al final del tablón por hoy.",
  archiveHref = PORTAL_ROUTES.anunciosArchivados,
  archiveLabel = "Ver anuncios archivados",
}: AnnouncementsBoardFooterProps) {
  return (
    <div className="mt-12 text-center md:mt-16">
      <div className="mx-auto mb-8 h-1 w-16 rounded-full bg-primary/20" />
      <p className="text-sm italic text-outline">{message}</p>
      <Link
        href={archiveHref}
        className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition-transform hover:underline active:scale-95"
      >
        {archiveLabel}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </Link>
    </div>
  );
}
