"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/helpers/shadcn/index";

interface CountProps {
  count?: number;
  className?: string;
}

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  withAvatar?: boolean;
  className?: string;
}

export function DashboardMetricCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[10rem] flex-col gap-6 rounded-xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,55,176,0.03)]",
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-12 w-12 rounded-xl" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="mt-auto space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </div>
  );
}

export function DashboardMetricGridSkeleton({ count = 4, className }: CountProps) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4", className)}
      aria-busy="true"
      aria-label="Cargando métricas"
    >
      {Array.from({ length: count }).map((_, index) => (
        <DashboardMetricCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DashboardStatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)]", className)}>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-3 h-9 w-20" />
      <Skeleton className="mt-2 h-4 w-36" />
    </div>
  );
}

export function DashboardStatsGridSkeleton({ count = 4, className }: CountProps) {
  return (
    <div
      className={cn("grid gap-4 sm:grid-cols-2 xl:grid-cols-4", className)}
      aria-busy="true"
      aria-label="Cargando estadísticas"
    >
      {Array.from({ length: count }).map((_, index) => (
        <DashboardStatsCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DashboardTableRowSkeleton({
  columns = 5,
  withAvatar = false,
}: {
  columns?: number;
  withAvatar?: boolean;
}) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-5">
          {withAvatar && index === 0 ? (
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ) : (
            <Skeleton className={cn("h-4", index === columns - 2 ? "w-64" : "w-24")} />
          )}
        </td>
      ))}
    </tr>
  );
}

export function DashboardTableSkeleton({
  rows = 5,
  columns = 5,
  withAvatar = false,
}: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <DashboardTableRowSkeleton key={index} columns={columns} withAvatar={withAvatar} />
      ))}
    </>
  );
}

export function DashboardSiteCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-surface-container-low p-6", className)}>
      <Skeleton className="h-14 w-14 rounded-full" />
      <Skeleton className="mt-5 h-6 w-2/3" />
      <Skeleton className="mt-2 h-4 w-full" />
      <div className="mt-6 grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="col-span-2 h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export function DashboardSiteGridSkeleton({ count = 3, className }: CountProps) {
  return (
    <div
      className={cn("grid gap-6 md:grid-cols-2 xl:grid-cols-3", className)}
      aria-busy="true"
      aria-label="Cargando sedes"
    >
      {Array.from({ length: count }).map((_, index) => (
        <DashboardSiteCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DashboardAnnouncementCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-surface-container-low p-8", className)}>
      <div className="mb-6 flex justify-between">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
      <Skeleton className="mb-4 h-8 w-2/3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}

export function DashboardAnnouncementListSkeleton({ count = 3, className }: CountProps) {
  return (
    <div
      className={cn("mx-auto max-w-3xl space-y-8", className)}
      aria-busy="true"
      aria-label="Cargando anuncios"
    >
      {Array.from({ length: count }).map((_, index) => (
        <DashboardAnnouncementCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function DashboardRoomListSkeleton({ count = 5, className }: CountProps) {
  return (
    <div className={cn("space-y-4", className)} aria-busy="true" aria-label="Cargando cuartos">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-[88px] w-full rounded-xl" />
      ))}
    </div>
  );
}

export function DashboardOccupancyChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)] lg:col-span-2",
        className
      )}
      aria-busy="true"
      aria-label="Cargando ocupación por edificio"
    >
      <div className="mb-10 flex items-center justify-between">
        <Skeleton className="h-5 w-48" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="space-y-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index}>
            <div className="mb-2 flex justify-between">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-4 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DashboardComplaintsChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-2xl bg-surface-container-lowest p-8 shadow-[0_4px_24px_rgba(0,0,0,0.02)]",
        className
      )}
      aria-busy="true"
      aria-label="Cargando estado de quejas"
    >
      <Skeleton className="mb-6 h-5 w-56 self-start" />
      <Skeleton className="mb-8 h-48 w-48 rounded-full" />
      <div className="w-full space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <Skeleton key={index} className="h-12 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardInsightsSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-outline-variant/40 bg-surface-container-low/50 p-6",
        className
      )}
      aria-busy="true"
      aria-label="Calculando indicadores"
    >
      <Skeleton className="mb-2 h-4 w-48" />
      <Skeleton className="mb-6 h-3 w-72" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function DashboardSearchSuggestionsSkeleton({ count = 4, className }: CountProps) {
  return (
    <div className={cn("py-1", className)} aria-busy="true" aria-label="Cargando sugerencias">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="px-4 py-3">
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  );
}

export function DashboardFilterSelectSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-full rounded-lg sm:w-56", className)} />;
}

export function DashboardFormWizardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full flex-col overflow-hidden", className)} aria-busy="true" aria-label="Cargando formulario">
      <div className="mb-8 shrink-0 rounded-xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
        <div className="mx-auto flex max-w-4xl items-center">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex flex-1 items-center">
              <div className="flex w-32 flex-col items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
              {index < 2 ? <Skeleton className="mx-2 h-1.5 flex-1 rounded-full" /> : null}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 space-y-6 rounded-xl bg-surface-container-lowest p-8 shadow-[var(--shadow-ambient)]">
        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full rounded-2xl" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardPanelDetailSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-6", className)} aria-busy="true" aria-label="Cargando detalle">
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-2xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex gap-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
