"use client";

import { cn } from "@/utils/helpers/shadcn/index";

interface ModalCloseButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function ModalCloseButton({
  onClick,
  label = "Cerrar modal",
  className,
}: ModalCloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent p-1 text-[var(--color-outline)] shadow-none outline-none transition-colors hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-on-surface)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/30",
        className
      )}
    >
      <span className="material-symbols-outlined text-[22px] leading-none">close</span>
    </button>
  );
}
