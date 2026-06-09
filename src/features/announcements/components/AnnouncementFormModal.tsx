"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/shared/FormField";
import { FormFieldError } from "@/components/shared/FormFieldError";
import { Textarea } from "@/components/ui/textarea";
import { AnnouncementCategoryPicker } from "@/features/announcements/components/AnnouncementCategoryPicker";
import { AnnouncementVisibilityPicker } from "@/features/announcements/components/AnnouncementVisibilityPicker";
import { ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS } from "@/features/announcements/constants";
import { communicationService } from "@/core/services/communication.service";
import { FetchError } from "@/lib/fetchClient";
import { Information } from "@/types/models";
import {
  AnnouncementFormValues,
  AnnouncementFormField,
  buildInformationPayload,
  createEmptyAnnouncementFormValues,
  getAnnouncementFormFieldErrors,
  getExpiryDateForCategory,
  isAnnouncementFormValid,
  normalizeAnnouncementFormValues,
} from "@/features/announcements/utils/announcementForm";
import { clearFieldError, FieldErrors } from "@/utils/helpers/formFieldErrors";

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<AnnouncementFormField> | null>(null);

  const isEditing = Boolean(announcement);

  useEffect(() => {
    if (open) {
      setValues(normalizeAnnouncementFormValues(announcement));
      setFieldErrors(null);
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
    if (isSubmitting) {
      return;
    }

    const errors = getAnnouncementFormFieldErrors(values);
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

          <div>
            <FormField
              id="announcement-title"
              label="Título"
              icon="title"
              value={values.title}
              maxLength={200}
              aria-invalid={Boolean(fieldErrors?.title)}
              onChange={(event) => {
                const title = event.target.value;
                setValues((current) => ({ ...current, title }));
                setFieldErrors((current) => clearFieldError(current, "title"));
              }}
              placeholder="Ej. Cierre temporal del comedor"
            />
            <FormFieldError message={fieldErrors?.title} />
          </div>

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
              aria-invalid={Boolean(fieldErrors?.content)}
              onChange={(event) => {
                const content = event.target.value;
                setValues((current) => ({ ...current, content }));
                setFieldErrors((current) => clearFieldError(current, "content"));
              }}
              placeholder="Escriba el cuerpo del anuncio..."
              className="min-h-40 rounded-2xl border-0 bg-[var(--color-surface-container-low)] px-4 py-4 text-sm font-medium text-[var(--color-on-surface)] shadow-none focus-visible:bg-[var(--color-surface-container-high)] focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
            />
            <FormFieldError message={fieldErrors?.content} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <FormField
                id="announcement-published-date"
                label="Fecha de publicación"
                icon="calendar_today"
                type="date"
                value={values.published_date}
                aria-invalid={Boolean(fieldErrors?.published_date)}
                onChange={(event) => {
                  handlePublishedDateChange(event.target.value);
                  setFieldErrors((current) => clearFieldError(current, "published_date"));
                }}
              />
              <FormFieldError message={fieldErrors?.published_date} />
            </div>

            <div>
              <FormField
                id="announcement-expires-date"
                label="Fecha de expiración"
                icon="event_busy"
                type="date"
                min={values.published_date}
                value={values.expires_date}
                aria-invalid={Boolean(fieldErrors?.expires_date)}
                onChange={(event) => {
                  setValues((current) => ({ ...current, expires_date: event.target.value }));
                  setFieldErrors((current) => clearFieldError(current, "expires_date"));
                }}
              />
              <FormFieldError message={fieldErrors?.expires_date} />
            </div>
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
