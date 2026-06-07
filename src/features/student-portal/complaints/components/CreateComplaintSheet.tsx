"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useComplaintBuildings } from "@/features/student-portal/complaints/hooks/useComplaintBuildings";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";
import {
  COMPLAINT_TYPE_OPTIONS,
  getLocalTodayIsoDate,
} from "@/features/student-portal/complaints/utils/complaintPresentation";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

const MIN_DESCRIPTION_LENGTH = 15;
const MAX_DESCRIPTION_LENGTH = 1000;
const FORM_ID = "portal-complaint-form";

interface CreateComplaintSheetProps {
  open: boolean;
  onClose: () => void;
  complaint?: Complaint | null;
}

export function CreateComplaintSheet({ open, onClose, complaint }: CreateComplaintSheetProps) {
  const queryClient = useQueryClient();
  const buildingsQuery = useComplaintBuildings(open);
  const dailyQuota = useDailyComplaintQuota();
  const isEditing = Boolean(complaint);
  const descriptionHintId = useId();
  const canCreateToday = isEditing || dailyQuota.canCreate;

  const [date, setDate] = useState(getLocalTodayIsoDate);
  const [type, setType] = useState<"administrativa" | "educativa">("administrativa");
  const [buildingId, setBuildingId] = useState<string>("none");
  const [description, setDescription] = useState("");

  const buildings = buildingsQuery.data ?? [];
  const selectedType = COMPLAINT_TYPE_OPTIONS.find((option) => option.value === type);
  const buildingsLoading = buildingsQuery.isLoading;
  const buildingsUnavailable = !buildingsLoading && buildings.length === 0;

  useEffect(() => {
    if (!open) {
      return;
    }

    if (complaint) {
      setDate(complaint.date);
      setType((complaint.type as "administrativa" | "educativa") || "administrativa");
      setBuildingId(complaint.building ? String(complaint.building) : "none");
      setDescription(complaint.description);
      return;
    }

    setDate(getLocalTodayIsoDate());
    setType("administrativa");
    setBuildingId("none");
    setDescription("");
  }, [complaint, open]);

  useEffect(() => {
    if (!open || isEditing || dailyQuota.isLoading || dailyQuota.canCreate) {
      return;
    }

    toast.error("Límite diario alcanzado", {
      description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
    });
    onClose();
  }, [dailyQuota.canCreate, dailyQuota.isLoading, dailyQuota.limit, isEditing, onClose, open]);

  const descriptionLength = description.trim().length;
  const isDescriptionValid =
    descriptionLength >= MIN_DESCRIPTION_LENGTH && descriptionLength <= MAX_DESCRIPTION_LENGTH;

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload: {
        date: string;
        type: "administrativa" | "educativa";
        description: string;
        building?: number;
      } = {
        date,
        type,
        description: description.trim(),
      };

      if (buildingId !== "none") {
        payload.building = Number(buildingId);
      }

      if (complaint) {
        return complaintService.updateComplaint(complaint.id, payload);
      }

      return complaintService.createComplaint(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["portal", "complaints"] }),
        queryClient.invalidateQueries({ queryKey: ["portal", "complaints", "daily-quota"] }),
      ]);
      toast.success(isEditing ? "Queja actualizada" : "Queja registrada", {
        description: isEditing
          ? "Los cambios fueron guardados correctamente."
          : "Su solicitud fue enviada correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      const message =
        error instanceof FetchError
          ? error.message
          : isEditing
            ? "No se pudo actualizar la queja."
            : "No se pudo registrar la queja.";
      toast.error("Error", { description: message });
    },
  });

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();

    if (!isDescriptionValid) {
      toast.error("Descripción incompleta", {
        description: `Escriba al menos ${MIN_DESCRIPTION_LENGTH} caracteres describiendo el incidente.`,
      });
      return;
    }

    if (!isEditing && !dailyQuota.canCreate) {
      toast.error("Límite diario alcanzado", {
        description: `Solo puede registrar ${dailyQuota.limit} quejas por día. Intente mañana.`,
      });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      scrollable
      title={isEditing ? "Editar queja" : "Nueva queja"}
      subtitle={
        isEditing
          ? "Actualice los detalles de su solicitud."
          : `Describa el incidente. Le quedan ${dailyQuota.remainingToday} de ${dailyQuota.limit} quejas hoy.`
      }
      maxWidthClassName="max-w-lg"
      footer={
        <div className="flex gap-2">
          <Button type="button" variant="cancel" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            variant="confirm"
            disabled={saveMutation.isPending || !isDescriptionValid || !canCreateToday}
            className="flex-[1.4]"
          >
            <span className="material-symbols-outlined text-lg">
              {isEditing ? "save" : "send"}
            </span>
            {saveMutation.isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar"
                : "Enviar"}
          </Button>
        </div>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4 p-4">
        <section className="space-y-2">
          <Label className="text-label-caps text-[10px] font-bold text-on-surface-variant">
            Tipo de queja
          </Label>
          <div
            role="group"
            aria-label="Tipo de queja"
            className="grid grid-cols-2 gap-1 rounded-xl bg-surface-container-low p-1"
          >
            {COMPLAINT_TYPE_OPTIONS.map((option) => {
              const selected = type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  aria-pressed={selected}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-sm font-semibold transition-all",
                    selected
                      ? "bg-primary text-on-primary shadow-[var(--shadow-primary-btn)]"
                      : "text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface"
                  )}
                >
                  <span
                    className={cn(
                      "material-symbols-outlined text-base",
                      selected ? "text-on-primary" : "text-outline"
                    )}
                  >
                    {option.icon}
                  </span>
                  <span className="truncate">{option.label}</span>
                </button>
              );
            })}
          </div>
          {selectedType ? (
            <p className="text-xs leading-snug text-on-surface-variant">{selectedType.description}</p>
          ) : null}
        </section>

        <section className="space-y-3">
          <div className="space-y-1.5">
            <Label
              htmlFor="complaint-date"
              className="text-label-caps text-[10px] font-bold text-on-surface-variant"
            >
              Fecha del incidente
            </Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-outline">
                calendar_today
              </span>
              <Input
                id="complaint-date"
                type="date"
                className="h-10 pl-9"
                value={date}
                max={getLocalTodayIsoDate()}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="complaint-building"
              className="text-label-caps text-[10px] font-bold text-on-surface-variant"
            >
              Edificio / ubicación{" "}
              <span className="font-normal normal-case tracking-normal">(opcional)</span>
            </Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-base text-outline">
                location_on
              </span>
              <Select
                value={buildingId}
                onValueChange={setBuildingId}
                disabled={buildingsLoading || buildingsUnavailable}
              >
                <SelectTrigger id="complaint-building" className="h-10 pl-9">
                  <SelectValue
                    placeholder={
                      buildingsLoading
                        ? "Cargando edificios..."
                        : buildingsUnavailable
                          ? "Catálogo no disponible"
                          : "Seleccionar edificio"
                    }
                  />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin especificar</SelectItem>
                {buildings.map((building) => (
                  <SelectItem key={building.id} value={String(building.id)}>
                    {building.label}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
            {buildingsUnavailable ? (
              <p className="text-[11px] leading-snug text-on-surface-variant">
                Indique el edificio o lugar en la descripción del incidente.
              </p>
            ) : null}
          </div>
        </section>

        <section className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <Label
              htmlFor="complaint-description"
              className="text-label-caps text-[10px] font-bold text-on-surface-variant"
            >
              Descripción
            </Label>
            <span
              className={cn(
                "text-[11px] font-medium tabular-nums",
                isDescriptionValid ? "text-primary" : "text-outline"
              )}
            >
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <Textarea
            id="complaint-description"
            rows={4}
            placeholder="¿Qué ocurrió? Indique lugar, fecha aproximada y cómo le afecta."
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescription(e.target.value)}
            aria-describedby={descriptionHintId}
            className="min-h-[96px] resize-none rounded-xl bg-surface-container-low text-sm leading-relaxed"
            required
          />
          <p id={descriptionHintId} className="text-[11px] leading-snug text-outline">
            Mínimo {MIN_DESCRIPTION_LENGTH} caracteres.
          </p>
        </section>
      </form>
    </BottomSheet>
  );
}
