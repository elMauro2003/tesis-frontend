"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { clearFieldError, FieldErrors, validateFields } from "@/utils/helpers/formFieldErrors";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { Building, Room, Site, Wing } from "@/types/models";
import { getNumericId, getRoomWingId } from "@/features/rooms/utils/roomLabels";

interface RoomFormModalProps {
  room: Room | null;
  sites: Site[];
  buildings: Building[];
  wings: Wing[];
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

type RoomFormValues = {
  siteId: number | "";
  buildingId: number | "";
  wingId: number | "";
  number: string;
  capacity: string;
  isActive: boolean;
};

type RoomFormField = "location" | "number" | "capacity";

const emptyValues: RoomFormValues = {
  siteId: "",
  buildingId: "",
  wingId: "",
  number: "",
  capacity: "4",
  isActive: true,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

const resolveWingContext = (
  room: Room | null,
  wings: Wing[],
  buildings: Building[]
): Pick<RoomFormValues, "siteId" | "buildingId" | "wingId"> => {
  if (!room) return { siteId: "", buildingId: "", wingId: "" };

  const wingId = getRoomWingId(room);
  const wing = typeof room.wing === "object" ? room.wing : wings.find((w) => w.id === wingId);
  const buildingId = wing ? getNumericId(wing.building) : null;
  const building = buildingId !== null ? buildings.find((b) => b.id === buildingId) : undefined;
  const siteId = building ? getNumericId(building.site) : null;

  return {
    siteId: siteId ?? "",
    buildingId: buildingId ?? "",
    wingId: wingId ?? "",
  };
};

export function RoomFormModal({
  room,
  sites,
  buildings,
  wings,
  open,
  onClose,
  onSaved,
}: RoomFormModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<RoomFormValues>(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<RoomFormField> | null>(null);
  const isEditing = Boolean(room);

  const buildingsForSite = useMemo(() => {
    if (values.siteId === "") return [];
    return buildings.filter((b) => getNumericId(b.site) === values.siteId);
  }, [buildings, values.siteId]);

  const wingsForBuilding = useMemo(() => {
    if (values.buildingId === "") return [];
    return wings.filter((w) => getNumericId(w.building) === values.buildingId);
  }, [wings, values.buildingId]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await infrastructureService.createRoom({
        number: values.number.trim(),
        wing: Number(values.wingId),
        capacity: Number(values.capacity),
        is_active: values.isActive,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Cuarto creado", { description: "El cuarto quedó registrado correctamente." });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo crear el cuarto", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      return infrastructureService.updateRoom(room.id, {
        number: values.number.trim(),
        wing: Number(values.wingId),
        capacity: Number(values.capacity),
        is_active: values.isActive,
      });
    },
    onSuccess: async (updatedRoom) => {
      if (room && updatedRoom) {
        queryClient.setQueryData(["room-detail", room.id], updatedRoom);
        await queryClient.invalidateQueries({ queryKey: ["room-detail", room.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      toast.success("Cuarto actualizado", { description: "Los cambios se guardaron correctamente." });
      onSaved?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el cuarto", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  useEffect(() => {
    if (!open) return;

    const context = resolveWingContext(room, wings, buildings);
    setValues({
      ...context,
      number: room?.number ?? "",
      capacity: String(room?.capacity ?? 4),
      isActive: room?.is_active ?? true,
    });
    setFieldErrors(null);
    createMutation.reset();
    updateMutation.reset();
  }, [open, room, wings, buildings]);

  const title = isEditing ? "Editar Cuarto" : "Registrar Nuevo Cuarto";
  const subtitle = isEditing
    ? "Actualice el identificador, la ubicación y la capacidad del cuarto."
    : "Configure un nuevo cuarto y vincúlelo a un ala del sistema.";
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = () => {
    const capacity = Number(values.capacity);
    const errors = validateFields<RoomFormField>([
      {
        field: "location",
        valid: Boolean(values.siteId && values.buildingId && values.wingId),
        message: "Seleccione sede, edificio y ala.",
      },
      {
        field: "number",
        valid: !!values.number.trim(),
        message: "Escriba un identificador para el cuarto.",
      },
      {
        field: "capacity",
        valid: Number.isFinite(capacity) && capacity >= 1,
        message: "La capacidad debe ser al menos 1.",
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
        <div className="flex items-start gap-4 border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-lowest)] p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-selected)] text-[var(--color-primary)]">
            <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              bed
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-extrabold leading-tight text-[var(--color-primary-dark)]">{title}</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">{subtitle}</p>
          </div>
          <ModalCloseButton onClick={onClose} />
        </div>

        <div className="space-y-5 p-6">
          <div className="space-y-5">
            <div className="min-w-0 space-y-1">
              <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                Sede
              </label>
              <Select
                value={values.siteId === "" ? "" : String(values.siteId)}
                onValueChange={(value) => {
                  setValues((c) => ({ ...c, siteId: Number(value), buildingId: "", wingId: "" }));
                  setFieldErrors((current) => clearFieldError(current, "location"));
                }}
              >
                <SelectTrigger className="min-w-0 max-w-full">
                  <SelectValue placeholder="Seleccione la sede" />
                </SelectTrigger>
                <SelectContent className="max-w-[min(24rem,calc(100vw-2rem))]">
                  {sites.map((site) => (
                    <SelectItem key={site.id} value={String(site.id)} className="items-start py-2.5">
                      <span className="line-clamp-2 text-left leading-snug">{site.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid min-w-0 gap-5 sm:grid-cols-2">
              <div className="min-w-0 space-y-1">
                <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Edificio
                </label>
                <Select
                  value={values.buildingId === "" ? "" : String(values.buildingId)}
                  onValueChange={(value) => {
                    setValues((c) => ({ ...c, buildingId: Number(value), wingId: "" }));
                    setFieldErrors((current) => clearFieldError(current, "location"));
                  }}
                  disabled={values.siteId === ""}
                >
                  <SelectTrigger className="min-w-0 max-w-full">
                    <SelectValue placeholder="Edificio" />
                  </SelectTrigger>
                  <SelectContent className="max-w-[min(20rem,calc(100vw-2rem))]">
                    {buildingsForSite.map((building) => (
                      <SelectItem key={building.id} value={String(building.id)}>
                        <span className="line-clamp-2 text-left leading-snug">{building.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-0 space-y-1">
                <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                  Ala
                </label>
                <Select
                  value={values.wingId === "" ? "" : String(values.wingId)}
                  onValueChange={(value) => {
                    setValues((c) => ({ ...c, wingId: Number(value) }));
                    setFieldErrors((current) => clearFieldError(current, "location"));
                  }}
                  disabled={values.buildingId === ""}
                >
                  <SelectTrigger className="min-w-0 max-w-full">
                    <SelectValue placeholder="Ala" />
                  </SelectTrigger>
                  <SelectContent>
                    {wingsForBuilding.map((wing) => (
                      <SelectItem key={wing.id} value={String(wing.id)}>
                        {wing.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <FormFieldError message={fieldErrors?.location} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                Número / Identificador
              </label>
              <Input
                value={values.number}
                onChange={(e) => {
                  const number = e.target.value;
                  setValues((c) => ({ ...c, number }));
                  setFieldErrors((current) => clearFieldError(current, "number"));
                }}
                placeholder="Ej. Apto 15 - Cama 2"
                aria-invalid={Boolean(fieldErrors?.number)}
                className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
              />
              <FormFieldError message={fieldErrors?.number} />
            </div>
            <div className="space-y-1">
              <label className="mb-1.5 ml-1 block text-[10px] font-bold uppercase tracking-wider text-[var(--color-outline)]">
                Capacidad máxima
              </label>
              <Input
                type="number"
                min={1}
                value={values.capacity}
                onChange={(e) => {
                  const capacity = e.target.value;
                  setValues((c) => ({ ...c, capacity }));
                  setFieldErrors((current) => clearFieldError(current, "capacity"));
                }}
                aria-invalid={Boolean(fieldErrors?.capacity)}
                className="bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface)]"
              />
              <FormFieldError message={fieldErrors?.capacity} />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-[var(--color-surface-container-low)] px-4 py-3">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(e) => setValues((c) => ({ ...c, isActive: e.target.checked }))}
              className="h-4 w-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)]"
            />
            <span className="text-sm font-medium text-[var(--color-on-surface)]">Cuarto habilitado</span>
          </label>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleSubmit} disabled={isPending}>
            <span className="material-symbols-outlined text-lg">save</span>
            {isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Crear cuarto"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
