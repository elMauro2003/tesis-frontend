"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
import { Textarea } from "@/components/ui/textarea";
import { communicationService } from "@/core/services/communication.service";
import { FetchError } from "@/lib/fetchClient";
import { Information } from "@/types/models";

type AnnouncementFormValues = {
  title: string;
  content: string;
  expires_date: string;
  is_public: boolean;
};

interface AnnouncementFormModalProps {
  announcement: Information | null;
  open: boolean;
  onClose: () => void;
}

const emptyValues: AnnouncementFormValues = {
  title: "",
  content: "",
  expires_date: "",
  is_public: true,
};

const toDateInputValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

const normalizeValues = (announcement: Information | null): AnnouncementFormValues => ({
  title: announcement?.title ?? "",
  content: announcement?.content ?? "",
  expires_date: toDateInputValue(announcement?.expires_date),
  is_public: announcement?.is_public ?? true,
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

export function AnnouncementFormModal({ announcement, open, onClose }: AnnouncementFormModalProps) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState<AnnouncementFormValues>(emptyValues);

  const isEditing = Boolean(announcement);

  useEffect(() => {
    if (open) {
      setValues(normalizeValues(announcement));
    }
  }, [announcement, open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await communicationService.createInformation({
        title: values.title.trim(),
        content: values.content.trim(),
        expires_date: values.expires_date,
        is_public: values.is_public,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio publicado", {
        description: "El comunicado quedó registrado en el tablón.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo crear el anuncio", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!announcement) {
        return;
      }

      await communicationService.updateInformation(announcement.id, {
        title: values.title.trim(),
        content: values.content.trim(),
        expires_date: values.expires_date,
        is_public: values.is_public,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio actualizado", {
        description: "Los cambios se guardaron correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el anuncio", {
        description: getErrorMessage(error, "Revise los datos e intente de nuevo."),
      });
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const isValid = useMemo(
    () => values.title.trim().length > 0 && values.content.trim().length > 0 && values.expires_date.length > 0,
    [values.content, values.expires_date, values.title]
  );

  const handleSubmit = () => {
    if (!isValid || isSubmitting) {
      return;
    }

    if (isEditing) {
      updateMutation.mutate();
      return;
    }

    createMutation.mutate();
  };

  return (
    <BottomSheet open={open} onClose={onClose} maxWidthClassName="max-w-2xl">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-xl font-extrabold text-[var(--color-primary-dark)]">
                {isEditing ? "Editar anuncio" : "Nuevo anuncio"}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                {isEditing
                  ? "Actualice el contenido del comunicado seleccionado."
                  : "Redacte un comunicado para publicarlo en el tablón institucional."}
              </p>
            </div>
            <button
              type="button"
              className="cursor-pointer text-[var(--color-outline)] transition-colors hover:text-[var(--color-on-surface)]"
              onClick={onClose}
              aria-label="Cerrar modal"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="space-y-6 p-6">
          <FormField
            id="announcement-title"
            label="Título"
            icon="title"
            value={values.title}
            onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))}
            placeholder="Ej. Cierre temporal del comedor"
          />

          <div className="space-y-2">
            <label
              htmlFor="announcement-content"
              className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]"
            >
              Contenido
            </label>
            <Textarea
              id="announcement-content"
              value={values.content}
              onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))}
              placeholder="Escriba el cuerpo del anuncio..."
              className="min-h-40 rounded-2xl border-0 bg-[var(--color-surface-container-low)] px-4 py-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none focus-visible:bg-[var(--color-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            />
          </div>

          <FormField
            id="announcement-expires-date"
            label="Fecha de expiración"
            icon="event"
            type="date"
            value={values.expires_date}
            onChange={(event) => setValues((current) => ({ ...current, expires_date: event.target.value }))}
          />

          <label className="flex cursor-pointer items-center gap-3 rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-4">
            <input
              type="checkbox"
              checked={values.is_public}
              onChange={(event) => setValues((current) => ({ ...current, is_public: event.target.checked }))}
              className="h-4 w-4 rounded border-[var(--color-outline-variant)] text-[var(--color-primary)] focus:ring-[var(--color-primary)]/30"
            />
            <div>
              <p className="text-sm font-semibold text-[var(--color-on-surface)]">Visible para estudiantes</p>
              <p className="text-xs text-[var(--color-on-surface-variant)]">
                Si se desactiva, el anuncio quedará como comunicado interno del panel.
              </p>
            </div>
          </label>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/40 p-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="button" variant="confirm" onClick={handleSubmit} disabled={!isValid || isSubmitting}>
            {isSubmitting ? "Guardando..." : isEditing ? "Guardar cambios" : "Publicar anuncio"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
