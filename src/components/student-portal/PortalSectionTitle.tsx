"use client";

import { ReactNode } from "react";

interface PortalSectionTitleProps {
  title: string;
  description?: string;
  meta?: ReactNode;
  action?: ReactNode;
}

export function PortalSectionTitle({ title, description, meta, action }: PortalSectionTitleProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-12">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline text-3xl font-extrabold tracking-tight text-primary md:text-4xl">
            {title}
          </h1>
          {meta}
        </div>
        {description ? (
          <p className="mt-2 text-base font-medium text-on-surface-variant opacity-80 md:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
