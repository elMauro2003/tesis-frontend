"use client";

import Link from "next/link";

interface PortalBackLinkProps {
  href: string;
  label?: string;
}

export function PortalBackLink({ href, label = "Volver" }: PortalBackLinkProps) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/20 bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-on-surface shadow-[0_4px_16px_rgba(0,55,176,0.04)] transition-colors hover:bg-surface-container-low hover:text-primary"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-fixed text-primary">
        <span className="material-symbols-outlined text-base">arrow_back</span>
      </span>
      {label}
    </Link>
  );
}
