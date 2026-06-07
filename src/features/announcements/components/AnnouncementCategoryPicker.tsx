"use client";

import { cn } from "@/utils/helpers/shadcn/index";
import { ANNOUNCEMENT_CATEGORY_CONFIG } from "@/features/announcements/constants";
import { AnnouncementCategory } from "@/features/announcements/types";

interface AnnouncementCategoryPickerProps {
  value: AnnouncementCategory;
  onValueChange: (value: AnnouncementCategory) => void;
}

const categories: AnnouncementCategory[] = ["urgent", "informative", "important"];

export function AnnouncementCategoryPicker({ value, onValueChange }: AnnouncementCategoryPickerProps) {
  return (
    <div className="space-y-2">
      <p className="ml-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        Tipo de anuncio
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        {categories.map((category) => {
          const config = ANNOUNCEMENT_CATEGORY_CONFIG[category];
          const selected = value === category;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onValueChange(category)}
              aria-pressed={selected}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200",
                config.cardClassName,
                selected ? config.selectedClassName : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-ambient)]"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn("material-symbols-outlined text-2xl", config.iconClassName)}>
                  {config.icon}
                </span>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest",
                    config.badgeClassName
                  )}
                >
                  {config.label}
                </span>
              </div>
              <p className="mt-4 text-sm font-bold text-[var(--color-on-surface)]">{config.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
                {config.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
