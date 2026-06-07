"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
import { Textarea } from "@/components/ui/textarea";
import { AnnouncementCategoryPicker } from "@/features/announcements/components/AnnouncementCategoryPicker";
import { AnnouncementVisibilityPicker } from "@/features/announcements/components/AnnouncementVisibilityPicker";
import { ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS } from "@/features/announcements/constants";
import { communicationService } from "@/core/services/communication.service";
import { FetchError } from "@/lib/fetchClient";
import { Information } from "@/types/models";
import {
  AnnouncementFormValues,
  buildInformationPayload,
  createEmptyAnnouncementFormValues,
  getExpiryDateForCategory,
  isAnnouncementFormValid,
  normalizeAnnouncementFormValues,
} from "@/features/announcements/utils/announcementForm";

interface AnnouncementFormModalProps {
  announcement: Information | null;
  open: boolean;
  onClose: () => void;
}

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
  const [values, setValues] = useState<AnnouncementFormValues>(createEmptyAnnouncementFormValues());

  const isEditing = Boolean(announcement);

  useEffect(() => {
    if (open) {
      setValues(normalizeAnnouncementFormValues(announcement));
    }
  }, [announcement, open]);

  const createMutation = useMutation({
    mutationFn: async () => {
      await communicationService.createInformation(buildInformationPayload(values));
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

      await communicationService.updateInformation(announcement.id, buildInformationPayload(values));
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
  const isValid = useMemo(() => isAnnouncementFormValid(values), [values]);

  const handleCategoryChange = (category: AnnouncementFormValues["category"]) => {
    setValues((current) => ({
      ...current,
      category,
      expires_date: getExpiryDateForCategory(category, current.published_date),
    }));
  };

  const handlePublishedDateChange = (publishedDate: string) => {
    setValues((current) => ({
      ...current,
      published_date: publishedDate,
      expires_date: getExpiryDateForCategory(current.category, publishedDate),
    }));
  };

  const handleSubmit = () => {
    if (!isValid || isSubmitting) {
      if (!values.title.trim() || !values.content.trim()) {
        toast.error("Faltan campos obligatorios", {
          description: "Complete el título y el contenido del anuncio.",
        });
        return;
      }

      toast.error("Revise las fechas del anuncio", {
        description: "La fecha de expiración debe ser igual o posterior a la de publicación.",
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
    <BottomSheet open={open} onClose={onClose} maxWidthClassName="max-w-3xl">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="border-b border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-headline text-xl font-extrabold text-[var(--color-primary-dark)]">
                {isEditing ? "Editar anuncio" : "Nuevo anuncio"}
              </h3>
              <p className="mt-1 text-sm text-[var(--color-on-surface-variant)]">
                {isEditing
                  ? "Actualice el contenido, las fechas y la visibilidad del comunicado."
                  : "Configure el tipo, redacte el mensaje y programe su vigencia en el tablón."}
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

        <div className="max-h-[70vh] space-y-6 overflow-y-auto p-6">
          <AnnouncementCategoryPicker value={values.category} onValueChange={handleCategoryChange} />

          <AnnouncementVisibilityPicker
            value={values.is_public}
            onValueChange={(isPublic) => setValues((current) => ({ ...current, is_public: isPublic }))}
          />

          <FormField
            id="announcement-title"
            label="Título"
            icon="title"
            value={values.title}
            maxLength={200}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              id="announcement-published-date"
              label="Fecha de publicación"
              icon="calendar_today"
              type="date"
              value={values.published_date}
              onChange={(event) => handlePublishedDateChange(event.target.value)}
            />

            <FormField
              id="announcement-expires-date"
              label="Fecha de expiración"
              icon="event_busy"
              type="date"
              min={values.published_date}
              value={values.expires_date}
              onChange={(event) => setValues((current) => ({ ...current, expires_date: event.target.value }))}
            />
          </div>

          <p className="rounded-2xl bg-[var(--color-surface-container-low)] px-4 py-3 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
            El tipo seleccionado sugiere una vigencia de{" "}
            <span className="font-semibold text-[var(--color-on-surface)]">
              {ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS[values.category]} días
            </span>
            . Puede ajustar la fecha de expiración manualmente antes de publicar.
          </p>
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
