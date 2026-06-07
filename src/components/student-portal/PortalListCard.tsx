"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/helpers/shadcn/index";

interface PortalListCardProps {
  title: string;
  subtitle?: string;
  meta?: ReactNode;
  badge?: ReactNode;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export function PortalListCard({
  title,
  subtitle,
  meta,
  badge,
  description,
  onClick,
  className,
}: PortalListCardProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(
        "w-full rounded-xl bg-surface-container-lowest p-4 text-left shadow-[var(--shadow-ambient)] transition-colors",
        onClick && "hover:bg-surface-container-low active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-on-surface">{title}</p>
          {subtitle ? <p className="mt-0.5 text-xs text-on-surface-variant">{subtitle}</p> : null}
        </div>
        {badge}
      </div>
      {description ? (
        <p className="mt-2 text-sm italic text-on-surface-variant line-clamp-2">{description}</p>
      ) : null}
      {meta ? <div className="mt-3">{meta}</div> : null}
    </Component>
  );
}
