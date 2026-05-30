"use client";

import React, { useEffect, useMemo, useState } from "react";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { Building, Site } from "@/types/models";
import { Button } from "@/components/ui/button";

export default function BuildingsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [siteFilter, setSiteFilter] = useState<number | "all">("all");

  const load = async (siteId?: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await infrastructureService.getBuildings(siteId);
      setBuildings(res.results ?? []);
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
      await load();
    };

    init();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (siteFilter === "all") {
      load();
    } else {
      load(siteFilter as number);
    }
  }, [siteFilter]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return buildings;
    return buildings.filter((b) => b.name.toLowerCase().includes(q));
  }, [buildings, search]);

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <h2 className="text-3xl font-headline font-extrabold tracking-tight text-primary-container">Edificios</h2>
        <div className="flex items-center gap-3">
          <Button variant="default" size="default">
            <span className="material-symbols-outlined">add</span>
            <span>Añadir Edificio</span>
          </Button>
        </div>
      </header>

      <section className="space-y-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <span className="material-symbols-outlined text-outline">search</span>
          </div>
          <input
            className="w-full bg-surface-container-low border-none rounded-xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            placeholder="Buscar edificio por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              className="appearance-none bg-surface-container-low border-none rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-on-surface-variant cursor-pointer hover:bg-surface-container-high transition-colors"
              value={siteFilter === "all" ? "all" : String(siteFilter)}
              onChange={(e) => setSiteFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            >
              <option value="all">Sede: Todas</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline">expand_more</span>
          </div>
        </div>
      </section>

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
                <tr>
                  <td colSpan={3} className="px-6 py-8 text-center text-sm text-on-surface-variant">
                    No hay edificios para mostrar.
                  </td>
                </tr>
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
          <div></div>
        </footer>
      </section>
    </div>
  );
}
