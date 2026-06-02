"use client";

import { useEffect, useMemo, useState } from "react";
import { Building, Room, Site, Wing } from "@/types/models";

type AnyRecord = Record<string, unknown>;

type BuildingMetrics = {
  roomCount: number;
  availableSpots: number;
  capacity: number;
  occupiedSpots: number;
  occupancyPercent: number;
};

interface ViewBuildingPanelProps {
  building: Building | null;
  metrics: BuildingMetrics | null;
  wings: Wing[];
  rooms: Room[];
  sites: Site[];
  onRequestDeleteWing: (wing: Wing) => void;
  onClose: () => void;
}

const ANIM_MS = 320;

const getNumericId = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && !Number.isNaN(Number(value))) return Number(value);
  if (value && typeof value === "object" && "id" in value) return getNumericId((value as AnyRecord).id);
  return null;
};

const getWingBuildingId = (wing: Wing): number | null => getNumericId(wing.building);

const getRoomWingId = (room: Room): number | null => getNumericId(room.wing);

const getBuildingSiteLabel = (building: Building, sitesById: Map<number, Site>): string => {
  if (typeof building.site === "object" && building.site && "name" in building.site) {
    return String((building.site as Site).name);
  }

  const siteId = getNumericId(building.site);
  if (siteId !== null) {
    return sitesById.get(siteId)?.name ?? "-";
  }

  return "-";
};

export function ViewBuildingPanel({ building, metrics, wings, rooms, sites, onRequestDeleteWing, onClose }: ViewBuildingPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!building) {
      setIsOpen(false);
      return;
    }

    setIsOpen(true);
  }, [building]);

  const sitesById = useMemo(() => new Map(sites.map((site) => [site.id, site])), [sites]);

  const buildingWings = useMemo(
    () => wings.filter((wing) => getWingBuildingId(wing) === building?.id),
    [wings, building]
  );

  const wingRoomCounts = useMemo(() => {
    const map = new Map<number, number>();

    for (const room of rooms) {
      const wingId = getRoomWingId(room);
      if (wingId === null) continue;

      map.set(wingId, (map.get(wingId) ?? 0) + 1);
    }

    return map;
  }, [rooms]);

  const totalRooms = useMemo(
    () => buildingWings.reduce((sum, wing) => sum + (wingRoomCounts.get(wing.id) ?? 0), 0),
    [buildingWings, wingRoomCounts]
  );

  const handleRequestClose = () => {
    setIsOpen(false);
    window.setTimeout(() => onClose(), ANIM_MS);
  };

  if (!isOpen && !building) return null;

  const buildingName = building?.name ?? "Edificio";
  const buildingGender = building?.gender ?? "Tipo no definido";
  const siteLabel = building ? getBuildingSiteLabel(building, sitesById) : "-";
  const wingCount = buildingWings.length;
  const capacity = metrics?.capacity ?? 0;
  const availableSpots = metrics?.availableSpots ?? 0;
  const occupancyPercent = metrics?.occupancyPercent ?? 0;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={handleRequestClose}
        aria-hidden
      />

      <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-[var(--color-surface-container-lowest)] shadow-2xl flex flex-col overflow-hidden transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"}`} role="dialog" aria-modal="true">
        <header className="bg-[var(--color-surface-container-lowest)] border-b border-[var(--color-outline-variant)]/20 p-6 flex flex-col gap-4 relative">
          <div className="flex items-center gap-4 mt-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl ring-4 ring-[var(--color-surface-container-lowest)] shadow-sm bg-[var(--color-primary-light)] text-[var(--color-primary)]">
              <span className="material-symbols-outlined text-3xl">domain</span>
            </div>
            <div>
              <h3 className="text-2xl font-headline font-bold text-[var(--color-primary-dark)] leading-tight">
                {buildingName}
              </h3>
              <p className="text-[var(--color-on-surface-variant)] font-medium mt-1">Sede: {siteLabel}</p>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
              {capacity} de capacidad
            </span>
            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
              {availableSpots} plazas libres
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-100">
              {occupancyPercent}% ocupación
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[var(--color-surface)]">
          <section className="p-5 rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[0_8px_30px_rgba(15,23,77,0.06)]">
            <h4 className="text-[10px] uppercase text-[var(--color-outline)] font-extrabold tracking-widest mb-4">Ubicación y bloque</h4>
            <div className="grid grid-cols-2 gap-y-4 gap-x-4">
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Sede</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{siteLabel}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Tipo de bloque</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{buildingGender}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Alas</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{wingCount}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase text-[var(--color-outline)] font-bold">Cuartos</p>
                <p className="text-sm text-[var(--color-on-surface)] font-semibold">{totalRooms}</p>
              </div>
            </div>
          </section>

          <section className="p-5 rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[0_8px_30px_rgba(15,23,77,0.06)]">
            <h4 className="text-[10px] uppercase text-[var(--color-outline)] font-extrabold tracking-widest mb-4">Alas del edificio</h4>

            {buildingWings.length === 0 ? (
              <p className="text-sm text-[var(--color-on-surface-variant)]">Este edificio aún no tiene alas registradas.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {buildingWings.map((wing) => {
                  const roomCount = wingRoomCounts.get(wing.id) ?? 0;

                  return (
                    <button
                      key={wing.id}
                      type="button"
                      onClick={() => onRequestDeleteWing(wing)}
                      className="inline-flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] px-3 py-2 text-sm font-semibold text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-high)] cursor-pointer"
                      title="Quitar ala"
                      aria-label={`Quitar ala ${wing.name}`}
                    >
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-surface-container-lowest)] text-[var(--color-error)] text-xs font-bold leading-none">
                        <span className="material-symbols-outlined text-[16px]">remove</span>
                      </span>
                      <span>{wing.name}</span>
                      <span className="text-xs font-medium text-[var(--color-on-surface-variant)]">{roomCount} cuarto{roomCount === 1 ? "" : "s"}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </>
  );
}

export default ViewBuildingPanel;