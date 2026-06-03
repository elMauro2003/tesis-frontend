import { ReactNode } from "react";

interface DashboardFiltersBarProps {
  left?: ReactNode;
  right?: ReactNode;
  className?: string;
}

export function DashboardFiltersBar({ left, right, className = "" }: DashboardFiltersBarProps) {
  return (
    <section className={`mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      <div className="flex flex-wrap items-center gap-3">{left}</div>
      <div className="flex flex-wrap items-center gap-3 lg:justify-end">{right}</div>
    </section>
  );
}

export default DashboardFiltersBar;