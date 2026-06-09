"use client";

import { useEffect, useMemo, useState } from "react";
import { useComplaintsForRole } from "@/features/complaints/hooks/useComplaintsForRole";
import { usePermissions } from "@/hooks/usePermissions";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { DashboardTableSkeleton } from "@/components/shared/DashboardSkeletons";
import { TableEmptyState } from "@/components/shared/TableEmptyState";
import { Complaint } from "@/types/models";
import { toast } from "sonner";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

const STATUS_OPTIONS = [
  { value: "all", label: "Estado: Todos" },
  { value: "pendiente", label: "Estado: Pendiente" },
  { value: "en_proceso", label: "Estado: En proceso" },
  { value: "resuelta", label: "Estado: Resuelta" },
  { value: "rechazada", label: "Estado: Rechazada" },
];

const TYPE_OPTIONS = [
  { value: "all", label: "Tipo: Todos" },
  { value: "administrativa", label: "Tipo: Administrativa" },
  { value: "educativa", label: "Tipo: Educativa" },
];

const STATUS_LABELS: Record<Complaint["status"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
};

const formatComplaintDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
};

export function ComplaintsManagement() {
  const { can, canManageComplaints } = usePermissions();
  const isManager = canManageComplaints();
  const canCreateComplaint = can("complaints", "create");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [search]);

  const complaintsQuery = useComplaintsForRole({
    search: debouncedSearch || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    ordering: "-date",
    page,
    page_size: pageSize,
  });

  const complaints = complaintsQuery.data?.results ?? [];
  const totalItems = complaintsQuery.data?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(page, totalPages);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const resetPage = () => setPage(1);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    resetPage();
  };

  const hasFiltersApplied =
    debouncedSearch.length > 0 || statusFilter !== "all" || typeFilter !== "all";

  const isLoading = complaintsQuery.isLoading;
  const isError = complaintsQuery.isError;

  const emptyTitle = useMemo(() => {
    if (hasFiltersApplied) {
      return "Sin resultados";
    }

    return "No hay quejas registradas";
  }, [hasFiltersApplied]);

  return (
    <div className="w-full space-y-8">
      <DashboardPageHeader
        title={isManager ? "Gestión de quejas" : "Mis quejas"}
        description={
          isManager
            ? "Consulte y gestione las quejas presentadas por la comunidad estudiantil."
            : "Revise el estado de sus quejas y presente nuevas solicitudes cuando sea necesario."
        }
        topBadge="Atención estudiantil"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetPage();
        }}
        searchPlaceholder={
          isManager
            ? "Buscar queja por descripción o estudiante..."
            : "Buscar en mis quejas..."
        }
        actionLabel={canCreateComplaint ? "Nueva queja" : undefined}
        actionIcon="add"
        onAction={
          canCreateComplaint
            ? () => {
                toast.info("Registro de quejas", {
                  description: "El formulario de creación estará disponible en una próxima iteración.",
                });
              }
            : undefined
        }
        showSearch={isManager}
      />

      {isManager ? (
        <DashboardFiltersBar
          left={
            <DashboardFilterSelect
              className="w-full sm:w-56"
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                resetPage();
              }}
              placeholder="Estado"
              options={STATUS_OPTIONS}
            />
          }
          right={
            <DashboardFilterSelect
              className="w-full sm:w-56"
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                resetPage();
              }}
              placeholder="Tipo"
              options={TYPE_OPTIONS}
            />
          }
        />
      ) : null}

      <section className="overflow-hidden rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-center justify-between gap-4 bg-[var(--color-surface-container-low)] px-6 py-5">
          <div>
            <h2 className="text-base font-bold text-[var(--color-primary-dark)]">
              {isManager ? "Bandeja de quejas" : "Mis solicitudes"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {isLoading ? "Cargando quejas..." : `${totalItems} queja${totalItems === 1 ? "" : "s"} registrada${totalItems === 1 ? "" : "s"}`}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-[var(--color-surface-container-low)]/70">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Fecha</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Tipo</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Estado</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Descripción</th>
                <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Edificio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
              {isError ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-[var(--color-on-surface-variant)]">
                    No fue posible cargar las quejas. Intente nuevamente.
                  </td>
                </tr>
              ) : isLoading ? (
                <DashboardTableSkeleton rows={5} columns={5} />
              ) : complaints.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  title={emptyTitle}
                  description={
                    hasFiltersApplied
                      ? "Ninguna queja coincide con los filtros o la búsqueda actuales."
                      : "Las quejas registradas aparecerán aquí para su seguimiento."
                  }
                  icon={hasFiltersApplied ? "filter_alt_off" : "emergency_home"}
                  secondaryAction={
                    hasFiltersApplied ? (
                      <Button type="button" variant="neutral" onClick={handleClearFilters}>
                        <span className="material-symbols-outlined text-lg">filter_alt_off</span>
                        Limpiar filtros
                      </Button>
                    ) : null
                  }
                />
              ) : (
                complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-[var(--color-primary-selected)]/40 transition-colors">
                    <td className="px-6 py-5 text-sm text-[var(--color-on-surface-variant)]">
                      {formatComplaintDate(complaint.date)}
                    </td>
                    <td className="px-6 py-5 text-sm capitalize text-[var(--color-on-surface)]">{complaint.type}</td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-[var(--color-surface-container-high)] px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]">
                        {STATUS_LABELS[complaint.status]}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-sm text-[var(--color-on-surface)]">{complaint.description}</td>
                    <td className="px-6 py-5 text-sm text-[var(--color-on-surface-variant)]">
                      {complaint.building_name ?? "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && totalItems > 0 ? (
          <DashboardPagination
            page={safePage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemLabel="quejas"
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setPage}
            onPageSizeChange={(value) => {
              setPageSize(value);
              resetPage();
            }}
          />
        ) : null}
      </section>
    </div>
  );
}
