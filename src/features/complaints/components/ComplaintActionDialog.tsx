"use client";

import { ReactNode } from "react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Complaint } from "@/types/models";
import { getComplaintTitle } from "@/features/complaints/utils/complaintDashboard";
import { cn } from "@/utils/helpers/shadcn/index";

interface ComplaintActionDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  complaint: Complaint | null;
  icon: string;
  iconWrapperClassName?: string;
  maxWidthClassName?: string;
  children: ReactNode;
  footer: ReactNode;
  headerLayout?: "inline" | "stacked";
}

export function ComplaintActionDialog({
  open,
  onClose,
  title,
  complaint,
  icon,
  iconWrapperClassName = "bg-[var(--color-primary-selected)] text-[var(--color-primary)]",
  maxWidthClassName = "max-w-md",
  children,
  footer,
  headerLayout = "stacked",
}: ComplaintActionDialogProps) {
  const complaintLabel = complaint ? getComplaintTitle(complaint.description) : "—";

  return (
    <Dialog
      open={open && !!complaint}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent
        className={cn(
          "flex max-h-[min(92dvh,calc(100dvh-env(safe-area-inset-bottom,0px)))] flex-col overflow-hidden rounded-2xl border-0 bg-[var(--color-surface-container-lowest)] p-0 shadow-2xl",
          maxWidthClassName
        )}
      >
        <header className="relative shrink-0 p-6 pb-4">
          <button
            type="button"
            className="absolute right-5 top-5 cursor-pointer text-[var(--color-outline)] transition-colors hover:text-[var(--color-on-surface)]"
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {headerLayout === "inline" ? (
            <div className="flex items-start gap-3 pr-8">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconWrapperClassName)}>
                <span className="material-symbols-outlined text-[22px]">{icon}</span>
              </div>
              <div className="min-w-0 flex-1">
                <DialogTitle className="font-headline text-lg font-extrabold leading-tight text-[var(--color-on-surface)]">
                  {title}
                </DialogTitle>
                <DialogDescription className="mt-1.5 line-clamp-2 break-words text-xs font-medium text-[var(--color-on-surface-variant)]">
                  Queja: {complaintLabel}
                </DialogDescription>
              </div>
            </div>
          ) : (
            <div className="pr-8">
              <div className="flex items-center gap-3">
                <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", iconWrapperClassName)}>
                  <span className="material-symbols-outlined text-[22px]">{icon}</span>
                </div>
                <DialogTitle className="font-headline text-lg font-extrabold leading-tight text-[var(--color-on-surface)] sm:text-xl">
                  {title}
                </DialogTitle>
              </div>
              <DialogDescription className="mt-2 line-clamp-2 break-words text-xs font-medium text-[var(--color-on-surface-variant)]">
                Queja: {complaintLabel}
              </DialogDescription>
            </div>
          )}
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-6 pb-6">{children}</div>

        <footer className="shrink-0 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/50 p-4">
          {footer}
        </footer>
      </DialogContent>
    </Dialog>
  );
}
