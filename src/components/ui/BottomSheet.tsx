"use client";

import React, { useEffect, useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidthClassName = "max-w-md",
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

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen) onClose();
    }}>
      <DialogContent className={`transition-all duration-300 ease-out ${presented ? "dialog-sheet-enter" : "dialog-sheet-exit"} ${maxWidthClassName} overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]`}>
        {(title || subtitle) ? (
          <header className="bg-[var(--color-surface-container-lowest)] p-6">
            {title ? <DialogTitle className="text-xl font-headline font-extrabold text-[var(--color-primary-dark)]">{title}</DialogTitle> : null}
            {subtitle ? <DialogDescription className="mt-1 text-sm text-[var(--color-on-surface-variant)]">{subtitle}</DialogDescription> : null}
          </header>
        ) : (
          <>
            <DialogTitle className="sr-only">Diálogo</DialogTitle>
            <DialogDescription className="sr-only">Formulario modal</DialogDescription>
          </>
        )}

        <div>{children}</div>

        {footer ? <footer>{footer}</footer> : null}

        <DialogClose asChild>
          <button type="button" aria-label="Cerrar" className="sr-only" />
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}