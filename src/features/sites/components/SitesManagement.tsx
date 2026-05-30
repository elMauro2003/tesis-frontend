"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Input } from "@/components/ui/input";
import { Site } from "@/types/models";
import { DeleteSiteModal } from "@/features/sites/components/DeleteSiteModal";
import { SiteFormModal } from "@/features/sites/components/SiteFormModal";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";

const formatCount = (value: number) => new Intl.NumberFormat("es-ES").format(value);

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

  const sites = sitesQuery.data?.results ?? [];

  const filteredSites = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return sites;
    }

    return sites.filter((site) => siteSearchTarget(site).includes(term));
  }, [sites, search]);

  const stats = useMemo(() => {
    const totalSites = sites.length;
    const totalBuildings = sites.reduce((sum, site) => sum + (site.building_count ?? 0), 0);
    const sitesWithAddress = sites.filter((site) => Boolean(site.address?.trim())).length;
    const averageBuildings = totalSites > 0 ? totalBuildings / totalSites : 0;

    return [
      { label: "Total de sedes", value: formatCount(totalSites), note: "Catálogo institucional" },
      { label: "Edificios vinculados", value: formatCount(totalBuildings), note: "Distribución territorial" },
      { label: "Con dirección registrada", value: formatCount(sitesWithAddress), note: "Datos completos" },
      { label: "Promedio por sede", value: averageBuildings.toFixed(1), note: "Edificios por ubicación" },
    ];
  }, [sites]);

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
                const buildingCount = site.building_count ?? 0;
                const occupancyLabel = buildingCount > 0 ? "Operativa" : "Pendiente";
                const maxBuildings = Math.max(1, ...sites.map((item) => item.building_count ?? 0));
                const coverage = Math.max(15, Math.round((buildingCount / maxBuildings) * 100));

                return (
                  <article key={site.id} className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[0_4px_20px_rgba(0,55,176,0.03)] transition-all hover:-translate-y-1">
                    <div className="bg-[linear-gradient(180deg,rgba(219,234,254,0.55)_0%,rgba(255,255,255,1)_100%)] p-6 relative">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] text-[var(--color-primary)] shadow-[0_10px_22px_rgba(0,55,176,0.08)]">
                          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${buildingCount > 0 ? "bg-emerald-100 text-emerald-700" : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]"}`}>
                          {occupancyLabel}
                        </span>
                      </div>

                      <div className="mt-5 space-y-2">
                        <h3 className="text-xl font-extrabold tracking-tight text-[var(--color-primary-dark)] font-headline">{site.name}</h3>
                        <p className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
                          <span className="material-symbols-outlined text-base text-[var(--color-outline)]">location_on</span>
                          {getSiteLabel(site)}
                        </p>
                        {site.description ? (
                          <p className="text-sm leading-relaxed text-[var(--color-on-surface-variant)]">{site.description}</p>
                        ) : null}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 px-6 pb-6">
                      <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Edificios</p>
                        <p className="mt-2 font-headline text-2xl font-extrabold tracking-tight text-[var(--color-primary-dark)]">{formatCount(buildingCount)}</p>
                      </div>
                      <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Estado</p>
                        <p className="mt-2 text-sm font-semibold tracking-tight text-[var(--color-primary-dark)]">{occupancyLabel}</p>
                      </div>
                      <div className="col-span-2 rounded-2xl bg-[var(--color-surface-container-low)] p-4">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">Cobertura</p>
                            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">
                              {buildingCount > 0
                                ? `La sede concentra ${formatCount(buildingCount)} edificio${buildingCount === 1 ? "" : "s"}.`
                                : "Todavía no tiene edificios asociados."}
                            </p>
                          </div>
                          <p className="text-sm font-bold text-[var(--color-primary)]">{coverage}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 bg-[var(--color-surface-container-low)] px-6 py-4">
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