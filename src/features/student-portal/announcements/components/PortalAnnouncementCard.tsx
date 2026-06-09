"use client";

import Link from "next/link";
import { CollapsibleText } from "@/components/student-portal/CollapsibleText";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { cn } from "@/utils/helpers/shadcn/index";
import {
  getPortalAnnouncementCategory,
  getPortalAnnouncementCategoryConfig,
  getPortalAnnouncementDisplayDate,
  getPortalAnnouncementFooterIconClassName,
} from "@/features/student-portal/announcements/utils/portalAnnouncementPresentation";
import { Information } from "@/types/models";

interface PortalAnnouncementCardProps {
  announcement: Information;
  className?: string;
  showDetailLink?: boolean;
}

export function PortalAnnouncementCard({
  announcement,
  className,
  showDetailLink = true,
}: PortalAnnouncementCardProps) {
  const category = getPortalAnnouncementCategory(announcement);
  const categoryConfig = getPortalAnnouncementCategoryConfig(announcement);
  const footerIconClassName = getPortalAnnouncementFooterIconClassName(category);

  return (
    <article
      className={cn(
        "group rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,55,176,0.06)] md:p-8",
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
            categoryConfig.badgeClassName
          )}
        >
          {categoryConfig.label}
        </span>
        <time className="shrink-0 text-xs font-medium text-outline">
          {getPortalAnnouncementDisplayDate(announcement)}
        </time>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 font-headline text-2xl font-bold leading-tight text-on-surface">
          {showDetailLink ? (
            <Link
              href={PORTAL_ROUTES.anuncioDetalle(announcement.id)}
              className="transition-colors hover:text-primary"
            >
              {announcement.title}
            </Link>
          ) : (
            announcement.title
          )}
        </h2>
        <CollapsibleText
          text={announcement.content}
          className="text-[15px] text-on-surface-variant"
          maxCharsBeforeCollapse={320}
          clampLines={6}
        />
      </div>

      <footer
        className={cn(
          "flex border-t border-outline-variant/15 pt-4",
          showDetailLink ? "items-center justify-between" : "justify-end"
        )}
      >
        {showDetailLink ? (
          <Link
            href={PORTAL_ROUTES.anuncioDetalle(announcement.id)}
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-primary transition-opacity hover:opacity-80"
          >
            Ver detalle
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        ) : null}
        <span
          className={cn(
            "material-symbols-outlined opacity-60 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            footerIconClassName
          )}
        >
          {categoryConfig.icon}
        </span>
      </footer>
    </article>
  );
}
