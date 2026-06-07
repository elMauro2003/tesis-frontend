"use client";

import { PortalUserAvatarMenu } from "@/components/student-portal/PortalUserAvatarMenu";

export function PortalHeader() {
  return (
    <header className="fixed top-0 z-50 w-full glass-panel border-b border-outline-variant/10 shadow-[var(--shadow-ambient)]">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3 md:max-w-2xl">
        <div className="flex items-center gap-2">
          <span
            className="material-symbols-outlined text-2xl text-primary"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            domain
          </span>
          <h1 className="font-headline text-base font-bold text-primary">UCLV Residencias</h1>
        </div>

        <PortalUserAvatarMenu />
      </div>
    </header>
  );
}
