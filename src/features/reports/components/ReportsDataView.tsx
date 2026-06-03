"use client";

import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { TableEmptyState } from "@/components/shared/TableEmptyState";
import { REPORTS_RESULTS_PAGE_SIZE_OPTIONS } from "@/features/reports/constants";
import type { ReportStudentRow } from "@/features/reports/utils/studentRows";

interface ReportsDataViewProps {
  rows: ReportStudentRow[];
  totalItems: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
  isError?: boolean;
}

export function ReportsDataView({
  rows,
  totalItems,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onPageSizeChange,
  isLoading,
  isError,
}: ReportsDataViewProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-outline-variant/15 bg-surface-container-low/50">
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">
                Estudiante
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Sede</th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">
                Edificio
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">
                Facultad
              </th>
              <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">
                Evaluaciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-outline">
                  Cargando estudiantes…
                </td>
              </tr>
            ) : isError ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-error">
                  No se pudo cargar el listado. Intente actualizar los resultados.
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <TableEmptyState
                colSpan={5}
                title="Sin resultados"
                description="No hay estudiantes que coincidan con los filtros aplicados."
                icon="person_off"
              />
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="transition-colors hover:bg-[var(--color-primary-selected)]/40">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">{row.fullName}</span>
                      <span className="text-xs text-outline">ID: {row.studentId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.siteName}</td>
                  <td className="px-6 py-4 text-sm text-on-surface-variant">{row.buildingName}</td>
                  <td className="px-6 py-4">
                    <span className="rounded bg-surface-container-high px-2 py-1 text-[10px] font-bold text-on-surface-variant">
                      {row.facultyLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary">{row.evaluationGrade}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && !isError && totalItems > 0 ? (
        <DashboardPagination
          page={page}
          totalPages={totalPages}
          totalItems={totalItems}
          itemLabel="resultados"
          pageSize={pageSize}
          pageSizeOptions={[...REPORTS_RESULTS_PAGE_SIZE_OPTIONS]}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          className="bg-surface-container-low/30"
        />
      ) : null}
    </div>
  );
}
