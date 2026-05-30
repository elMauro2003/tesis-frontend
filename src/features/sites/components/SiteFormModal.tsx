"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Site } from "@/types/models";

type SiteFormValues = {
  name: string;
  address: string;
  description: string;
};

interface SiteFormModalProps {
  site: Site | null;
  open: boolean;
  onClose: () => void;
}

const emptyValues: SiteFormValues = {
  name: "",
  address: "",
  description: "",
};

const normalizeValues = (site: Site | null): SiteFormValues => ({
  name: site?.name ?? "",
  address: site?.address ?? "",
  description: site?.description ?? "",
});

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export function SiteFormModal({ site, open, onClose }: SiteFormModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<SiteFormValues>(emptyValues);

  const isEditing = Boolean(site);

  const createMutation = useMutation({
    mutationFn: async () => {
      await infrastructureService.createSite({
        name: values.name.trim(),
        address: values.address.trim() || null,
        description: values.description.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Sede creada", {
        description: "La nueva sede quedó registrada correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo crear la sede", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!site) {
        return;
      }

      await infrastructureService.updateSite(site.id, {
        name: values.name.trim(),
        address: values.address.trim() || null,
        description: values.description.trim() || null,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["sites"] });
      toast.success("Sede actualizada", {
        description: "Los cambios se guardaron correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo actualizar la sede", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  useEffect(() => {
    if (open) {
      setValues(normalizeValues(site));
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, site]);

  const title = useMemo(() => (isEditing ? "Editar Sede" : "Añadir Sede"), [isEditing]);
  const subtitle = useMemo(
    () => (isEditing ? "Modifique el nombre y la ubicación de la sede." : "Registre una nueva ubicación institucional en el sistema."),
    [isEditing]
  );
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!values.name.trim()) {
      toast.error("Falta el nombre de la sede", {
        description: "Escriba un nombre corto y descriptivo para continuar.",
      });
      return;
    }

    if (isEditing) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxWidthClassName="max-w-lg">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="bg-blue-50 p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 text-blue-600">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>location_city</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-blue-900 leading-tight">{title}</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)]">{subtitle}</p>
          </div>
          <button type="button" className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider px-1">Nombre de la sede</label>
            <Input
              value={values.name}
              onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
              placeholder="Ej. Sede Central"
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider px-1">Dirección / Ubicación</label>
            <Input
              value={values.address}
              onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
              placeholder="Ej. Carretera Camajuaní Km 5.5, Santa Clara"
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider px-1">Descripción</label>
            <Textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              placeholder="Notas breves sobre la sede, su uso o alcance territorial."
              rows={4}
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]"
            />
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-6 flex justify-end items-center gap-3 bg-[var(--color-surface-container-lowest)]">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer"
            disabled={isPending}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-[var(--color-on-primary)] bg-[var(--color-primary)] shadow-[var(--shadow-primary-btn)] hover:bg-[var(--color-on-primary-fixed-variant)] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear sede"}
          </button>
        </footer>
      </div>
    </BottomSheet>
  );
}