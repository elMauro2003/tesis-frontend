"use client";

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
    <div className="flex justify-center py-4">
      <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="text-xs font-bold uppercase tracking-widest text-outline transition-colors hover:text-primary disabled:opacity-50"
      >
        {isLoading ? "Cargando..." : "Cargar más registros"}
      </button>
    </div>
  );
}
