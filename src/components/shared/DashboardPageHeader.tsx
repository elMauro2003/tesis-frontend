"use client";

import { ReactNode } from "react";
import { Input } from "@/components/ui/input";

interface DashboardPageHeaderProps {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  actionLabel: string;
  onAction: () => void;
  actionIcon?: string;
  topBadge?: string;
  extraAction?: ReactNode;
  searchComponent?: ReactNode;
}

export function DashboardPageHeader({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  actionLabel,
  onAction,
  actionIcon = "add",
  topBadge,
  extraAction,
}: DashboardPageHeaderProps) {
  return (
    <div className="mb-10 space-y-6">
      <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-4">
          {topBadge ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary-selected)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              {topBadge}
            </div>
          ) : null}
          <div className="space-y-2">
            <h1 className="font-headline text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--color-primary-dark)]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm lg:text-base text-[var(--color-on-surface-variant)] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {extraAction}
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-2 bg-primary text-on-primary font-bold text-sm px-4 py-2 rounded-lg shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-primary-hover)] transition-all active:scale-95 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">{actionIcon}</span>
            {actionLabel}
          </button>
        </div>
      </header>

      <section className="space-y-6">
        {searchComponent ? (
          searchComponent
        ) : (
          <div className="relative group">
            <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[var(--color-outline)] group-focus-within:text-[var(--color-primary)] transition-colors">
              <span className="material-symbols-outlined text-xl">search</span>
            </span>
            <Input
              className="h-14 rounded-xl bg-[var(--color-surface-container-low)] pl-12 pr-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] shadow-none outline-none transition-all focus-visible:bg-[var(--color-surface-container-highest)]"
              placeholder={searchPlaceholder}
              type="text"
              value={searchValue}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </div>
        )}
      </section>
    </div>
  );
}