"use client";

import { ReactNode } from "react";
import { cn } from "@/utils/helpers/shadcn/index";

interface PortalPageShellProps {
  children: ReactNode;
  className?: string;
}

export function PortalPageShell({ children, className }: PortalPageShellProps) {
  return (
    <div className={cn("mx-auto w-full max-w-lg px-4 pb-6 md:max-w-2xl", className)}>
      {children}
    </div>
  );
}
