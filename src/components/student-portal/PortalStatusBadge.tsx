"use client";

import { cn } from "@/utils/helpers/shadcn/index";

type BadgeTone = "success" | "warning" | "primary" | "neutral" | "error";

const TONE_CLASSES: Record<BadgeTone, string> = {
  success: "bg-success-light text-green-700",
  warning: "bg-tertiary-fixed text-tertiary",
  primary: "bg-primary-fixed text-primary",
  neutral: "bg-surface-container-highest text-on-surface-variant",
  error: "bg-error-container text-error",
};

interface PortalStatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  showDot?: boolean;
  className?: string;
}

export function PortalStatusBadge({
  label,
  tone = "neutral",
  showDot = true,
  className,
}: PortalStatusBadgeProps) {
  const dotColor = {
    success: "bg-green-500",
    warning: "bg-tertiary",
    primary: "bg-primary",
    neutral: "bg-outline",
    error: "bg-error",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-3 py-1 text-xs font-bold",
        TONE_CLASSES[tone],
        className
      )}
    >
      {showDot ? <span className={cn("mr-2 h-1.5 w-1.5 rounded-full", dotColor)} /> : null}
      {label}
    </span>
  );
}
