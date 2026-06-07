"use client";

import { ReactNode } from "react";
import { PortalBottomNav } from "@/components/student-portal/PortalBottomNav";
import { PortalHeader } from "@/components/student-portal/PortalHeader";

interface StudentPortalLayoutProps {
  children: ReactNode;
}

export function StudentPortalLayout({ children }: StudentPortalLayoutProps) {
  return (
    <div className="min-h-screen bg-background font-body text-on-surface">
      <PortalHeader />
      <main className="pt-[4.25rem] pb-24">{children}</main>
      <PortalBottomNav />
    </div>
  );
}
