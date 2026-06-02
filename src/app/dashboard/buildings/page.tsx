"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardPagination } from "@/components/shared/DashboardPagination";
import { SearchField } from "@/components/shared/SearchField";
import { TableEmptyState } from "@/components/shared/TableEmptyState";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Building, Room, Site, Wing } from "@/types/models";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BuildingFormModal } from "@/features/buildings/components/BuildingFormModal";
import { DeleteBuildingModal } from "@/features/buildings/components/DeleteBuildingModal";
import { DeleteWingModal } from "@/features/buildings/components/DeleteWingModal";
import { WingFormModal } from "@/features/buildings/components/WingFormModal";
import { ViewBuildingPanel } from "@/features/buildings/components/ViewBuildingPanel";

const DEFAULT_PAGE_SIZE = 10;
const PAGE_SIZE_OPTIONS = [10, 25, 50];

type AnyRecord = Record<string, unknown>;

type BuildingMetrics = {
  roomCount: number;
  availableSpots: number;
  capacity: number;
  occupiedSpots: number;
  occupancyPercent: number;
};

const getNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  if (value && typeof value === "object" && "id" in value) return getNumericId((value as AnyRecord).id);
  return null;
};

const getBuildingSiteId = (building: Building): number | null => getNumericId(building.site);

const getRoomWingId = (room: Room): number | null => getNumericId(room.wing);

const getRoomAvailability = (room: Room): number => {
  if (!room.is_active) return 0;
  if (typeof room.available_spots === "number") return Math.max(0, room.available_spots);

  const occupied = room.current_occupancy ?? room.occupancy ?? 0;
  return Math.max(0, room.capacity - occupied);
};

const getBuildingSiteLabel = (building: Building, sitesById: Map<number, Site>): string => {
  if (typeof building.site === "object" && building.site && "name" in building.site) {
    return String((building.site as Site).name);
  }

  const siteName = ((building as unknown) as AnyRecord).site_name;
  if (typeof siteName === "string" && siteName.trim()) {
    return siteName;
  }

  const siteId = getBuildingSiteId(building);
  if (siteId !== null) {
    return sitesById.get(siteId)?.name ?? "-";
  }

  return "-";
};

export default function BuildingsPage() {
  const [allBuildings, setAllBuildings] = useState<Building[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [wings, setWings] = useState<Wing[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [wingFormOpen, setWingFormOpen] = useState(false);
  const [wingDeleteOpen, setWingDeleteOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [selectedWing, setSelectedWing] = useState<Wing | null>(null);
  const [viewBuilding, setViewBuilding] = useState<Building | null>(null);

  const router = useRouter();

  const loadData = useCallback(async (options?: { resetFilters?: boolean }) => {
    setLoading(true);
    setError(null);

    try {
      const [sitesRes, buildingsRes, wingsRes, roomsRes] = await Promise.all([
        infrastructureService.getAllSites(),
        infrastructureService.getAllBuildings(),
        infrastructureService.getAllWings(),
        infrastructureService.getAllRooms(),
      ]);

      setSites(sitesRes.results ?? []);
      setAllBuildings(buildingsRes.results ?? []);
      setWings(wingsRes.results ?? []);
      setRooms(roomsRes.results ?? []);

      if (options?.resetFilters) {
        setPage(1);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error cargando edificios";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialPage = Number(params.get("page") || "1") || 1;
    const initialPageSize = Number(params.get("page_size") || `${DEFAULT_PAGE_SIZE}`) || DEFAULT_PAGE_SIZE;
    const initialSite = params.get("site");
    const initialSearch = params.get("search") || "";

    setPage(initialPage);
    setPageSize(PAGE_SIZE_OPTIONS.includes(initialPageSize) ? initialPageSize : DEFAULT_PAGE_SIZE);
    setSiteFilter(initialSite ? Number(initialSite) : "all");
    setSearch(initialSearch);

    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (siteFilter !== "all") params.set("site", String(siteFilter));
    if (search.trim()) params.set("search", search.trim());
    if (page > 1) params.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("page_size", String(pageSize));

    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
  }, [siteFilter, search, page, pageSize, router]);

  const sitesById = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);
  const buildingsById = useMemo(() => new Map(allBuildings.map((building) => [building.id, building])), [allBuildings]);
  const wingsById = useMemo(() => new Map(wings.map((wing) => [wing.id, wing])), [wings]);

  const wingsByBuilding = useMemo(() => {
    const map = new Map<number, Wing[]>();

    for (const wing of wings) {
      const buildingId = getNumericId(wing.building);
      if (buildingId === null) continue;

      const current = map.get(buildingId) ?? [];
      current.push(wing);
      map.set(buildingId, current);
    }

    return map;
  }, [wings]);

  const roomsByWing = useMemo(() => {
    const map = new Map<number, Room[]>();

    for (const room of rooms) {
      const wingId = getRoomWingId(room);
      if (wingId === null) continue;

      const current = map.get(wingId) ?? [];
      current.push(room);
      map.set(wingId, current);
    }

    return map;
  }, [rooms]);

  const buildingCascadeById = useMemo(() => {
    const map = new Map<number, { wingCount: number; roomCount: number }>();

    for (const building of allBuildings) {
      const buildingWings = wingsByBuilding.get(building.id) ?? [];
      let roomCount = 0;

      for (const wing of buildingWings) {
        roomCount += (roomsByWing.get(wing.id) ?? []).length;
      }

      map.set(building.id, {
        wingCount: buildingWings.length,
        roomCount,
      });
    }

    return map;
  }, [allBuildings, wingsByBuilding, roomsByWing]);

  const metricsByBuilding = useMemo(() => {
    const map = new Map<number, BuildingMetrics>();

    for (const room of rooms) {
      const wingId = getRoomWingId(room);
      if (wingId === null) continue;

      const wing = wingsById.get(wingId);
      if (!wing) continue;

      const buildingId = getNumericId(wing.building);
      if (buildingId === null) continue;

      const current = map.get(buildingId) ?? {
        roomCount: 0,
        availableSpots: 0,
        capacity: 0,
        occupiedSpots: 0,
        occupancyPercent: 0,
      };

      const occupied = room.current_occupancy ?? room.occupancy ?? 0;
      const capacity = room.capacity ?? 0;
      const availableSpots = getRoomAvailability(room);

      current.roomCount += 1;
      current.availableSpots += availableSpots;
      current.capacity += capacity;
      current.occupiedSpots += occupied;
      current.occupancyPercent = current.capacity > 0 ? Math.round((current.occupiedSpots / current.capacity) * 100) : 0;

      map.set(buildingId, current);
    }

    return map;
  }, [rooms, wingsById]);

  const filteredBuildings = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allBuildings.filter((building) => {
      const siteId = getBuildingSiteId(building);
      const siteLabel = getBuildingSiteLabel(building, sitesById);
      const target = `${building.name} ${siteLabel} ${building.gender ?? ""}`.toLowerCase();
      const matchesSearch = query.length === 0 || target.includes(query);
      const matchesSite = siteFilter === "all" || siteId === siteFilter;
      return matchesSearch && matchesSite;
    });
  }, [allBuildings, search, siteFilter, sitesById]);

  const totalPages = Math.max(1, Math.ceil(filteredBuildings.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedBuildings = useMemo(
    () => filteredBuildings.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filteredBuildings, safePage, pageSize]
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleSiteChange = (value: string) => {
    setSiteFilter(value === "all" ? "all" : Number(value));
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSiteFilter("all");
    setPage(1);
  };

  const handleCreateBuilding = () => {
    setWingFormOpen(false);
    setWingDeleteOpen(false);
    setSelectedWing(null);
    setSelectedBuilding(null);
    setFormOpen(true);
  };

  const handleCloseBuildingForm = () => {
    setFormOpen(false);
    setSelectedBuilding(null);
  };

  const handleEditBuilding = (building: Building) => {
    setViewOpen(false);
    setViewBuilding(null);
    setWingFormOpen(false);
    setWingDeleteOpen(false);
    setSelectedWing(null);
    setSelectedBuilding(building);
    setFormOpen(true);
  };

  const handleDeleteBuilding = (building: Building) => {
    setViewOpen(false);
    setViewBuilding(null);
    setWingFormOpen(false);
    setWingDeleteOpen(false);
    setSelectedWing(null);
    setSelectedBuilding(building);
    setDeleteOpen(true);
  };

  const handleRegisterWing = (building: Building) => {
    setViewOpen(false);
    setViewBuilding(null);
    setFormOpen(false);
    setDeleteOpen(false);
    setWingDeleteOpen(false);
    setSelectedWing(null);
    setSelectedBuilding(building);
    setWingFormOpen(true);
  };

  const handleDeleteWing = (wing: Wing) => {
    setFormOpen(false);
    setDeleteOpen(false);
    setWingFormOpen(false);
    setSelectedWing(wing);
    setWingDeleteOpen(true);
  };

  const handleViewBuilding = (building: Building) => {
    setFormOpen(false);
    setDeleteOpen(false);
    setSelectedBuilding(null);
    setViewBuilding(building);
    setViewOpen(true);
  };

  const handleCloseDeleteBuilding = () => {
    setDeleteOpen(false);
    setSelectedBuilding(null);
  };

  const handleCloseWingForm = () => {
    setWingFormOpen(false);
    setSelectedBuilding(null);
  };

  const handleCloseDeleteWing = () => {
    setWingDeleteOpen(false);
    setSelectedWing(null);
  };

  const handleCloseViewBuilding = () => {
    setViewOpen(false);
    setViewBuilding(null);
  };

  return (
    <div className="w-full px-8 py-4">
      <DashboardPageHeader
        title="Edificios"
        description="Administre los edificios vinculados a cada sede institucional."
        topBadge="Infraestructura"
        searchValue={search}
        onSearchChange={handleSearchChange}
        searchPlaceholder="Buscar edificio..."
        actionLabel="Añadir edificio"
        actionIcon="add"
        onAction={handleCreateBuilding}
        searchComponent={<SearchField value={search} onChange={handleSearchChange} placeholder="Buscar edificio por nombre..." />}
      />

      <DashboardFiltersBar
        left={(
          <DashboardFilterSelect
            className="w-full sm:w-72"
            value={siteFilter === "all" ? "all" : String(siteFilter)}
            onValueChange={handleSiteChange}
            placeholder="Sede: Todas"
            options={[
              { value: "all", label: "Sede: Todas" },
              ...sites.map((site) => ({ value: String(site.id), label: site.name })),
            ]}
          />
        )}
      />

      <section className="rounded-xl bg-[var(--color-surface-container-lowest)] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[var(--color-surface-container-low)]/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificio</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Sede</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cuartos totales</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Disponibilidad</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)] text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline-variant)]/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--color-on-surface-variant)]">
                    Cargando edificios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-sm text-[var(--color-error)]">
                    {error}
                  </td>
                </tr>
              ) : paginatedBuildings.length === 0 ? (
                <TableEmptyState
                  colSpan={5}
                  title={search.trim() || siteFilter !== "all" ? "Sin resultados" : "Aún no hay edificios"}
                  description={search.trim() || siteFilter !== "all"
                    ? "No encontramos edificios que coincidan con el filtro actual. Prueba limpiar la sede o la búsqueda."
                    : "Cuando existan edificios registrados, se mostrarán aquí con sus datos y acciones rápidas."}
                  icon={search.trim() || siteFilter !== "all" ? "filter_alt_off" : "domain"}
                  secondaryAction={search.trim() || siteFilter !== "all" ? (
                    <button
                      type="button"
                      onClick={handleClearFilters}
                      className="inline-flex items-center justify-center rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] px-4 py-2 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-low)]"
                    >
                      Limpiar filtros
                    </button>
                  ) : null}
                />
              ) : (
                paginatedBuildings.map((building) => {
                  const metrics = metricsByBuilding.get(building.id) ?? {
                    roomCount: 0,
                    availableSpots: 0,
                    capacity: 0,
                    occupiedSpots: 0,
                    occupancyPercent: 0,
                  };
                  const siteLabel = getBuildingSiteLabel(building, sitesById);
                  const availabilityTone = metrics.availableSpots > 0
                    ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                    : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]";

                  return (
                    <tr key={building.id} className="group transition-colors hover:bg-[var(--color-surface-container-low)]/70">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
                            <span className="material-symbols-outlined text-xl">domain</span>
                          </div>
                          <div>
                            <div className="font-semibold text-[var(--color-on-surface)]">{building.name}</div>
                            <div className="text-xs text-[var(--color-on-surface-variant)]">
                              {building.gender ? `Tipo: ${building.gender}` : "Tipo de bloque no definido"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[var(--color-on-surface-variant)]">{siteLabel}</td>
                      <td className="px-6 py-5">
                        <div className="text-sm font-semibold text-[var(--color-on-surface)]">{metrics.roomCount} cuartos</div>
                        <div className="text-xs text-[var(--color-on-surface-variant)]">
                          {metrics.capacity > 0 ? `${metrics.capacity} plazas de capacidad` : "Sin cuartos cargados"}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className={`inline-flex rounded-full px-3 py-1 text-[11px] font-bold ${availabilityTone}`}>
                          {metrics.availableSpots} plazas libres
                        </div>
                        <div className="mt-2 text-xs text-[var(--color-on-surface-variant)]">
                          {metrics.capacity > 0 ? `${metrics.occupancyPercent}% ocupación` : "Sin ocupación registrada"}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 cursor-pointer text-[var(--color-outline)] hover:text-[var(--color-primary)]"
                            title="Consultar"
                            onClick={() => handleViewBuilding(building)}
                          >
                            <span className="material-symbols-outlined text-xl">visibility</span>
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-9 w-9 cursor-pointer text-[var(--color-outline)] hover:text-[var(--color-primary)]"
                                aria-label="Más acciones"
                              >
                                <span className="material-symbols-outlined text-xl">more_vert</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="min-w-[13rem]">
                              <DropdownMenuItem onSelect={() => handleEditBuilding(building)}>
                                <span className="material-symbols-outlined text-base">edit</span>
                                Editar edificio
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => handleRegisterWing(building)}>
                                <span className="material-symbols-outlined text-base">apartment</span>
                                Registrar ala
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => handleDeleteBuilding(building)} className="text-[var(--color-error)] focus:text-[var(--color-error)]">
                                <span className="material-symbols-outlined text-base">delete</span>
                                Eliminar edificio
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <DashboardPagination
          page={safePage}
          totalPages={totalPages}
          totalItems={filteredBuildings.length}
          itemLabel="edificios"
          pageSize={pageSize}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
        />
      </section>

      <BuildingFormModal
        building={selectedBuilding}
        sites={sites}
        open={formOpen}
        onClose={handleCloseBuildingForm}
        onSaved={() => loadData()}
      />

      <DeleteBuildingModal
        building={selectedBuilding}
        wingCount={selectedBuilding ? (buildingCascadeById.get(selectedBuilding.id)?.wingCount ?? 0) : 0}
        roomCount={selectedBuilding ? (buildingCascadeById.get(selectedBuilding.id)?.roomCount ?? 0) : 0}
        open={deleteOpen}
        onClose={handleCloseDeleteBuilding}
        onDeleted={() => loadData()}
      />

      <WingFormModal
        wing={null}
        building={selectedBuilding}
        open={wingFormOpen}
        onClose={handleCloseWingForm}
        onSaved={() => loadData()}
      />

      <DeleteWingModal
        wing={selectedWing}
        buildingName={selectedWing ? (() => {
          const wingBuildingId = getNumericId(selectedWing.building);
          if (wingBuildingId === null) return undefined;

          return buildingsById.get(wingBuildingId)?.name;
        })() : undefined}
        roomCount={selectedWing ? (roomsByWing.get(selectedWing.id)?.length ?? 0) : 0}
        open={wingDeleteOpen}
        onClose={handleCloseDeleteWing}
        onDeleted={() => loadData()}
      />

      <ViewBuildingPanel
        building={viewBuilding}
        metrics={viewBuilding ? (metricsByBuilding.get(viewBuilding.id) ?? null) : null}
        wings={wings}
        rooms={rooms}
        sites={sites}
        onRequestDeleteWing={handleDeleteWing}
        onClose={handleCloseViewBuilding}
      />
    </div>
  );
}
