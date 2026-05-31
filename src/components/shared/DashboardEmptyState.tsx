"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryAction?: ReactNode;
  className?: string;
}

export function DashboardEmptyState({
  title,
  description,
  icon = "inbox",
  actionLabel,
  onAction,
  secondaryAction,
  className,
}: DashboardEmptyStateProps) {
  return (
    <div className={className ?? "flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--color-outline-variant)]/35 bg-[var(--color-surface-container-low)] px-6 py-14 text-center"}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-selected)] text-[var(--color-primary)] shadow-[var(--shadow-ambient)]">
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold text-[var(--color-primary-dark)]">{title}</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--color-on-surface-variant)]">{description}</p>
      {(actionLabel && onAction) || secondaryAction ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actionLabel && onAction ? (
            <Button type="button" onClick={onAction}>
              <span className="material-symbols-outlined text-lg">add</span>
              {actionLabel}
            </Button>
          ) : null}
          {secondaryAction}
        </div>
      ) : null}
    </div>
  );
}

export default DashboardEmptyState;