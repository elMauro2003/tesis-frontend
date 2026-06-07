"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";

interface CreateComplaintSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CreateComplaintSheet({ open, onClose }: CreateComplaintSheetProps) {
  const queryClient = useQueryClient();
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [type, setType] = useState<"administrativa" | "educativa">("administrativa");
  const [description, setDescription] = useState("");

  const createMutation = useMutation({
    mutationFn: () =>
      complaintService.createComplaint({
        date,
        type,
        description: description.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["portal", "complaints"] });
      await queryClient.invalidateQueries({ queryKey: ["portal", "complaints", "pending-count"] });
      toast.success("Queja registrada", {
        description: "Su solicitud fue enviada correctamente.",
      });
      setDescription("");
      onClose();
    },
    onError: (error) => {
      const message = error instanceof FetchError ? error.message : "No se pudo registrar la queja.";
      toast.error("Error al registrar", { description: message });
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

    createMutation.mutate();
  };

  return (
    <BottomSheet open={open} onClose={onClose} title="Nueva queja" subtitle="Presente una queja o sugerencia">
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
          <Button type="submit" variant="confirm" disabled={createMutation.isPending}>
            {createMutation.isPending ? "Enviando..." : "Enviar queja"}
          </Button>
        </footer>
      </form>
    </BottomSheet>
  );
}
