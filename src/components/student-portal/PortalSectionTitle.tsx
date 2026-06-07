"use client";

interface PortalSectionTitleProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PortalSectionTitle({ title, description, action }: PortalSectionTitleProps) {
  return (
    <header className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface md:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-on-surface-variant md:text-base">{description}</p>
        ) : null}
      </div>
      {action}
    </header>
  );
}
