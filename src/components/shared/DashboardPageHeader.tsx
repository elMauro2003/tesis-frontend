"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { SearchField } from "@/components/shared/SearchField";

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
  searchComponent,
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
          <Button type="button" variant="add" onClick={onAction} className="cursor-pointer">
            <span className="material-symbols-outlined text-lg">{actionIcon}</span>
            {actionLabel}
          </Button>
        </div>
      </header>

      <section className="space-y-6">
        {searchComponent ? (
          searchComponent
        ) : (
          <SearchField
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        )}
      </section>
    </div>
  );
}