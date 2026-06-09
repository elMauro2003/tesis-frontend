"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

interface AssignComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

const PLACEHOLDER_WORKERS = [
  { id: 1, name: "Juan Pérez", role: "Plomero principal", initials: "JP" },
  { id: 2, name: "Miguel González", role: "Técnico de mantenimiento", initials: "MG" },
  { id: 3, name: "Roberto Carlos", role: "Mantenimiento general", initials: "RC" },
];

export function AssignComplaintModal({ complaint, open, onClose }: AssignComplaintModalProps) {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(PLACEHOLDER_WORKERS[0]?.id ?? null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedId(PLACEHOLDER_WORKERS[0]?.id ?? null);
    }
  }, [open]);

  const filteredWorkers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return PLACEHOLDER_WORKERS;
    }

    return PLACEHOLDER_WORKERS.filter(
      (worker) =>
        worker.name.toLowerCase().includes(query) || worker.role.toLowerCase().includes(query)
    );
  }, [search]);

  const handleConfirm = () => {
    toast.info("Asignación de responsables", {
      description: "La integración con el catálogo de trabajadores estará disponible próximamente.",
    });
    onClose();
  };

  return (
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Asignar trabajador"
      complaint={complaint}
      icon="person_add"
      iconWrapperClassName="bg-emerald-50 text-emerald-600"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="success" onClick={handleConfirm} disabled={!selectedId}>
            Confirmar asignación
          </Button>
        </div>
      }
    >
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[var(--color-outline)]">
          search
        </span>
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por nombre o especialidad..."
          className="h-10 rounded-xl border border-[var(--color-outline-variant)]/25 bg-[var(--color-surface-container-low)] pl-10 text-sm shadow-none"
        />
      </div>

      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {filteredWorkers.length === 0 ? (
          <p className="rounded-xl bg-[var(--color-surface-container-low)] p-4 text-center text-sm text-[var(--color-on-surface-variant)]">
            Sin resultados para la búsqueda actual.
          </p>
        ) : (
          filteredWorkers.map((worker) => {
            const active = selectedId === worker.id;

            return (
              <button
                key={worker.id}
                type="button"
                onClick={() => setSelectedId(worker.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center justify-between rounded-xl border p-3 text-left transition-colors",
                  active
                    ? "border-emerald-500 bg-emerald-50/50"
                    : "border-[var(--color-outline-variant)]/25 bg-[var(--color-surface-container-lowest)] hover:border-emerald-300"
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold uppercase",
                      active ? "bg-emerald-100 text-emerald-700" : "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]"
                    )}
                  >
                    {worker.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[var(--color-on-surface)]">{worker.name}</p>
                    <p className="truncate text-[10px] font-medium uppercase text-[var(--color-on-surface-variant)]">
                      {worker.role}
                    </p>
                  </div>
                </div>
                {active ? (
                  <span className="material-symbols-outlined shrink-0 text-emerald-600">check_circle</span>
                ) : (
                  <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--color-outline-variant)]/40" />
                )}
              </button>
            );
          })
        )}
      </div>
    </ComplaintActionDialog>
  );
}
