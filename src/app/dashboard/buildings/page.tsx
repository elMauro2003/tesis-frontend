"use client";

import React, { useEffect, useMemo, useState } from "react";
import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardFiltersBar } from "@/components/shared/DashboardFiltersBar";
import { DashboardFilterSelect } from "@/components/shared/DashboardFilterSelect";
import { DashboardEmptyState } from "@/components/shared/DashboardEmptyState";
import { TableEmptyState } from "@/components/shared/TableEmptyState";
import { SearchField } from "@/components/shared/SearchField";
import { useRouter, useSearchParams } from "next/navigation";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Building, Site } from "@/types/models";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");
  const [count, setCount] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [prevUrl, setPrevUrl] = useState<string | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams();

  const load = async (opts?: { siteId?: number; page?: number; page_size?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await infrastructureService.getBuildings({ siteId: opts?.siteId, page: opts?.page, page_size: opts?.page_size });
      setBuildings(res.results ?? []);
      setCount(res.count ?? 0);
      setPage(opts?.page ?? 1);
      setPageSize(opts?.page_size ?? pageSize);
      setNextUrl(res.next ?? null);
      setPrevUrl(res.previous ?? null);
    } catch (err: any) {
      setError(err?.message || "Error cargando edificios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      setLoading(true);
      try {
        const sitesRes = await infrastructureService.getSites();
        if (!mounted) return;
        setSites(sitesRes.results ?? []);
      } catch (err) {
        // ignore — site selector can be empty
      }
      // Read initial query params
      const sp = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
      const qPage = Number(sp.get("page") || searchParams?.get("page") || "1");
      const qPageSize = Number(sp.get("page_size") || searchParams?.get("page_size") || "10");
      const qSite = sp.get("site") || searchParams?.get("site");
      const siteId = qSite ? Number(qSite) : undefined;
      setPage(qPage);
      setPageSize(qPageSize);
      setSiteFilter(siteId ?? "all");
      await load({ siteId, page: qPage, page_size: qPageSize });
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    // sync url when siteFilter/page/pageSize change (preserve search)
    const params = new URLSearchParams();
    if (siteFilter !== "all") params.set("site", String(siteFilter));
    if (page) params.set("page", String(page));
    if (pageSize) params.set("page_size", String(pageSize));
    if (search) params.set("search", search);
    const qs = params.toString();
    router.replace(`${window.location.pathname}${qs ? `?${qs}` : ""}`);
    load({ siteId: siteFilter === "all" ? undefined : (siteFilter as number), page, page_size: pageSize });
  }, [siteFilter, page, pageSize]);

  // debounce updating URL for search and preserve it
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      if (search) params.set("search", search);
      else params.delete("search");
      // when search changes, reset to page 1
      params.set("page", "1");
      router.replace(`${window.location.pathname}${params.toString() ? `?${params.toString()}` : ""}`);
      setPage(1);
      load({ siteId: siteFilter === "all" ? undefined : (siteFilter as number), page: 1, page_size: pageSize });
    }, 450);
    return () => clearTimeout(t);
  }, [search]);

  const parsePageFromUrl = (url: string | null): number | undefined => {
    if (!url) return undefined;
    try {
      const u = new URL(url, typeof window !== "undefined" ? window.location.origin : undefined);
      const p = u.searchParams.get("page");
      return p ? Number(p) : undefined;
    } catch {
      return undefined;
    }
  };

  const goToNext = () => {
    const p = parsePageFromUrl(nextUrl);
    if (p) setPage(p);
    else setPage((c) => c + 1);
  };

  const goToPrev = () => {
    const p = parsePageFromUrl(prevUrl);
    if (p) setPage(p);
    else setPage((c) => Math.max(1, c - 1));
  };

  const goToFirst = () => setPage(1);
  const goToLast = () => setPage(Math.max(1, Math.ceil(count / pageSize)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter((b) => b.name.toLowerCase().includes(q));
  }, [buildings, search]);

  return (
    <div className="w-full px-8 py-4">
      <DashboardPageHeader
        title="Edificios"
        description="Administre los edificios vinculados a cada sede institucional."
        topBadge="Infraestructura"
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar edificio..."
        actionLabel="Añadir edificio"
        actionIcon="add"
        onAction={() => {}}
        searchComponent={<SearchField value={search} onChange={setSearch} placeholder="Buscar edificio por nombre..." />}
      />

      <DashboardFiltersBar
        left={(
          <DashboardFilterSelect
            className="w-full sm:w-72"
            value={siteFilter === "all" ? "all" : String(siteFilter)}
            onValueChange={(value) => setSiteFilter(value === "all" ? "all" : Number(value))}
            placeholder="Sede: Todas"
            options={[
              { value: "all", label: "Sede: Todas" },
              ...sites.map((site) => ({ value: String(site.id), label: site.name })),
            ]}
          />
        )}
      />

      <section className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/50">
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Edificio</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline">Sede</th>
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-outline text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                    Cargando edificios...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-destructive">
                    {error}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <TableEmptyState
                  colSpan={3}
                  title={search.trim() || siteFilter !== "all" ? "Sin resultados" : "Aún no hay edificios"}
                  description={search.trim() || siteFilter !== "all"
                    ? "No encontramos edificios que coincidan con el filtro actual. Prueba limpiar la sede o la búsqueda."
                    : "Cuando existan edificios registrados, se mostrarán aquí con sus datos y acciones rápidas."}
                  icon={search.trim() || siteFilter !== "all" ? "filter_alt_off" : "domain"}
                />
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-xs">B</div>
                        <div>
                          <div className="font-semibold text-on-surface">{b.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-on-surface-variant">{typeof b.site === "number" ? sites.find(s=>s.id===b.site)?.name ?? "-" : (b.site as Site)?.name ?? "-"}</div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-outline hover:text-primary transition-colors" title="Consultar">
                          <span className="material-symbols-outlined text-xl">visibility</span>
                        </button>
                        <button className="p-2 text-outline hover:text-primary transition-colors" title="Editar">
                          <span className="material-symbols-outlined text-xl">edit</span>
                        </button>
                        <button className="p-2 text-outline hover:text-destructive transition-colors" title="Eliminar">
                          <span className="material-symbols-outlined text-xl">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <footer className="px-6 py-4 flex items-center justify-between bg-surface-container-low/30 border-t border-outline-variant/10">
          <div className="text-sm font-medium text-on-surface-variant">Mostrando {filtered.length} edificios</div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={goToFirst}
              >
                <span className="material-symbols-outlined text-lg">first_page</span>
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-outline hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50"
                disabled={page <= 1}
                onClick={goToPrev}
              >
                <span className="material-symbols-outlined text-lg">chevron_left</span>
              </button>
            </div>

            <div className="text-sm text-on-surface-variant">Página {page} • {Math.max(1, Math.ceil(count / pageSize))}</div>

            <div className="flex items-center gap-1">
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50"
                disabled={page >= Math.max(1, Math.ceil(count / pageSize))}
                onClick={goToNext}
              >
                <span className="material-symbols-outlined text-lg">chevron_right</span>
              </button>
              <button
                className="w-9 h-9 flex items-center justify-center rounded-lg bg-surface-container-lowest border border-outline-variant/30 text-on-surface-variant hover:border-primary hover:text-primary transition-all shadow-sm disabled:opacity-50"
                disabled={page >= Math.max(1, Math.ceil(count / pageSize))}
                onClick={goToLast}
              >
                <span className="material-symbols-outlined text-lg">last_page</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-on-surface-variant">Mostrar:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="bg-surface-container-low rounded-lg px-3 py-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
