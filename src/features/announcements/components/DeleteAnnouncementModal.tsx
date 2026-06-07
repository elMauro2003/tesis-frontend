"use client";

import { useEffect, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { communicationService } from "@/core/services/communication.service";
import { FetchError } from "@/lib/fetchClient";
import { Information } from "@/types/models";
import { formatAnnouncementDate } from "@/features/announcements/utils/announcementPresentation";

interface DeleteAnnouncementModalProps {
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

export function DeleteAnnouncementModal({ announcement, open, onClose }: DeleteAnnouncementModalProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!announcement) {
        return;
      }

      await communicationService.deleteInformation(announcement.id);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["announcements"] });
      toast.success("Anuncio eliminado", {
        description: "El comunicado fue removido del tablón correctamente.",
      });
      onClose();
    },
    onError: (error) => {
      toast.error("No se pudo eliminar el anuncio", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  useEffect(() => {
    if (!open) {
      deleteMutation.reset();
    }
  }, [open]);

  const title = useMemo(() => announcement?.title ?? "Anuncio", [announcement?.title]);
  const expiresLabel = useMemo(
    () => (announcement?.expires_date ? formatAnnouncementDate(announcement.expires_date) : "Sin fecha"),
    [announcement?.expires_date]
  );

  return (
    <BottomSheet open={open && !!announcement} onClose={onClose} maxWidthClassName="max-w-md">
      <div className="overflow-hidden rounded-2xl bg-[var(--color-surface-container-lowest)] shadow-[var(--shadow-ambient)]">
        <div className="flex items-start gap-4 bg-red-50 p-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <span className="material-symbols-outlined text-2xl">warning</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-headline text-xl font-extrabold leading-tight text-red-900">Eliminar anuncio</h3>
            <p className="mt-1 text-xs leading-relaxed text-[var(--color-on-surface-variant)]">
              Esta acción retirará el comunicado del tablón de forma permanente.
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

        <div className="space-y-4 p-6">
          <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Anuncio</p>
            <p className="mt-2 text-base font-bold text-[var(--color-primary-dark)]">{title}</p>
            <p className="mt-2 text-sm text-[var(--color-on-surface-variant)]">Expira el {expiresLabel}</p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-outline-variant)]/15 bg-[var(--color-surface-container-low)]/40 p-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Eliminando..." : "Eliminar anuncio"}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
}
