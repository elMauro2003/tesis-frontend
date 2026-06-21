"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardSegmentedFilter } from "@/components/shared/DashboardSegmentedFilter";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { DashboardFilterSelectSkeleton, DashboardTableSkeleton } from "@/components/shared/DashboardSkeletons";
import { TableEmptyState } from "@/components/shared/TableEmptyState";
import { ComplaintTableRow } from "@/features/complaints/components/ComplaintTableRow";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";
import { AssignComplaintModal } from "@/features/complaints/components/AssignComplaintModal";
import { RespondComplaintModal } from "@/features/complaints/components/RespondComplaintModal";
import { ToggleComplaintVisibilityModal } from "@/features/complaints/components/ToggleComplaintVisibilityModal";
import { UpdateComplaintStatusModal } from "@/features/complaints/components/UpdateComplaintStatusModal";
import { DeleteComplaintModal } from "@/features/complaints/components/DeleteComplaintModal";
import { ViewComplaintPanel } from "@/features/complaints/components/ViewComplaintPanel";
import { useComplaintsForRole } from "@/features/complaints/hooks/useComplaintsForRole";
import { useDashboardComplaintBuildings } from "@/features/complaints/hooks/useDashboardComplaintBuildings";
import {
  COMPLAINT_STATUS_SEGMENT_OPTIONS,
  COMPLAINT_TYPE_FILTER_OPTIONS,
  ComplaintStatusSegment,
} from "@/features/complaints/utils/complaintDashboard";
import { usePermissions } from "@/hooks/usePermissions";
import { Complaint } from "@/types/models";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

export function ComplaintsManagement() {
  const { canAccessDashboardComplaints } = usePermissions();

  if (!canAccessDashboardComplaints()) {
    return (
      <DashboardEmptyState
        title="Acceso no autorizado"
        description="No tiene permisos para consultar la gestión de quejas en el dashboard."
        icon="lock"
      />
    );
  }

  return <ManagerComplaintsView />;
}

function ManagerComplaintsView() {
  const { canAccessDashboardComplaints, canManageComplaints } = usePermissions();
  const canView = canAccessDashboardComplaints();
  const canManage = canManageComplaints();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [statusSegment, setStatusSegment] = useState<ComplaintStatusSegment>("pendiente");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);

  const [viewComplaint, setViewComplaint] = useState<Complaint | null>(null);
  const [respondComplaint, setRespondComplaint] = useState<Complaint | null>(null);
  const [statusComplaint, setStatusComplaint] = useState<Complaint | null>(null);
  const [visibilityComplaint, setVisibilityComplaint] = useState<Complaint | null>(null);
  const [assignComplaint, setAssignComplaint] = useState<Complaint | null>(null);
  const [deleteComplaint, setDeleteComplaint] = useState<Complaint | null>(null);

  const buildingsQuery = useDashboardComplaintBuildings(canView);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 450);
    return () => window.clearTimeout(timer);
  }, [search]);

  const complaintsQuery = useComplaintsForRole({
    search: debouncedSearch || undefined,
    type: typeFilter !== "all" ? typeFilter : undefined,
    building: buildingFilter !== "all" ? Number(buildingFilter) : undefined,
    ordering: "-date",
    page,
    page_size: pageSize,
    statusSegment,
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

  const buildingOptions = useMemo(() => {
    const dynamic = (buildingsQuery.data ?? []).map((building) => ({
      value: String(building.id),
      label: `Edificio: ${building.label}`,
    }));

    return [{ value: "all", label: "Edificio: Todos" }, ...dynamic];
  }, [buildingsQuery.data]);

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setTypeFilter("all");
    setBuildingFilter("all");
    setStatusSegment("all");
    resetPage();
  };

  const hasFiltersApplied =
    debouncedSearch.length > 0 ||
    typeFilter !== "all" ||
    buildingFilter !== "all" ||
    statusSegment !== "pendiente";

  const isLoading = complaintsQuery.isLoading;
  const isError = complaintsQuery.isError;
  const isFiltersLoading = buildingsQuery.isLoading;

  const emptyTitle = useMemo(() => {
    if (hasFiltersApplied) {
      return "Sin resultados";
    }

    return "No hay quejas registradas";
  }, [hasFiltersApplied]);

  const openRespondModal = (complaint: Complaint) => {
    if (!canManage) return;
    setViewComplaint(null);
    setRespondComplaint(complaint);
  };

  const openStatusModal = (complaint: Complaint) => {
    if (!canManage) return;
    setViewComplaint(null);
    setStatusComplaint(complaint);
  };

  const openVisibilityModal = (complaint: Complaint) => {
    if (!canManage) return;
    setVisibilityComplaint(complaint);
  };

  const openAssignModal = (complaint: Complaint) => {
    if (!canManage) return;
    setAssignComplaint(complaint);
  };

  const openDeleteModal = (complaint: Complaint) => {
    if (!canManage) return;
    setViewComplaint(null);
    setDeleteComplaint(complaint);
  };

  const handleComplaintDeleted = (complaintId: number) => {
    setViewComplaint((current) => (current?.id === complaintId ? null : current));
  };

  return (
    <div className="w-full space-y-8">
      <DashboardPageHeader
        title="Quejas"
        description="Consulte y gestione las quejas presentadas por la comunidad estudiantil."
        topBadge="Atención estudiantil"
        searchValue={search}
        onSearchChange={(value) => {
          setSearch(value);
          resetPage();
        }}
        searchPlaceholder="Buscar por asunto, número de queja o estudiante..."
      />

      <DashboardFiltersBar
        left={
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
            <DashboardFilterSelect
              className="w-full sm:w-56"
              value={typeFilter}
              onValueChange={(value) => {
                setTypeFilter(value);
                resetPage();
              }}
              placeholder="Categoría"
              options={COMPLAINT_TYPE_FILTER_OPTIONS}
            />
            {isFiltersLoading ? (
              <DashboardFilterSelectSkeleton className="w-full sm:w-56" />
            ) : (
              <DashboardFilterSelect
                className="w-full sm:w-56"
                value={buildingFilter}
                onValueChange={(value) => {
                  setBuildingFilter(value);
                  resetPage();
                }}
                placeholder="Edificio"
                options={buildingOptions}
              />
            )}
          </div>
        }
        right={
          <DashboardSegmentedFilter
            value={statusSegment}
            onValueChange={(value) => {
              setStatusSegment(value as ComplaintStatusSegment);
              resetPage();
            }}
            options={[...COMPLAINT_STATUS_SEGMENT_OPTIONS]}
          />
        }
      />

      <section className="overflow-hidden rounded-xl bg-[var(--color-surface-container-lowest)] shadow-[0_20px_40px_rgba(0,55,176,0.04)]">
        <div className="w-full overflow-hidden">
          <table className="w-full table-fixed border-collapse text-left">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[10%]" />
              <col className="w-[12%]" />
              <col className="w-[8%]" />
              <col className="w-[14%]" />
              <col className="w-[28%]" />
            </colgroup>
            <thead className="bg-[var(--color-surface-container-low)]/40">
              <tr>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Asunto y emisor
                </th>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Fecha
                </th>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Categoría
                </th>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  <span className="sr-only">Visibilidad</span>
                  <span aria-hidden>Vis.</span>
                </th>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Estado
                </th>
                <th className="border-b border-[var(--color-outline-variant)]/10 px-4 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Acción
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
              {isError ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-[var(--color-on-surface-variant)]">
                    No fue posible cargar las quejas. Intente nuevamente.
                  </td>
                </tr>
              ) : isLoading ? (
                <DashboardTableSkeleton rows={5} columns={6} />
              ) : complaints.length === 0 ? (
                <TableEmptyState
                  colSpan={6}
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
                  <ComplaintTableRow
                    key={complaint.id}
                    complaint={complaint}
                    canManage={canManage}
                    onView={setViewComplaint}
                    onToggleVisibility={openVisibilityModal}
                    onAssign={openAssignModal}
                    onUpdateStatus={openStatusModal}
                    onRespond={openRespondModal}
                    onDelete={openDeleteModal}
                  />
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

      <ViewComplaintPanel
        complaint={viewComplaint}
        onClose={() => setViewComplaint(null)}
        canManage={canManage}
        onRespond={openRespondModal}
        onDelete={openDeleteModal}
      />

      {canManage ? (
        <>
          <RespondComplaintModal
            complaint={respondComplaint}
            open={Boolean(respondComplaint)}
            onClose={() => setRespondComplaint(null)}
          />

          <UpdateComplaintStatusModal
            complaint={statusComplaint}
            open={Boolean(statusComplaint)}
            onClose={() => setStatusComplaint(null)}
          />

          <ToggleComplaintVisibilityModal
            complaint={visibilityComplaint}
            open={Boolean(visibilityComplaint)}
            onClose={() => setVisibilityComplaint(null)}
          />

          <AssignComplaintModal
            complaint={assignComplaint}
            open={Boolean(assignComplaint)}
            onClose={() => setAssignComplaint(null)}
          />

          <DeleteComplaintModal
            complaint={deleteComplaint}
            open={Boolean(deleteComplaint)}
            onClose={() => setDeleteComplaint(null)}
            onDeleted={handleComplaintDeleted}
          />
        </>
      ) : null}
    </div>
  );
}
