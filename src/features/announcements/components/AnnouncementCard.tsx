"use client";

import { ANNOUNCEMENT_CATEGORY_CONFIG } from "@/features/announcements/constants";
import { AnnouncementWithCategory } from "@/features/announcements/types";
import { getAnnouncementDisplayDate } from "@/features/announcements/utils/announcementPresentation";

interface AnnouncementCardProps {
  announcement: AnnouncementWithCategory;
  onEdit: (announcement: AnnouncementWithCategory) => void;
  onDelete: (announcement: AnnouncementWithCategory) => void;
}

export function AnnouncementCard({ announcement, onEdit, onDelete }: AnnouncementCardProps) {
  const categoryConfig = ANNOUNCEMENT_CATEGORY_CONFIG[announcement.category];

  return (
    <article className="group rounded-2xl bg-[var(--color-surface-container-lowest)] p-8 shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-all duration-300 hover:shadow-[0_20px_40px_rgba(0,55,176,0.06)]">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${categoryConfig.badgeClassName}`}
          >
            {categoryConfig.label}
          </span>
          {!announcement.is_public ? (
            <span className="inline-flex items-center rounded-full bg-[var(--color-surface-container-high)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
              Interno
            </span>
          ) : null}
        </div>
        <time className="shrink-0 text-xs font-medium text-[var(--color-outline)]">
          {getAnnouncementDisplayDate(announcement)}
        </time>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold leading-tight text-[var(--color-on-surface)]">
          {announcement.title}
        </h2>
        <p className="text-[15px] leading-relaxed text-[var(--color-on-surface-variant)] whitespace-pre-line">
          {announcement.content}
        </p>
      </div>

      <footer className="flex items-center justify-between gap-4 border-t border-[var(--color-outline-variant)]/15 pt-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(announcement)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)]"
            aria-label={`Editar ${announcement.title}`}
          >
            <span className="material-symbols-outlined text-lg">edit</span>
          </button>
          <button
            type="button"
            onClick={() => onDelete(announcement)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-red-50 hover:text-red-600"
            aria-label={`Eliminar ${announcement.title}`}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>

        <span
          className={`material-symbols-outlined transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${categoryConfig.iconClassName}`}
        >
          {categoryConfig.icon}
        </span>
      </footer>
    </article>
  );
}
