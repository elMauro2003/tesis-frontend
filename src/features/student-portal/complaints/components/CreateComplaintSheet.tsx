"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useComplaintBuildings } from "@/features/student-portal/complaints/hooks/useComplaintBuildings";
import { COMPLAINT_TYPE_OPTIONS } from "@/features/student-portal/complaints/utils/complaintPresentation";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

const MIN_DESCRIPTION_LENGTH = 15;
const MAX_DESCRIPTION_LENGTH = 1000;

interface CreateComplaintSheetProps {
  open: boolean;
  onClose: () => void;
  complaint?: Complaint | null;
}

export function CreateComplaintSheet({ open, onClose, complaint }: CreateComplaintSheetProps) {
  const queryClient = useQueryClient();
  const buildingsQuery = useComplaintBuildings();
  const isEditing = Boolean(complaint);

  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"administrativa" | "educativa">("administrativa");
  const [buildingId, setBuildingId] = useState<string>("none");
  const [description, setDescription] = useState("");

  const buildings = buildingsQuery.data ?? [];
  const showBuildingField = buildings.length > 0;

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

    setDate(new Date().toISOString().split("T")[0]);
    setType("administrativa");
    setBuildingId("none");
    setDescription("");
  }, [complaint, open]);

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
      await queryClient.invalidateQueries({ queryKey: ["portal", "complaints"] });
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

    saveMutation.mutate();
  };

  const typeHint = useMemo(
    () => COMPLAINT_TYPE_OPTIONS.find((option) => option.value === type)?.description ?? "",
    [type]
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar queja" : "Nueva queja"}
      subtitle={
        isEditing
          ? "Actualice los detalles de su solicitud."
          : "Complete los campos requeridos por el sistema de quejas."
      }
      maxWidthClassName="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <section className="rounded-xl bg-surface-container-low p-4">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Su queja será revisada por la administración. Incluya fecha, tipo, descripción y, si
            aplica, el edificio donde ocurrió el incidente.
          </p>
        </section>

        <section className="space-y-3">
          <Label className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
            Tipo de queja
          </Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMPLAINT_TYPE_OPTIONS.map((option) => {
              const selected = type === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value)}
                  className={cn(
                    "rounded-xl border-2 p-4 text-left transition-all",
                    selected
                      ? "border-primary bg-primary-fixed/40 shadow-[var(--shadow-ambient)]"
                      : "border-transparent bg-surface-container-lowest hover:bg-surface-container-low"
                  )}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={cn(
                        "material-symbols-outlined",
                        selected ? "text-primary" : "text-outline"
                      )}
                    >
                      {option.icon}
                    </span>
                    <span className="font-headline text-sm font-bold text-on-surface">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-on-surface-variant">{option.description}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-outline">{typeHint}</p>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label
              htmlFor="complaint-date"
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Fecha del incidente
            </Label>
            <div className="relative">
              <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-outline">
                calendar_today
              </span>
              <Input
                id="complaint-date"
                type="date"
                className="pl-10"
                value={date}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          {showBuildingField ? (
            <div className="space-y-2">
              <Label
                htmlFor="complaint-building"
                className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
              >
                Edificio (opcional)
              </Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger id="complaint-building">
                  <SelectValue placeholder="Seleccionar edificio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin especificar</SelectItem>
                  {buildings.map((building) => (
                    <SelectItem key={building.id} value={String(building.id)}>
                      {building.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </section>

        {!showBuildingField ? (
          <p className="text-xs text-on-surface-variant">
            Si el incidente ocurrió en un edificio específico, indíquelo en la descripción.
          </p>
        ) : null}

        <section className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label
              htmlFor="complaint-description"
              className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant"
            >
              Descripción del incidente
            </Label>
            <span
              className={cn(
                "text-xs font-medium",
                isDescriptionValid ? "text-primary" : "text-outline"
              )}
            >
              {descriptionLength}/{MAX_DESCRIPTION_LENGTH}
            </span>
          </div>
          <Textarea
            id="complaint-description"
            rows={5}
            placeholder="Describa qué ocurrió, dónde sucedió y cómo le afecta. Sea claro y específico."
            value={description}
            maxLength={MAX_DESCRIPTION_LENGTH}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[140px] resize-none rounded-xl bg-surface-container-low"
            required
          />
          <p className="text-xs text-outline">
            Mínimo {MIN_DESCRIPTION_LENGTH} caracteres. Evite datos personales de terceros.
          </p>
        </section>

        <footer className="flex flex-col-reverse gap-3 border-t border-outline-variant/15 pt-4 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} className="w-full sm:w-auto">
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="confirm"
            disabled={saveMutation.isPending || !isDescriptionValid}
            className="w-full sm:w-auto"
          >
            <span className="material-symbols-outlined text-lg">
              {isEditing ? "save" : "send"}
            </span>
            {saveMutation.isPending
              ? "Guardando..."
              : isEditing
                ? "Guardar cambios"
                : "Enviar queja"}
          </Button>
        </footer>
      </form>
    </BottomSheet>
  );
}
