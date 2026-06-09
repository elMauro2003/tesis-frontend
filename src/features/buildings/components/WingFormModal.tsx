"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/FormField";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { clearFieldError, FieldErrors, validateFields } from "@/utils/helpers/formFieldErrors";
import { FetchError } from "@/lib/fetchClient";
import { Building, Wing } from "@/types/models";

interface WingFormModalProps {
  wing?: Wing | null;
  building: Building | null;
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type WingFormValues = {
  name: string;
};

type WingFormField = "name";

const emptyValues: WingFormValues = {
  name: "",
};

const WING_PREFIX = "Ala";

const normalizeWingSuffix = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) return "";

  return trimmed.replace(/^ala(?:\s|:|-)+/i, "").trimStart();
};

const composeWingName = (suffix: string) => {
  const normalizedSuffix = normalizeWingSuffix(suffix);
  return normalizedSuffix ? `${WING_PREFIX} ${normalizedSuffix}` : WING_PREFIX;
};

const normalizeValues = (wing: Wing | null): WingFormValues => ({
  name: wing?.name ? normalizeWingSuffix(wing.name) : "",
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

export function WingFormModal({ wing, building, open, onClose, onSaved }: WingFormModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<WingFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<WingFormField> | null>(null);

  const isEditing = Boolean(wing);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!building) return;

      await infrastructureService.createWing({
        name: composeWingName(values.name),
        building: building.id,
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["buildings-all"] }),
      ]);
      toast.success("Ala creada", {
        description: "La nueva ala quedó registrada correctamente.",
      });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo crear el ala", {
        description: getErrorMessage(error, "Revise los datos e intente nuevamente."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!wing) return;

      await infrastructureService.updateWing(wing.id, {
        name: composeWingName(values.name),
        building: building?.id ?? (typeof wing.building === "number" ? wing.building : wing.building.id),
      });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["wings-all"] }),
        queryClient.invalidateQueries({ queryKey: ["buildings-all"] }),
      ]);
      toast.success("Ala actualizada", {
        description: "Los cambios se guardaron correctamente.",
      });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el ala", {
        description: getErrorMessage(error, "Revise los datos e intente nuevamente."),
      });
    },
  });

  useEffect(() => {
    if (open) {
      setValues(normalizeValues(wing ?? null));
      setFieldErrors(null);
      createMutation.reset();
      updateMutation.reset();
    }
  }, [open, wing]);

  const title = useMemo(() => (isEditing ? "Editar ala" : "Registrar nueva ala"), [isEditing]);
  const subtitle = useMemo(
    () => (isEditing ? "Actualice el identificador del ala." : "Registre una nueva ala dentro del edificio seleccionado."),
    [isEditing]
  );
  const buildingLabel = building?.name ?? "Edificio no seleccionado";
  const wingNamePreview = composeWingName(values.name);
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    if (!building) {
      toast.error("Falta el edificio asociado", {
        description: "Seleccione un edificio para continuar.",
      });
      return;
    }

    const errors = validateFields<WingFormField>([
      {
        field: "name",
        valid: !!values.name.trim(),
        message: "Escriba el sufijo del nombre, por ejemplo Norte o B.",
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
            <span className="material-symbols-outlined text-[22px]">apartment</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-extrabold text-[var(--color-primary-dark)] leading-tight font-headline">{title}</h3>
            <p className="mt-1 text-xs text-[var(--color-on-surface-variant)] leading-relaxed">{subtitle}</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          <div className="cursor-not-allowed">
            <FormField
              label="Edificio asociado"
              id="wing-building"
              value={buildingLabel}
              disabled
              readOnly
              className="bg-[var(--color-surface-container-low)] text-[var(--color-on-surface)] opacity-100 cursor-not-allowed disabled:!cursor-not-allowed disabled:!opacity-100 disabled:bg-[var(--color-surface-container-low)] disabled:text-[var(--color-on-surface)]"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-[var(--color-outline)] uppercase tracking-wider ml-1">Nombre del ala</label>
            <div className="overflow-hidden rounded-2xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-highest)] transition-all focus-within:border-[var(--color-primary)] focus-within:ring-2 focus-within:ring-[rgba(0,55,176,0.16)]">
              <div className="flex items-stretch">
                <div className="flex items-center border-r border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)] px-4 text-sm font-semibold text-[var(--color-on-surface-variant)]">
                  Ala
                </div>
                <Input
                  value={values.name}
                  onChange={(event) => {
                    const name = normalizeWingSuffix(event.target.value);
                    setValues((current) => ({ ...current, name }));
                    setFieldErrors((current) => clearFieldError(current, "name"));
                  }}
                  onBlur={(event) => setValues((current) => ({ ...current, name: normalizeWingSuffix(event.target.value) }))}
                  placeholder="Ej. Norte"
                  aria-label="Nombre del ala"
                  aria-invalid={Boolean(fieldErrors?.name)}
                  className="h-12 rounded-none border-0 bg-transparent px-4 shadow-none focus-visible:ring-0"
                />
              </div>
            </div>
            <FormFieldError message={fieldErrors?.name} />
            <p className="ml-1 text-xs text-[var(--color-on-surface-variant)]">
              Se guardará como <span className="font-semibold text-[var(--color-on-surface)]">{wingNamePreview}</span>
            </p>
          </div>
        </div>

        <footer className="border-t border-[var(--color-outline-variant)]/15 p-5 flex justify-end items-center gap-3 bg-[var(--color-surface-container-low)]">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleSubmit} disabled={isPending}>
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear ala"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}

export default WingFormModal;