"use client";

import { cn } from "@/utils/helpers/shadcn/index";
import { ANNOUNCEMENT_VISIBILITY_OPTIONS } from "@/features/announcements/constants";

interface AnnouncementVisibilityPickerProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function AnnouncementVisibilityPicker({ value, onValueChange }: AnnouncementVisibilityPickerProps) {
  return (
    <div className="space-y-2">
      <p className="ml-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
        Visibilidad
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ANNOUNCEMENT_VISIBILITY_OPTIONS.map((option) => {
          const selected = value === option.value;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => onValueChange(option.value)}
              aria-pressed={selected}
              className={cn(
                "cursor-pointer rounded-2xl border p-4 text-left transition-all duration-200",
                option.cardClassName,
                selected ? option.selectedClassName : "hover:-translate-y-0.5 hover:shadow-[var(--shadow-ambient)]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("material-symbols-outlined text-2xl", option.iconClassName)}>
                  {option.icon}
                </span>
                <div>
                  <p className="text-sm font-bold text-[var(--color-on-surface)]">{option.label}</p>
                  <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
                    {option.description}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
