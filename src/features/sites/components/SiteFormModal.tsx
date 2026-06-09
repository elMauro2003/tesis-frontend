"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Site } from "@/types/models";
import { clearFieldError, FieldErrors, validateFields } from "@/utils/helpers/formFieldErrors";

type SiteFormValues = {
  name: string;
  address: string;
  description: string;
};

type SiteFormField = "name";

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SiteFormField> | null>(null);

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
      setFieldErrors(null);
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
    const errors = validateFields<SiteFormField>([
      {
        field: "name",
        valid: !!values.name.trim(),
        message: "Escriba un nombre corto y descriptivo para la sede.",
      },
    ]);

    if (errors) {
      setFieldErrors(errors);
      toast.error("Revise el formulario", {
        description: "Complete los campos obligatorios marcados.",
      });
      return;
    }

    setFieldErrors(null);

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
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>add_business</span>
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
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Nombre oficial de la sede</label>
            <Input
              value={values.name}
              onChange={(event) => {
                const name = event.target.value;
                setValues((current) => ({ ...current, name }));
                setFieldErrors((current) => clearFieldError(current, "name"));
              }}
              placeholder="Ej. Sede Central"
              aria-invalid={Boolean(fieldErrors?.name)}
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
            />
            <FormFieldError message={fieldErrors?.name} />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Dirección física</label>
            <Input
              value={values.address}
              onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))}
              placeholder="Ej. Carretera Camajuaní Km 5.5, Santa Clara"
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider mb-1.5 ml-1">Descripción</label>
            <Textarea
              value={values.description}
              onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
              placeholder="Notas breves sobre la sede, su uso o alcance territorial."
              rows={4}
              className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]"
            />
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-5 flex justify-end items-center gap-3 bg-[var(--color-surface-container-low)]">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleSubmit} disabled={isPending}>
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear sede"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}