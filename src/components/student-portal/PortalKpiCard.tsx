"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/helpers/shadcn/index";

interface PortalKpiCardProps {
  label: string;
  value: ReactNode;
  icon: string;
  iconClassName?: string;
  iconContainerClassName?: string;
  footer?: ReactNode;
  className?: string;
  filledIcon?: boolean;
}

export function PortalKpiCard({
  label,
  value,
  icon,
  iconClassName,
  iconContainerClassName,
  footer,
  className,
  filledIcon = false,
}: PortalKpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]",
        className
      )}
    >
      <div
        className={cn(
          "mb-4 flex h-12 w-12 items-center justify-center rounded-xl",
          iconContainerClassName ?? "bg-primary-light"
        )}
      >
        <span
          className={cn("material-symbols-outlined text-2xl", iconClassName ?? "text-primary")}
          style={filledIcon ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      </div>
      <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-outline">{label}</p>
      <div className="font-headline text-xl font-bold text-on-surface md:text-2xl">{value}</div>
      {footer ? <div className="mt-3">{footer}</div> : null}
    </div>
  );
}
