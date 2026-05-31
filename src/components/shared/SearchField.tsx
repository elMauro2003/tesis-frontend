"use client";

import React from "react";
import { Input } from "@/components/ui/input";

interface SearchFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}

export function SearchField({ value, onChange, placeholder = "Buscar...", className, ...props }: SearchFieldProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-outline)]">
        <span className="material-symbols-outlined text-xl">search</span>
      </span>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`h-14 rounded-xl bg-[var(--color-surface-container-low)] pl-12 pr-4 text-sm ${className || ""}`}
        {...props}
      />
    </div>
  );
}

export default SearchField;
