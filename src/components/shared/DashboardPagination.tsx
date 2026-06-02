"use client";

import { Button } from "@/components/ui/button";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";

interface DashboardPaginationProps {
  page: number;
  totalPages: number;
  totalItems?: number;
  itemLabel?: string;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
}

const defaultPageSizes = [10, 25, 50];

export function DashboardPagination({
  page,
  totalPages,
  totalItems,
  itemLabel = "registros",
  pageSize,
  pageSizeOptions = defaultPageSizes,
  onPageChange,
  onPageSizeChange,
  className = "",
}: DashboardPaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(Math.max(1, page), safeTotalPages);
  const hasRange = totalItems !== undefined && pageSize !== undefined;
  const firstItem = hasRange && totalItems > 0 ? ((safePage - 1) * pageSize) + 1 : 0;
  const lastItem = hasRange && totalItems > 0 ? Math.min(safePage * pageSize, totalItems) : 0;
  const canGoBack = safePage > 1;
  const canGoForward = safePage < safeTotalPages;

  const summaryText = totalItems !== undefined
    ? totalItems === 0
      ? `No hay ${itemLabel} para mostrar`
      : hasRange
        ? `Mostrando ${firstItem}-${lastItem} de ${totalItems} ${itemLabel}`
        : `Total: ${totalItems} ${itemLabel}`
    : `Página ${safePage} de ${safeTotalPages}`;

  return (
    <footer className={`flex flex-col gap-4 border-t border-[var(--color-outline-variant)]/10 bg-[var(--color-surface-container-low)]/30 px-6 py-4 lg:flex-row lg:items-center lg:justify-between ${className}`}>
      <div className="space-y-1">
        <div className="text-sm font-medium text-[var(--color-on-surface-variant)]">{summaryText}</div>
        <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-outline)]">
          Paginación compartida
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {pageSize !== undefined && onPageSizeChange ? (
          <DashboardFilterSelect
            className="w-full sm:w-36"
            value={String(pageSize)}
            onValueChange={(value) => onPageSizeChange(Number(value))}
            placeholder="Filas"
            options={pageSizeOptions.map((size) => ({ value: String(size), label: `${size}` }))}
            triggerClassName="h-10 rounded-xl"
          />
        ) : null}

        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="rounded-xl"
            onClick={() => onPageChange(1)}
            disabled={!canGoBack}
            aria-label="Primera página"
          >
            <span className="material-symbols-outlined text-lg">first_page</span>
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="rounded-xl"
            onClick={() => onPageChange(Math.max(1, safePage - 1))}
            disabled={!canGoBack}
            aria-label="Página anterior"
          >
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </Button>
          <div className="min-w-24 px-3 text-sm font-semibold text-[var(--color-on-surface-variant)]">
            {safePage} / {safeTotalPages}
          </div>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="rounded-xl"
            onClick={() => onPageChange(Math.min(safeTotalPages, safePage + 1))}
            disabled={!canGoForward}
            aria-label="Página siguiente"
          >
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </Button>
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="rounded-xl"
            onClick={() => onPageChange(safeTotalPages)}
            disabled={!canGoForward}
            aria-label="Última página"
          >
            <span className="material-symbols-outlined text-lg">last_page</span>
          </Button>
        </div>
      </div>
    </footer>
  );
}

export default DashboardPagination;