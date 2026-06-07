"use client";

import { useMemo, useState } from "react";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PortalBackLink } from "@/components/student-portal/PortalBackLink";
import { PortalEmptyState } from "@/components/student-portal/PortalEmptyState";
import { PortalLoadMore } from "@/components/student-portal/PortalLoadMore";
import { PortalPageShell } from "@/components/student-portal/PortalPageShell";
import { PortalListSkeleton } from "@/components/student-portal/PortalSkeleton";
import { PublicComplaintCard } from "@/features/student-portal/complaints/components/PublicComplaintCard";
import { usePublicComplaints } from "@/features/student-portal/complaints/hooks/usePublicComplaints";
import {
  getBuildingLabel,
  getPublicComplaintsStats,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function PublicComplaintsArchive() {
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");
  const publicComplaintsQuery = usePublicComplaints();

  const allComplaints = publicComplaintsQuery.data?.pages.flatMap((page) => page.results) ?? [];

  const buildings = useMemo(() => {
    const values = new Set(allComplaints.map((complaint) => getBuildingLabel(complaint)));
    return Array.from(values).sort();
  }, [allComplaints]);

  const filteredComplaints = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allComplaints.filter((complaint) => {
      const matchesBuilding =
        buildingFilter === "all" || getBuildingLabel(complaint) === buildingFilter;
      const matchesSearch =
        !query ||
        complaint.description.toLowerCase().includes(query) ||
        getBuildingLabel(complaint).toLowerCase().includes(query) ||
        (complaint.response?.toLowerCase().includes(query) ?? false);

      return matchesBuilding && matchesSearch;
    });
  }, [allComplaints, buildingFilter, search]);

  const stats = getPublicComplaintsStats(allComplaints);

  return (
    <PortalPageShell>
      <PortalBackLink href={PORTAL_ROUTES.quejas} label="Volver a quejas" />

      <header className="mb-8">
        <h1 className="mb-3 font-headline text-3xl font-bold tracking-tight text-primary md:text-4xl">
          Quejas visibles
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-on-surface-variant">
          Consulta el historial de incidencias publicadas por la administración para fomentar la
          transparencia y el bienestar colectivo en la residencia.
        </p>
      </header>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <span className="material-symbols-outlined text-primary">task_alt</span>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-primary">{stats.resolved}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Resueltas
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-tertiary/10">
            <span className="material-symbols-outlined text-tertiary">hourglass_empty</span>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-tertiary">{stats.inProcess}</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              En proceso
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-[var(--shadow-ambient)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
            <span className="material-symbols-outlined text-secondary">trending_up</span>
          </div>
          <div>
            <div className="font-headline text-2xl font-bold text-secondary">{stats.successRate}%</div>
            <div className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
              Tasa de éxito
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">
            search
          </span>
          <Input
            className="pl-10"
            placeholder="Buscar por palabras clave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={buildingFilter} onValueChange={setBuildingFilter}>
          <SelectTrigger>
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

      {publicComplaintsQuery.isError ? (
        <PortalEmptyState
          icon="error"
          title="No se pudieron cargar las quejas visibles"
          onRetry={() => publicComplaintsQuery.refetch()}
        />
      ) : publicComplaintsQuery.isLoading ? (
        <PortalListSkeleton count={3} />
      ) : filteredComplaints.length === 0 ? (
        <PortalEmptyState
          icon="public"
          title="Sin quejas visibles"
          description={
            search || buildingFilter !== "all"
              ? "Ninguna queja coincide con los filtros aplicados."
              : "Aún no hay quejas públicas publicadas por la administración."
          }
        />
      ) : (
        <section className="space-y-6">
          {filteredComplaints.map((complaint) => (
            <PublicComplaintCard key={complaint.id} complaint={complaint} />
          ))}

          <PortalLoadMore
            onClick={() => publicComplaintsQuery.fetchNextPage()}
            isLoading={publicComplaintsQuery.isFetchingNextPage}
            hasMore={Boolean(publicComplaintsQuery.hasNextPage)}
          />
        </section>
      )}
    </PortalPageShell>
  );
}
