"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import { Complaint } from "@/types/models";
import { cn } from "@/utils/helpers/shadcn/index";

interface ToggleComplaintVisibilityModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

const VISIBILITY_OPTIONS = [
  {
    value: false,
    label: "Privada",
    description: "Solo el estudiante emisor y la administración pueden verla.",
    icon: "lock",
  },
  {
    value: true,
    label: "Pública",
    description: "Visible en el muro para todos los residentes (oculta datos personales).",
    icon: "public",
  },
] as const;

export function ToggleComplaintVisibilityModal({
  complaint,
  open,
  onClose,
}: ToggleComplaintVisibilityModalProps) {
  const { visibilityMutation } = useComplaintMutations();
  const currentVisibility = Boolean(complaint?.visibility ?? complaint?.is_public);
  const [selectedVisibility, setSelectedVisibility] = useState(currentVisibility);

  useEffect(() => {
    if (!open) {
      visibilityMutation.reset();
      return;
    }

    setSelectedVisibility(Boolean(complaint?.visibility ?? complaint?.is_public));
  }, [open, complaint?.id, complaint?.visibility, complaint?.is_public]);

  const hasChanges = complaint ? selectedVisibility !== currentVisibility : false;

  const handleSave = () => {
    if (!complaint || !hasChanges || visibilityMutation.isPending) {
      return;
    }

    visibilityMutation.mutate(
      { id: complaint.id, visibility: selectedVisibility },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Nivel de visibilidad"
      complaint={complaint}
      icon="shield_lock"
      iconWrapperClassName="bg-[var(--color-primary-selected)] text-[var(--color-primary-dark)]"
      maxWidthClassName="max-w-sm"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={visibilityMutation.isPending}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="confirm"
            onClick={handleSave}
            disabled={!hasChanges || visibilityMutation.isPending}
          >
            {visibilityMutation.isPending ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3">
        {VISIBILITY_OPTIONS.map((option) => {
          const active = selectedVisibility === option.value;

          return (
            <button
              key={option.label}
              type="button"
              onClick={() => setSelectedVisibility(option.value)}
              className={cn(
                "relative flex w-full cursor-pointer items-start gap-3 rounded-xl border p-4 text-left transition-all",
                active
                  ? "border-2 border-[var(--color-primary)] bg-[var(--color-primary-selected)]/40"
                  : "border-[var(--color-outline-variant)]/25 bg-[var(--color-surface-container-lowest)] hover:border-[var(--color-outline-variant)]/50"
              )}
            >
              {active ? (
                <span
                  className="material-symbols-outlined absolute right-4 top-4 text-xl text-[var(--color-primary)]"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              ) : null}
              <span
                className={cn(
                  "material-symbols-outlined shrink-0",
                  active ? "text-[var(--color-primary-dark)]" : "text-[var(--color-outline)]"
                )}
              >
                {option.icon}
              </span>
              <div className="min-w-0 pr-8">
                <p
                  className={cn(
                    "text-sm font-bold",
                    active ? "text-[var(--color-primary-dark)]" : "text-[var(--color-on-surface)]"
                  )}
                >
                  {option.label}
                </p>
                <p
                  className={cn(
                    "mt-0.5 line-clamp-3 text-[10px] leading-relaxed",
                    active ? "text-[var(--color-primary-dark)]/80" : "text-[var(--color-on-surface-variant)]"
                  )}
                >
                  {option.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ComplaintActionDialog>
  );
}
