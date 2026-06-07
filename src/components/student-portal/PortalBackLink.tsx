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
      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-opacity hover:opacity-80"
    >
      <span className="material-symbols-outlined text-lg">arrow_back</span>
      {label}
    </Link>
  );
}
