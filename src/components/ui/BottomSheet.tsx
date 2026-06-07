"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/utils/helpers/shadcn/index";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
  /** Formularios largos: altura máxima, scroll interno y pie fijo. */
  scrollable?: boolean;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidthClassName = "max-w-md",
  scrollable = false,
}: BottomSheetProps) {
  const [mounted, setMounted] = useState(open);
  const [presented, setPresented] = useState(false);

  useEffect(() => {
    let frame = 0;
    let hideTimer = 0;

    if (open) {
      setMounted(true);
      setPresented(false);
      frame = window.requestAnimationFrame(() => setPresented(true));
      return () => window.cancelAnimationFrame(frame);
    }

    setPresented(false);
    hideTimer = window.setTimeout(() => setMounted(false), 320);

    return () => window.clearTimeout(hideTimer);
  }, [open]);

  if (!mounted) return null;

  const smMaxWidthClass = maxWidthClassName.startsWith("max-w-")
    ? maxWidthClassName.replace(/^max-w-/, "sm:max-w-")
    : maxWidthClassName;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "transition-all duration-300 ease-out",
          presented ? "dialog-sheet-enter" : "dialog-sheet-exit",
          "w-[calc(100vw-2rem)] overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)] sm:w-full",
          maxWidthClassName,
          smMaxWidthClass,
          scrollable &&
            "flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] flex-col"
        )}
      >
        {(title || subtitle) ? (
          <header
            className={cn(
              "shrink-0 bg-[var(--color-surface-container-lowest)]",
              scrollable ? "border-b border-outline-variant/10 px-4 pb-3 pt-4" : "p-6"
            )}
          >
            {title ? (
              <DialogTitle className="text-lg font-headline font-extrabold text-[var(--color-primary-dark)] sm:text-xl">
                {title}
              </DialogTitle>
            ) : null}
            {subtitle ? (
              <DialogDescription className="mt-0.5 text-xs leading-snug text-[var(--color-on-surface-variant)] sm:text-sm">
                {subtitle}
              </DialogDescription>
            ) : null}
          </header>
        ) : (
          <>
            <DialogTitle className="sr-only">Diálogo</DialogTitle>
            <DialogDescription className="sr-only">Formulario modal</DialogDescription>
          </>
        )}

        <div
          className={cn(
            "w-full min-w-0",
            scrollable && "flex min-h-0 flex-1 flex-col overflow-hidden"
          )}
        >
          <div
            className={cn(
              scrollable && "min-h-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
            )}
          >
            {children}
          </div>
        </div>

        {footer ? (
          <footer
            className={cn(
              "shrink-0 bg-[var(--color-surface-container-lowest)]",
              scrollable
                ? "border-t border-outline-variant/15 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
                : undefined
            )}
          >
            {footer}
          </footer>
        ) : null}

        <DialogClose asChild>
          <button type="button" aria-label="Cerrar" className="sr-only" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
