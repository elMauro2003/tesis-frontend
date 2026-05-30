"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Input } from "@/components/ui/input";
import { Building, Room, Site, Wing } from "@/types/models";
import { DeleteSiteModal } from "@/features/sites/components/DeleteSiteModal";
import { SiteFormModal } from "@/features/sites/components/SiteFormModal";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";

const formatCount = (value: number) => new Intl.NumberFormat("es-ES").format(value);

const getBuildingSiteId = (building: Building) => {
  return typeof building.site === "object" ? building.site.id : building.site;
};

const getWingBuildingId = (wing: Wing) => {
  return typeof wing.building === "object" ? wing.building.id : wing.building;
};

const getRoomWingId = (room: Room) => {
  return typeof room.wing === "object" ? room.wing.id : room.wing;
};

const getSiteLabel = (site: Site) => site.address?.trim() || "Dirección no registrada";

const siteSearchTarget = (site: Site) => `${site.name} ${site.address ?? ""} ${site.description ?? ""}`.toLowerCase();

export function SitesManagement() {
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);

  const sitesQuery = useQuery({
    queryKey: ["sites"],
    queryFn: () => infrastructureService.getAllSites(),
    staleTime: 60 * 1000,
  });

  const buildingsQuery = useQuery({
    queryKey: ["buildings-all"],
    queryFn: () => infrastructureService.getAllBuildings(),
    staleTime: 60 * 1000,
  });

  const wingsQuery = useQuery({
    queryKey: ["wings-all"],
    queryFn: () => infrastructureService.getAllWings(),
    staleTime: 60 * 1000,
  });

  const roomsQuery = useQuery({
    queryKey: ["rooms-all-active"],
    queryFn: () => infrastructureService.getAllActiveRooms(),
    staleTime: 60 * 1000,
  });

  const sites = sitesQuery.data?.results ?? [];
  const buildings = buildingsQuery.data?.results ?? [];
  const wings = wingsQuery.data?.results ?? [];
  const rooms = roomsQuery.data?.results ?? [];

  const buildingsBySite = useMemo(() => {
    const map = new Map<number, Building[]>();

    for (const building of buildings) {
      const siteId = getBuildingSiteId(building);
      const current = map.get(siteId) ?? [];
      current.push(building);
      map.set(siteId, current);
    }

    return map;
  }, [buildings]);

  const wingsByBuilding = useMemo(() => {
    const map = new Map<number, Wing[]>();

    for (const wing of wings) {
      const buildingId = getWingBuildingId(wing);
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
      const current = map.get(wingId) ?? [];
      current.push(room);
      map.set(wingId, current);
    }

    return map;
  }, [rooms]);

  const siteMetrics = useMemo(() => {
    const metrics = new Map<number, { buildingCount: number; capacity: number; occupancy: number }>();

    for (const site of sites) {
      const siteBuildings = buildingsBySite.get(site.id) ?? [];
      let capacity = 0;
      let occupancy = 0;

      for (const building of siteBuildings) {
        const buildingWings = wingsByBuilding.get(building.id) ?? [];

        for (const wing of buildingWings) {
          const wingRooms = roomsByWing.get(wing.id) ?? [];

          for (const room of wingRooms) {
            capacity += room.capacity ?? 0;
            occupancy += room.current_occupancy ?? room.occupancy ?? 0;
          }
        }
      }

      metrics.set(site.id, {
        buildingCount: siteBuildings.length,
        capacity,
        occupancy,
      });
    }

    return metrics;
  }, [sites, buildingsBySite, wingsByBuilding, roomsByWing]);

  const filteredSites = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return sites;
    }

    return sites.filter((site) => siteSearchTarget(site).includes(term));
  }, [sites, search]);

  const stats = useMemo(() => {
    const totalSites = sites.length;
    const totalBuildings = Array.from(siteMetrics.values()).reduce((sum, metric) => sum + metric.buildingCount, 0);
    const totalCapacity = Array.from(siteMetrics.values()).reduce((sum, metric) => sum + metric.capacity, 0);
    const totalOccupancy = Array.from(siteMetrics.values()).reduce((sum, metric) => sum + metric.occupancy, 0);
    const sitesWithAddress = sites.filter((site) => Boolean(site.address?.trim())).length;

    return [
      { label: "Total de sedes", value: formatCount(totalSites), note: "Catálogo institucional" },
      { label: "Edificios vinculados", value: formatCount(totalBuildings), note: "Distribución territorial" },
      { label: "Capacidad total", value: formatCount(totalCapacity), note: "Plazas disponibles" },
      { label: "Estudiantes alojados", value: formatCount(totalOccupancy), note: "Ocupación actual" },
    ];
  }, [sites, siteMetrics]);

  const openCreateModal = () => {
    setSelectedSite(null);
    setFormOpen(true);
  };

  const openEditModal = (site: Site) => {
    setSelectedSite(site);
    setFormOpen(true);
  };

  const openDeleteModal = (site: Site) => {
    setSelectedSite(site);
    setDeleteOpen(true);
  };

  return (
    <div className="w-full space-y-8">
      <DashboardPageHeader
        title="Sedes"
        description="Administre las ubicaciones institucionales, sus direcciones y su relación con los edificios del sistema sin salir del panel."
        topBadge="Gestión territorial"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar sede..."
        actionLabel="Añadir sede"
        actionIcon="add"
        onAction={openCreateModal}
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)] p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">{stat.label}</p>
            <p className="mt-3 font-headline text-3xl font-extrabold tracking-tight text-[var(--color-primary-dark)]">{stat.value}</p>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">{stat.note}</p>
          </div>
        ))}
      </section>

      <section className="rounded-3xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)] overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-5 bg-[var(--color-surface-container-low)]">
          <div>
            <h2 className="text-base font-bold text-[var(--color-primary-dark)]">Catálogo de sedes</h2>
            <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
              {sitesQuery.isLoading ? "Cargando sedes..." : `${filteredSites.length} sede${filteredSites.length === 1 ? "" : "s"} visible${filteredSites.length === 1 ? "" : "s"}`}
            </p>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
            Panel institucional
          </div>
        </div>

        <div className="p-6">
          {sitesQuery.isError ? (
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-6 text-sm text-[var(--color-on-surface-variant)]">
              No fue posible cargar las sedes en este momento. Intente nuevamente.
            </div>
          ) : filteredSites.length === 0 ? (
            <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary-selected)] text-primary">
                <span className="material-symbols-outlined text-2xl">location_city</span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-[var(--color-primary-dark)]">No hay sedes para mostrar</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-[var(--color-on-surface-variant)]">
                {search.trim()
                  ? "Ajuste el texto de búsqueda o limpie el filtro para ver más resultados."
                  : "Cree la primera sede para comenzar a estructurar la distribución territorial."}
              </p>
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-[var(--shadow-primary-btn)] transition-all hover:bg-[var(--color-on-primary-fixed-variant)] cursor-pointer"
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Añadir sede
              </button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredSites.map((site) => {
                const metric = siteMetrics.get(site.id) ?? { buildingCount: site.building_count ?? 0, capacity: 0, occupancy: 0 };
                const buildingCount = metric.buildingCount;
                const capacity = metric.capacity;
                const occupancy = metric.occupancy;
                const occupancyPercent = capacity > 0 ? Math.round((occupancy / capacity) * 100) : 0;

                return (
                  <article key={site.id} className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-all hover:-translate-y-1">
                    <div className="bg-[linear-gradient(180deg,rgba(219,234,254,0.55)_0%,rgba(255,255,255,1)_100%)] p-6 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] shadow-[0_10px_22px_rgba(0,55,176,0.08)]">
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
                        </div>
                      </div>

                      <div className="mt-5 space-y-2">
                        <h3 className="text-xl font-extrabold tracking-tight text-[var(--color-primary-dark)] font-headline">{site.name}</h3>
                        <p className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
                          <span className="material-symbols-outlined text-base text-[var(--color-outline)]">location_on</span>
                          {getSiteLabel(site)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificios</p>
                        <p className="mt-1 font-headline text-2xl font-extrabold tracking-tight text-[var(--color-primary-dark)]">{formatCount(buildingCount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Capacidad</p>
                        <p className="mt-1 font-headline text-2xl font-extrabold tracking-tight text-[var(--color-primary-dark)]">{formatCount(capacity)}</p>
                      </div>
                      <div className="col-span-2">
                        <div className="flex justify-between items-end mb-1">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Ocupación</p>
                          <p className="text-xs font-bold text-[var(--color-primary)]">{occupancyPercent}% ({formatCount(occupancy)})</p>
                        </div>
                        <div className="w-full bg-[var(--color-surface-container-high)] h-2 rounded-full overflow-hidden">
                          <div className="bg-[var(--color-primary)] h-full rounded-full" style={{ width: `${Math.min(100, occupancyPercent)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-[var(--color-outline-variant)]/15">
                      <button type="button" className="inline-flex items-center gap-1 text-sm font-bold text-[var(--color-primary)] cursor-pointer hover:text-[var(--color-on-primary-fixed-variant)] transition-colors">
                        Ver edificios
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(site)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-[var(--color-surface-container-lowest)] hover:text-[var(--color-primary)] cursor-pointer"
                          aria-label={`Editar ${site.name}`}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteModal(site)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-outline)] transition-colors hover:bg-red-50 hover:text-red-600 cursor-pointer"
                          aria-label={`Eliminar ${site.name}`}
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <SiteFormModal
        site={selectedSite}
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedSite(null);
        }}
      />

      <DeleteSiteModal
        site={selectedSite}
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setSelectedSite(null);
        }}
      />
    </div>
  );
}