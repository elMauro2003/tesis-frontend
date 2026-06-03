"use client";

import React from "react";
import { cn } from "@/utils/helpers/shadcn/index";
import { Input } from "@/components/ui/input";

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  wrapperClassName?: string;
  inputClassName?: string;
  iconClassName?: string;
}

export function SearchField({
  value,
  onChange,
  placeholder = "Buscar...",
  wrapperClassName,
  inputClassName,
  iconClassName,
  className,
  ...props
}: SearchFieldProps) {
  return (
    <div className={cn("relative group w-full", wrapperClassName)}>
      <span className={cn("pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-outline)] group-focus-within:text-[var(--color-primary)] transition-colors", iconClassName)}>
        <span className="material-symbols-outlined text-xl">search</span>
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "h-14 rounded-2xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-lowest)] pl-12 pr-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)] shadow-none transition-all outline-none hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-container-low)] focus-visible:border-[var(--color-primary)]/50 focus-visible:bg-[var(--color-surface-container-low)]",
          className,
          inputClassName
        )}
        {...props}
      />
    </div>
  );
}

export default SearchField;
