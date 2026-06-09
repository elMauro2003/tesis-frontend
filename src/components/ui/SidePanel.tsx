"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/utils/helpers/shadcn/index";

interface SidePanelProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClassName?: string;
}

export function SidePanel({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidthClassName = "max-w-lg",
}: SidePanelProps) {
  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-y-0 right-0 z-[110] flex w-full flex-col overflow-hidden bg-[var(--color-surface-container-lowest)] shadow-2xl outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right",
            "duration-300",
            maxWidthClassName
          )}
          aria-describedby={description ? "side-panel-description" : undefined}
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {description ? (
            <DialogDescription id="side-panel-description" className="sr-only">
              {description}
            </DialogDescription>
          ) : null}
          {children}
          {footer}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>
  );
}
