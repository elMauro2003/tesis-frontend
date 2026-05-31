"use client";

import { cn } from "@/utils/helpers/shadcn/index";

export type DashboardSegmentedFilterOption = {
  value: string;
  label: string;
};

interface DashboardSegmentedFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  options: DashboardSegmentedFilterOption[];
  className?: string;
}

export function DashboardSegmentedFilter({ value, onValueChange, options, className }: DashboardSegmentedFilterProps) {
  return (
    <div className={cn("inline-flex flex-wrap items-center gap-1 rounded-2xl bg-[var(--color-surface-container-low)] p-1", className)}>
      {options.map((option) => {
        const active = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onValueChange(option.value)}
            className={cn(
              "rounded-xl px-5 py-2 text-sm font-semibold transition-all cursor-pointer",
              active
                ? "bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-primary-hover)]"
                : "text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] hover:text-[var(--color-on-surface)]"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export default DashboardSegmentedFilter;