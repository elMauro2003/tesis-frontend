"use client";

import { cn } from "@/utils/helpers/shadcn/index";
import {
  ANNOUNCEMENT_CATEGORY_CONFIG,
  ANNOUNCEMENT_VISIBILITY_DISPLAY,
} from "@/features/announcements/constants";
import { AnnouncementWithCategory } from "@/features/announcements/types";
import { getAnnouncementDisplayDate } from "@/features/announcements/utils/announcementPresentation";

interface AnnouncementCardProps {
  announcement: AnnouncementWithCategory;
  isArchived: boolean;
  isArchivePending?: boolean;
  readOnly?: boolean;
  onEdit: (announcement: AnnouncementWithCategory) => void;
  onDelete: (announcement: AnnouncementWithCategory) => void;
  onArchive: (announcement: AnnouncementWithCategory) => void;
  onUnarchive: (announcement: AnnouncementWithCategory) => void;
}

export function AnnouncementCard({
  announcement,
  isArchived,
  isArchivePending = false,
  readOnly = false,
  onEdit,
  onDelete,
  onArchive,
  onUnarchive,
}: AnnouncementCardProps) {
  const categoryConfig = ANNOUNCEMENT_CATEGORY_CONFIG[announcement.category];
  const visibilityConfig = announcement.is_public
    ? ANNOUNCEMENT_VISIBILITY_DISPLAY.public
    : ANNOUNCEMENT_VISIBILITY_DISPLAY.internal;

  return (
    <article
      className={cn(
        "group overflow-hidden rounded-2xl border-l-4 shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-all duration-300",
        categoryConfig.listAccentClassName,
        categoryConfig.listHoverShadowClassName,
        visibilityConfig.cardClassName,
        isArchived && "opacity-85 saturate-[0.92]"
      )}
    >
      <div
        className={cn(
          "bg-gradient-to-r px-8 pb-5 pt-6",
          categoryConfig.listHeaderGradientClassName,
          visibilityConfig.headerClassName
        )}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                categoryConfig.badgeClassName
              )}
            >
              <span className="material-symbols-outlined text-sm">{categoryConfig.icon}</span>
              {categoryConfig.label}
            </span>

            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                visibilityConfig.badgeClassName
              )}
            >
              <span className={cn("material-symbols-outlined text-sm", visibilityConfig.iconClassName)}>
                {visibilityConfig.icon}
              </span>
              {visibilityConfig.label}
            </span>

            {isArchived ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-container-highest)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
                <span className="material-symbols-outlined text-sm">inventory_2</span>
                Archivado
              </span>
            ) : null}
          </div>

          <time className="shrink-0 text-xs font-medium text-[var(--color-outline)]">
            {getAnnouncementDisplayDate(announcement)}
          </time>
        </div>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[0_10px_22px_rgba(0,55,176,0.08)]",
              !announcement.is_public && "bg-[var(--color-surface-container-highest)]"
            )}
          >
            <span className={cn("material-symbols-outlined text-2xl", categoryConfig.iconClassName)}>
              {categoryConfig.icon}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-tight text-[var(--color-on-surface)]">
              {announcement.title}
            </h2>
            {!announcement.is_public ? (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-on-surface-variant)]">
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Comunicado restringido al equipo administrativo
              </p>
            ) : (
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-[var(--color-primary)]">
                <span className="material-symbols-outlined text-sm">visibility</span>
                Visible en el tablón estudiantil
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="px-8 pb-8 pt-2">
        <p className="text-[15px] leading-relaxed text-[var(--color-on-surface-variant)] whitespace-pre-line">
          {announcement.content}
        </p>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[var(--color-outline-variant)]/15 px-8 py-4">
        <div className="flex items-center gap-2">
          {readOnly ? null : (
            <>
          {!isArchived ? (
            <button
              type="button"
              onClick={() => onEdit(announcement)}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)]"
              aria-label={`Editar ${announcement.title}`}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
            </button>
          ) : null}

          {!isArchived ? (
            <button
              type="button"
              onClick={() => onArchive(announcement)}
              disabled={isArchivePending}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container-high)] hover:text-[var(--color-on-surface-variant)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Archivar ${announcement.title}`}
              title="Archivar anuncio"
            >
              <span className="material-symbols-outlined text-lg">inventory_2</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onUnarchive(announcement)}
              disabled={isArchivePending}
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-[var(--color-primary-selected)] hover:text-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-50"
              aria-label={`Restaurar ${announcement.title}`}
              title="Restaurar anuncio"
            >
              <span className="material-symbols-outlined text-lg">unarchive</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onDelete(announcement)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${announcement.title}`}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
            </>
          )}
        </div>

        <span
          className={cn(
            "material-symbols-outlined opacity-60 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6",
            categoryConfig.iconClassName
          )}
        >
          {categoryConfig.icon}
        </span>
      </footer>
    </article>
  );
}
