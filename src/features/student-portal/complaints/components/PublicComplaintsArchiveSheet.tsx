"use client";

import { useMemo, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Complaint } from "@/types/models";
import {
  COMPLAINT_STATUS_LABELS,
  formatComplaintDateShort,
  getBuildingLabel,
  getComplaintTitle,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

interface PublicComplaintsArchiveSheetProps {
  open: boolean;
  onClose: () => void;
  complaints: Complaint[];
}

export function PublicComplaintsArchiveSheet({
  open,
  onClose,
  complaints,
}: PublicComplaintsArchiveSheetProps) {
  const [search, setSearch] = useState("");
  const [buildingFilter, setBuildingFilter] = useState("all");

  const buildings = useMemo(() => {
    const values = new Set(complaints.map((complaint) => getBuildingLabel(complaint)));
    return Array.from(values).sort();
  }, [complaints]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return complaints.filter((complaint) => {
      const matchesBuilding =
        buildingFilter === "all" || getBuildingLabel(complaint) === buildingFilter;
      const matchesSearch =
        !query ||
        complaint.description.toLowerCase().includes(query) ||
        getBuildingLabel(complaint).toLowerCase().includes(query);

      return matchesBuilding && matchesSearch;
    });
  }, [buildingFilter, complaints, search]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Quejas visibles"
      subtitle="Historial de incidencias resueltas y publicadas por la administración."
      maxWidthClassName="max-w-4xl"
    >
      <div className="space-y-4 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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

        <div className="overflow-hidden rounded-xl border border-outline-variant/30">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-surface-container-low">
                <tr>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-outline">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-outline">
                    Edificio
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-outline">
                    Asunto
                  </th>
                  <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-outline">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-sm text-on-surface-variant">
                      No hay quejas que coincidan con los filtros.
                    </td>
                  </tr>
                ) : (
                  filtered.map((complaint) => (
                    <tr key={complaint.id} className="hover:bg-surface-container-lowest">
                      <td className="px-4 py-3 text-sm text-on-surface">
                        {formatComplaintDateShort(complaint.date)}
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold">{getBuildingLabel(complaint)}</td>
                      <td className="px-4 py-3 text-sm text-on-surface-variant">
                        {getComplaintTitle(complaint.description)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-success-light px-3 py-1 text-[10px] font-black uppercase tracking-wider text-green-800">
                          {COMPLAINT_STATUS_LABELS[complaint.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-outline-variant/20 md:hidden">
            {filtered.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-on-surface-variant">
                No hay quejas que coincidan con los filtros.
              </p>
            ) : (
              filtered.map((complaint) => (
                <div key={complaint.id} className="space-y-2 px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs text-outline">{formatComplaintDateShort(complaint.date)}</span>
                    <span className="rounded-full bg-success-light px-2 py-0.5 text-[10px] font-black uppercase text-green-800">
                      {COMPLAINT_STATUS_LABELS[complaint.status]}
                    </span>
                  </div>
                  <p className="text-sm font-semibold">{getBuildingLabel(complaint)}</p>
                  <p className="text-sm text-on-surface-variant">
                    {getComplaintTitle(complaint.description)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
