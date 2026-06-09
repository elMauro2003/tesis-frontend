"use client";

import { useEffect, useMemo, useState } from "react";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PortalBackLink } from "@/components/student-portal/PortalBackLink";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalSectionTitle } from "@/components/student-portal/PortalSectionTitle";
import { PortalPublicArchivePageSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PublicComplaintCard } from "@/features/student-portal/complaints/components/PublicComplaintCard";
import { useAllPublicComplaints } from "@/features/student-portal/complaints/hooks/useAllPublicComplaints";
import {
  getBuildingLabel,
  getPublicComplaintsStats,
  matchesComplaintSearch,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PAGE_SIZE = 8;

export function PublicComplaintsArchive() {
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const publicComplaintsQuery = useAllPublicComplaints();
  const isInitialLoading = publicComplaintsQuery.isLoading && !publicComplaintsQuery.data;

  const allComplaints = publicComplaintsQuery.data?.results ?? [];

  const buildings = useMemo(() => {
    const values = new Set(allComplaints.map((complaint) => getBuildingLabel(complaint)));
    return Array.from(values).sort((a, b) => a.localeCompare(b, "es"));
  }, [allComplaints]);

  const filteredComplaints = useMemo(() => {
    return allComplaints.filter((complaint) => {
      const matchesBuilding =
        buildingFilter === "all" || getBuildingLabel(complaint) === buildingFilter;

      return matchesBuilding && matchesComplaintSearch(complaint, search);
    });
  }, [allComplaints, buildingFilter, search]);

  const displayedComplaints = filteredComplaints.slice(0, visibleCount);
  const hasMoreToShow = visibleCount < filteredComplaints.length;
  const hasFiltersApplied = search.trim().length > 0 || buildingFilter !== "all";
  const stats = getPublicComplaintsStats(allComplaints);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, buildingFilter]);

  const clearFilters = () => {
    setSearch("");
    setBuildingFilter("all");
  };

  if (isInitialLoading) {
    return (
      <PortalPageShell>
        <PortalPublicArchivePageSkeleton />
      </PortalPageShell>
    );
  }

  return (
    <PortalPageShell>
      <PortalBackLink href={PORTAL_ROUTES.quejas} label="Volver a quejas" />

      <PortalSectionTitle
        title="Archivo Público de Quejas"
        description="Consulta el historial de incidencias resueltas por la administración para fomentar la transparencia y el bienestar colectivo en nuestra comunidad universitaria."
      />

      <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant">
        <span>
          <strong className="font-headline text-base text-primary">{stats.resolved}</strong> resueltas
        </span>
        <span className="hidden text-outline-variant sm:inline">·</span>
        <span>
          <strong className="font-headline text-base text-tertiary">{stats.inProcess}</strong> en proceso
        </span>
        <span className="hidden text-outline-variant sm:inline">·</span>
        <span>
          <strong className="font-headline text-base text-secondary">{stats.successRate}%</strong> tasa de
          éxito
        </span>
        <span className="w-full text-xs text-outline sm:ml-auto sm:w-auto">
          {filteredComplaints.length} de {allComplaints.length} visibles
        </span>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <Input
            className="pl-10"
            placeholder="Buscar por palabras clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar quejas"
          />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger aria-label="Filtrar por edificio">
            <SelectValue placeholder="Filtrar por edificio" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los edificios</SelectItem>
            {buildings.map((building) => (
              <SelectItem key={building} value={building}>
                {building}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFiltersApplied ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-outline">Filtros activos</span>
          {search.trim() ? (
            <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-medium text-primary">
              Búsqueda: {search.trim()}
            </span>
          ) : null}
          {buildingFilter !== "all" ? (
            <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant">
              {buildingFilter}
            </span>
          ) : null}
          <Button type="button" variant="neutral" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      ) : null}

      {publicComplaintsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar las quejas visibles"
          onRetry={() => publicComplaintsQuery.refetch()}
        />
      ) : filteredComplaints.length === 0 ? (
        <PortalEmptyState
          icon="public"
          title="Sin quejas visibles"
          description={
            hasFiltersApplied
              ? "Ninguna queja coincide con los filtros aplicados."
              : "Aún no hay quejas públicas publicadas por la administración."
          }
        />
      ) : (
        <section className="space-y-6">
          {displayedComplaints.map((complaint) => (
            <PublicComplaintCard key={complaint.id} complaint={complaint} />
          ))}

          <PortalLoadMore
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            isLoading={publicComplaintsQuery.isFetching}
            hasMore={hasMoreToShow}
          />
        </section>
      )}
    </PortalPageShell>
  );
}
