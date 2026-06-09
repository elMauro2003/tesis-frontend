"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface PortalLoadMoreProps {
  onClick: () => void;
  isLoading?: boolean;
  hasMore?: boolean;
}

export function PortalLoadMore({ onClick, isLoading = false, hasMore = true }: PortalLoadMoreProps) {
  if (!hasMore) {
    return null;
  }

  return (
    <div className="flex justify-center py-4" aria-live="polite">
      {isLoading ? (
        <Skeleton className="h-4 w-44" aria-label="Cargando más registros" />
      ) : (
        <button
          type="button"
          onClick={onClick}
          className="text-xs font-bold uppercase tracking-widest text-outline transition-colors hover:text-primary"
        >
          Cargar más registros
        </button>
      )}
    </div>
  );
}
