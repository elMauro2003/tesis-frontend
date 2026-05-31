"use client";

import { cn } from "@/utils/helpers/shadcn/index";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type DashboardFilterSelectOption = {
  value: string;
  label: string;
};

interface DashboardFilterSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder: string;
  options: DashboardFilterSelectOption[];
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function DashboardFilterSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
  triggerClassName,
  contentClassName,
  disabled,
}: DashboardFilterSelectProps) {
  return (
    <div className={cn("w-full", className)}>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          className={cn(
            "h-12 rounded-2xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-container-low)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] [&>span]:line-clamp-1",
            triggerClassName
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default DashboardFilterSelect;