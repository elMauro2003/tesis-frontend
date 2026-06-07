"use client";

import { FormEvent, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";

interface CreateComplaintSheetProps {
  open: boolean;
  onClose: () => void;
  complaint?: Complaint | null;
}

export function CreateComplaintSheet({ open, onClose, complaint }: CreateComplaintSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = Boolean(complaint);
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"administrativa" | "educativa">("administrativa");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    if (complaint) {
      setDate(complaint.date);
      setType((complaint.type as "administrativa" | "educativa") || "administrativa");
      setDescription(complaint.description);
      return;
    }

    setDate(new Date().toISOString().split("T")[0]);
    setType("administrativa");
    setDescription("");
  }, [complaint, open]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        date,
        type,
        description: description.trim(),
      };

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

    if (!description.trim()) {
      toast.error("Descripción requerida", {
        description: "Escriba los detalles de su queja o sugerencia.",
      });
      return;
    }

    saveMutation.mutate();
  };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar queja" : "Nueva queja"}
      subtitle={isEditing ? "Actualice los detalles de su solicitud." : "Presente una queja o sugerencia."}
    >
      <form onSubmit={handleSubmit} className="space-y-4 p-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Fecha
            </label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Tipo
            </label>
            <Select value={type} onValueChange={(value: "administrativa" | "educativa") => setType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="administrativa">Administrativa</SelectItem>
                <SelectItem value="educativa">Educativa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
            Descripción
          </label>
          <Textarea
            rows={4}
            placeholder="Describa el problema o sugerencia..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <footer className="flex justify-end gap-3 border-t border-outline-variant/15 pt-4">
          <Button type="button" variant="cancel" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="confirm" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Guardando..." : isEditing ? "Guardar cambios" : "Enviar queja"}
          </Button>
        </footer>
      </form>
    </BottomSheet>
  );
}
