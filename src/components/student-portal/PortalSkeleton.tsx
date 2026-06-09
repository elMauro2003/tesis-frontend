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

export function PortalAnnouncementListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-8">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,55,176,0.03)] md:p-8"
        >
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="h-6 w-20 rounded-full bg-surface-container-high" />
            <div className="h-3 w-24 rounded bg-surface-container-high" />
          </div>
          <div className="mb-4 h-7 w-4/5 rounded bg-surface-container-high" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-surface-container-high" />
            <div className="h-3 w-full rounded bg-surface-container-high" />
            <div className="h-3 w-2/3 rounded bg-surface-container-high" />
          </div>
        </div>
      ))}
    </div>
  );
}
