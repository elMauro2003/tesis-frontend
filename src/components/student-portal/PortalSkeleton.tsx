"use client";

export function PortalKpiSkeleton() {
  return (
    <div className="animate-pulse rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
      <div className="mb-4 h-12 w-12 rounded-xl bg-surface-container-high" />
      <div className="mb-2 h-3 w-24 rounded bg-surface-container-high" />
      <div className="h-7 w-32 rounded bg-surface-container-high" />
    </div>
  );
}

export function PortalListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)]"
        >
          <div className="mb-2 h-4 w-3/4 rounded bg-surface-container-high" />
          <div className="h-3 w-1/3 rounded bg-surface-container-high" />
        </div>
      ))}
    </div>
  );
}
