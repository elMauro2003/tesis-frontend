"use client";

import { Button } from "@/components/ui/button";

interface PortalEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  onRetry?: () => void;
}

export function PortalEmptyState({
  icon = "inbox",
  title,
  description,
  onRetry,
}: PortalEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-lowest px-6 py-12 text-center shadow-[var(--shadow-ambient)]">
      <span className="material-symbols-outlined mb-4 text-4xl text-outline">{icon}</span>
      <h3 className="font-headline text-lg font-bold text-on-surface">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-on-surface-variant">{description}</p> : null}
      {onRetry ? (
        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
