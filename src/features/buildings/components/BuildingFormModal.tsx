"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Building, BuildingGender, Site } from "@/types/models";

interface BuildingFormModalProps {
  building: Building | null;
  sites: Site[];
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type BuildingFormValues = {
  siteId: number | "";
  name: string;
  gender: BuildingGender | "";
};

const emptyValues: BuildingFormValues = {
  siteId: "",
  name: "",
  gender: "",
};

const normalizeValues = (building: Building | null): BuildingFormValues => ({
  siteId: building ? (typeof building.site === "number" ? building.site : building.site.id) : "",
  name: building?.name ?? "",
  gender: building?.gender ?? "",
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

export function BuildingFormModal({ building, sites, open, onClose, onSaved }: BuildingFormModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<BuildingFormValues>(emptyValues);

  const isEditing = Boolean(building);

  const createMutation = useMutation({
    mutationFn: async () => {
      await infrastructureService.createBuilding({
        name: values.name.trim(),
        gender: values.gender || undefined,
        site: Number(values.siteId),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["buildings-all"] });
      toast.success("Edificio creado", {
        description: "El nuevo edificio quedó registrado correctamente.",
      });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo crear el edificio", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!building) return;

      await infrastructureService.updateBuilding(building.id, {
        name: values.name.trim(),
        gender: values.gender || undefined,
        site: Number(values.siteId),
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["buildings-all"] });
      toast.success("Edificio actualizado", {
        description: "Los cambios se guardaron correctamente.",
      });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el edificio", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  useEffect(() => {
    if (open) {
      setValues(normalizeValues(building));
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, building]);

  const title = useMemo(() => (isEditing ? "Editar Edificio" : "Registrar Nuevo Edificio"), [isEditing]);
  const subtitle = useMemo(
    () => (isEditing ? "Actualice la sede, el nombre y el tipo de bloque." : "Configure un nuevo edificio y vincúlelo a una sede."),
    [isEditing]
  );
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!values.siteId) {
      toast.error("Falta la sede asociada", {
        description: "Seleccione una sede para continuar.",
      });
      return;
    }

    if (!values.name.trim()) {
      toast.error("Falta el nombre del edificio", {
        description: "Escriba un nombre corto y descriptivo para continuar.",
      });
      return;
    }

    if (!values.gender) {
      toast.error("Falta el tipo de bloque", {
        description: "Seleccione si el edificio es para varones, hembras o mixto.",
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
        <div className="bg-[var(--color-surface-container-lowest)] p-6 flex items-start gap-4 border-b border-[var(--color-outline-variant)]/15">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-selected)] flex items-center justify-center shrink-0 text-[var(--color-primary)]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>domain_add</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-[var(--color-primary-dark)] leading-tight font-headline">{title}</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">{subtitle}</p>
          </div>
          <button type="button" className="text-[var(--color-outline)] hover:text-[var(--color-on-surface)] transition-colors cursor-pointer" onClick={onClose} aria-label="Cerrar modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Sede asociada</label>
            <Select
              value={values.siteId === "" ? "" : String(values.siteId)}
              onValueChange={(value) => setValues((current) => ({ ...current, siteId: Number(value) }))}
            >
              <SelectTrigger className="h-12 rounded-2xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-container-low)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] [&>span]:line-clamp-1">
                <SelectValue placeholder="Seleccione una sede" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={String(site.id)}>
                    {site.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Identificador / Nombre</label>
              <Input
                value={values.name}
                onChange={(event) => setValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ej. Edificio U10"
                className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Tipo de bloque</label>
              <Select
                value={values.gender}
                onValueChange={(value) => setValues((current) => ({ ...current, gender: value as BuildingGender }))}
              >
                <SelectTrigger className="h-12 rounded-2xl border border-[var(--color-outline-variant)]/45 bg-[var(--color-surface-container-lowest)] px-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none transition-all outline-none hover:border-[var(--color-primary)]/30 hover:bg-[var(--color-surface-container-low)] focus-visible:ring-1 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-0 data-[placeholder]:text-[var(--color-on-surface-variant)] [&>span]:line-clamp-1">
                  <SelectValue placeholder="Seleccione el tipo de bloque" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Varones">Varones</SelectItem>
                  <SelectItem value="Hembras">Hembras</SelectItem>
                  <SelectItem value="Mixto">Mixto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-5 flex justify-end items-center gap-3 bg-[var(--color-surface-container-low)]">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleSubmit} disabled={isPending}>
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear edificio"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}

export default BuildingFormModal;
