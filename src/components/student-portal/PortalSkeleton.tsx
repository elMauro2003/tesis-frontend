"use client";

import { StudentPortalLayout } from "@/components/layouts/StudentPortalLayout";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/utils/helpers/shadcn/index";

interface SkeletonCountProps {
  count?: number;
  className?: string;
}

export function PortalSectionTitleSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-8 space-y-3 md:mb-12", className)}>
      <div className="flex flex-wrap items-center gap-3">
        <Skeleton className="h-9 w-48 md:h-10 md:w-56" />
        <Skeleton className="h-8 w-44 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full max-w-md" />
      <Skeleton className="h-4 w-3/4 max-w-sm" />
    </div>
  );
}

export function PortalQuotaBadgeSkeleton() {
  return <Skeleton className="h-8 w-52 rounded-full" />;
}

export function PortalActionButtonSkeleton() {
  return <Skeleton className="h-10 w-full rounded-lg sm:w-36" />;
}

export function PortalKpiSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]",
        className
      )}
    >
      <Skeleton className="mb-4 h-12 w-12 rounded-xl" />
      <Skeleton className="mb-2 h-3 w-20" />
      <Skeleton className="h-7 w-28" />
    </div>
  );
}

export function PortalKpiGridSkeleton({ count = 3, className }: SkeletonCountProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <PortalKpiSkeleton key={index} className={index === count - 1 ? "col-span-2 md:col-span-1" : undefined} />
      ))}
    </div>
  );
}

export function PortalListCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest p-4 shadow-[var(--shadow-ambient)]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-3 w-1/3" />
        </div>
        <Skeleton className="h-7 w-16 rounded-lg" />
      </div>
      <div className="mt-3 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

export function PortalListSkeleton({ count = 3, className }: SkeletonCountProps) {
  return (
    <div className={cn("space-y-3", className)} aria-busy="true" aria-label="Cargando lista">
      {Array.from({ length: count }).map((_, index) => (
        <PortalListCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PortalComplaintCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border-l-4 border-l-surface-container-high bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]",
        className
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-7 w-20 rounded-lg" />
      </div>
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-11/12" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

export function PortalComplaintListSkeleton({ count = 3, className }: SkeletonCountProps) {
  return (
    <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Cargando quejas">
      {Array.from({ length: count }).map((_, index) => (
        <PortalComplaintCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PortalVisibleComplaintsPanelSkeleton({ className }: { className?: string }) {
  return (
    <aside
      className={cn("rounded-xl bg-surface-container-low p-5", className)}
      aria-busy="true"
      aria-label="Cargando quejas visibles"
    >
      <div className="mb-5 flex items-center gap-2">
        <Skeleton className="h-5 w-5 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="space-y-5">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index}>
            <div className="space-y-2">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-5 w-20 rounded-lg" />
            </div>
            {index < 2 ? <Skeleton className="mt-5 h-px w-full" /> : null}
          </div>
        ))}
      </div>
      <Skeleton className="mt-6 h-11 w-full rounded-lg" />
    </aside>
  );
}

export function PortalPublicComplaintCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest p-6 shadow-[var(--shadow-ambient)] md:p-8",
        className
      )}
    >
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <Skeleton className="h-7 w-24 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-11/12" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
      <div className="mt-6 border-t border-outline-variant/15 pt-6 md:mt-8 md:pt-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2 rounded-xl bg-surface-container-low p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PortalPublicComplaintListSkeleton({ count = 3, className }: SkeletonCountProps) {
  return (
    <div className={cn("space-y-6", className)} aria-busy="true" aria-label="Cargando archivo de quejas">
      {Array.from({ length: count }).map((_, index) => (
        <PortalPublicComplaintCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PortalAnnouncementCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-surface-container-lowest p-6 shadow-[0_4px_20px_rgba(0,55,176,0.03)] md:p-8",
        className
      )}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="mb-4 h-7 w-4/5" />
      <div className="mb-8 space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <div className="flex items-center justify-between border-t border-outline-variant/15 pt-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function PortalAnnouncementListSkeleton({ count = 3, className }: SkeletonCountProps) {
  return (
    <div className={cn("space-y-8", className)} aria-busy="true" aria-label="Cargando anuncios">
      {Array.from({ length: count }).map((_, index) => (
        <PortalAnnouncementCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function PortalStatsBarSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface-container-low px-4 py-3",
        className
      )}
    >
      <Skeleton className="h-4 w-24" />
      <Skeleton className="hidden h-4 w-24 sm:block" />
      <Skeleton className="h-4 w-28" />
      <Skeleton className="ml-auto h-3 w-32" />
    </div>
  );
}

export function PortalFilterBarSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2", className)}>
      <Skeleton className="h-10 w-full rounded-lg" />
      <Skeleton className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function PortalComplaintFormSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-4 p-4", className)} aria-busy="true" aria-label="Cargando formulario">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-3 w-40" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-3 w-12" />
        </div>
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function PortalSectionHeadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("mb-4 flex items-center gap-2", className)}>
      <Skeleton className="h-5 w-5 rounded-full" />
      <Skeleton className="h-6 w-40" />
    </div>
  );
}

export function PortalComplaintsPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando quejas">
      <PortalSectionTitleSkeleton />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
        <div className="order-1 lg:order-2 lg:col-span-4">
          <PortalVisibleComplaintsPanelSkeleton />
        </div>
        <div className="order-2 space-y-6 lg:order-1 lg:col-span-8">
          <PortalSectionHeadingSkeleton />
          <PortalComplaintListSkeleton count={3} />
        </div>
      </div>
    </div>
  );
}

export function PortalEvaluationsPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando evaluaciones">
      <PortalSectionTitleSkeleton />
      <PortalKpiGridSkeleton className="mb-6" />
      <PortalSectionHeadingSkeleton />
      <PortalListSkeleton count={4} />
    </div>
  );
}

export function PortalAnnouncementsPageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando anuncios">
      <PortalSectionTitleSkeleton />
      <PortalAnnouncementListSkeleton count={3} />
    </div>
  );
}

export function PortalPublicArchivePageSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando archivo público">
      <Skeleton className="mb-6 h-10 w-40 rounded-full" />
      <PortalSectionTitleSkeleton />
      <PortalStatsBarSkeleton />
      <PortalFilterBarSkeleton />
      <PortalPublicComplaintListSkeleton count={3} />
    </div>
  );
}

export function PortalLayoutSkeleton() {
  return (
    <StudentPortalLayout>
      <PortalPageShell>
        <PortalEvaluationsPageSkeleton />
      </PortalPageShell>
    </StudentPortalLayout>
  );
}
