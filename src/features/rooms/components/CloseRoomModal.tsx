"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ModalCloseButton } from "@/components/shared/ModalCloseButton";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { FetchError } from "@/lib/fetchClient";
import { cn } from "@/utils/helpers/shadcn/index";
import { Room } from "@/types/models";

interface CloseRoomModalProps {
  room: Room | null;
  roomLabel: string;
  assignmentCount?: number;
  open: boolean;
  onClose: () => void;
  onClosed?: () => void;
}

const CLOSURE_CAUSES = [
  "Mantenimiento General",
  "Filtración / Avería Hidráulica",
  "Problema Eléctrico",
  "Fumigación / Higiene",
  "Otro",
] as const;

const closureFieldClass =
  "rounded-xl border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] focus-visible:border-[var(--color-tertiary)] focus-visible:ring-2 focus-visible:ring-[var(--color-tertiary)]/20";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) return error.message;
  if (error instanceof Error && error.message.trim()) return error.message;
  return fallback;
};

export function CloseRoomModal({
  room,
  roomLabel,
  assignmentCount = 0,
  open,
  onClose,
  onClosed,
}: CloseRoomModalProps) {
  const queryClient = useQueryClient();
  const [cause, setCause] = useState<string>(CLOSURE_CAUSES[0]);
  const [description, setDescription] = useState("");
  const [reopenDate, setReopenDate] = useState("");

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!room) return;
      await infrastructureService.updateRoom(room.id, { is_active: false });
    },
    onSuccess: async () => {
      if (room) {
        await queryClient.invalidateQueries({ queryKey: ["room-detail", room.id] });
      }
      await queryClient.invalidateQueries({ queryKey: ["rooms"] });
      await queryClient.invalidateQueries({ queryKey: ["active-assignments"] });
      const details = [cause, description.trim()].filter(Boolean).join(" — ");
      toast.success("Cuarto clausurado", {
        description: details || "El cuarto quedó fuera de servicio sin eliminar su historial.",
      });
      onClosed?.();
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo clausurar el cuarto", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      closeMutation.reset();
      return;
    }
    setCause(CLOSURE_CAUSES[0]);
    setDescription("");
    setReopenDate("");
  }, [open]);

  const roomNumber = useMemo(() => room?.number ?? roomLabel, [room, roomLabel]);
  const hasOccupants = assignmentCount > 0;
  const isPending = closeMutation.isPending;

  return (
    <BottomSheet open={open && !!room} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="flex w-full min-w-0 flex-col overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <header className="flex items-start justify-between gap-4 border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-lowest)] p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-tertiary-fixed)] text-[var(--color-tertiary)]">
              <span className="material-symbols-outlined text-[22px]">construction</span>
            </div>
            <div className="min-w-0">
              <h3 className="font-headline text-xl font-extrabold leading-tight text-[var(--color-on-surface)]">
                Clausurar Unidad Habitacional
              </h3>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                Inhabilitar el {roomNumber} para el alojamiento de estudiantes.
              </p>
            </div>
          </div>
          <ModalCloseButton onClick={onClose} />
        </header>

        <div className="space-y-5 p-6">
          <div>
            <label className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">
              Causa técnica o administrativa
            </label>
            <Select value={cause} onValueChange={setCause}>
              <SelectTrigger className={closureFieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLOSURE_CAUSES.map((option) => (
                  <SelectItem
                    key={option}
                    value={option}
                    className="data-[highlighted]:bg-[var(--color-tertiary-fixed)]/60 data-[highlighted]:text-[var(--color-on-tertiary-fixed)] data-[state=checked]:bg-[var(--color-tertiary-fixed)]/80 data-[state=checked]:text-[var(--color-on-tertiary-fixed)]"
                  >
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="close-room-description"
              className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]"
            >
              Descripción del estado
            </label>
            <Textarea
              id="close-room-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa brevemente el problema detectado..."
              rows={2}
              className={cn("text-sm", closureFieldClass)}
            />
          </div>

          <div>
            <label
              htmlFor="close-room-reopen"
              className="mb-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-tertiary-fixed-variant)]"
            >
              Reapertura prevista (opcional)
            </label>
            <Input
              id="close-room-reopen"
              type="date"
              value={reopenDate}
              onChange={(e) => setReopenDate(e.target.value)}
              className={closureFieldClass}
            />
          </div>

          <div
            className={cn(
              "flex items-start gap-3 rounded-xl border p-4",
              hasOccupants
                ? "border-[var(--color-error)]/25 bg-[var(--color-error-container)]/50"
                : "border-[var(--color-tertiary-fixed)] bg-[var(--color-tertiary-fixed)]/30"
            )}
          >
            <span
              className={cn(
                "material-symbols-outlined shrink-0 text-lg",
                hasOccupants ? "text-[var(--color-error)]" : "text-[var(--color-on-tertiary-fixed-variant)]"
              )}
            >
              {hasOccupants ? "warning" : "info"}
            </span>
            <p
              className={cn(
                "text-[11px] font-medium leading-tight",
                hasOccupants ? "text-[#93000a]" : "text-[var(--color-on-tertiary-fixed-variant)]"
              )}
            >
              {hasOccupants
                ? "Esta acción impedirá nuevas asignaciones a este cuarto. Los estudiantes que actualmente ocupan la plaza deberán ser permutados antes de proceder."
                : "Esta acción impedirá nuevas asignaciones a este cuarto hasta que lo reactive desde la edición del cuarto."}
            </p>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-5">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => closeMutation.mutate()}
            disabled={isPending}
            className=" border-transparent bg-[var(--color-tertiary)] font-bold text-[var(--color-on-tertiary)] shadow-[var(--shadow-tertiary-btn)] hover:bg-[var(--color-tertiary-container)] hover:text-[var(--color-on-tertiary)] active:scale-[0.98] disabled:bg-[var(--color-surface-container-high)] disabled:text-[var(--color-outline)] disabled:shadow-none disabled:hover:bg-[var(--color-surface-container-high)]"
          >
            <span className="material-symbols-outlined text-lg">construction</span>
            {isPending ? "Clausurando..." : "Confirmar clausura"}
          </Button>
        </footer>
      </div>
    </BottomSheet>
  );
}
