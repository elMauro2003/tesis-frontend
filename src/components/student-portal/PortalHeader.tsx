"use client";

import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";

export function PortalHeader() {
  const { user } = useAuthStore();
  const initials = user?.username?.slice(0, 2).toUpperCase() ?? "ES";

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

        <div className="flex items-center">
          <Link
            href={PORTAL_ROUTES.perfil}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-primary-light text-xs font-bold text-primary ring-2 ring-primary/10"
            aria-label="Perfil"
          >
            {initials}
          </Link>
        </div>
      </div>
    </header>
  );
}
