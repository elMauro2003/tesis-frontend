"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { ComplaintActionDialog } from "@/features/complaints/components/ComplaintActionDialog";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import {
  formatComplaintDate,
  getComplaintSenderSubtitle,
  getComplaintTitle,
  getComplaintTypeLabel,
} from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";
import { toast } from "sonner";

const MIN_RESPONSE_LENGTH = 10;
const MAX_RESPONSE_LENGTH = 2000;

interface RespondComplaintModalProps {
  complaint: Complaint | null;
  open: boolean;
  onClose: () => void;
}

export function RespondComplaintModal({ complaint, open, onClose }: RespondComplaintModalProps) {
  const formId = useId();
  const [response, setResponse] = useState("");
  const [markResolved, setMarkResolved] = useState(true);
  const { respondMutation, statusMutation } = useComplaintMutations();

  useEffect(() => {
    if (!open) {
      setResponse(complaint?.response ?? "");
      setMarkResolved(true);
      respondMutation.reset();
      statusMutation.reset();
      return;
    }

    setResponse(complaint?.response ?? "");
    setMarkResolved(complaint?.status !== "resuelta");
  }, [open, complaint?.id, complaint?.response, complaint?.status]);

  const trimmed = response.trim();
  const isValid = trimmed.length >= MIN_RESPONSE_LENGTH && trimmed.length <= MAX_RESPONSE_LENGTH;
  const isPending = respondMutation.isPending || statusMutation.isPending;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint || !isValid || isPending) {
      return;
    }

    respondMutation.mutate(
      { id: complaint.id, response: trimmed },
      {
        onSuccess: () => {
          if (markResolved && complaint.status !== "resuelta") {
            statusMutation.mutate(
              { id: complaint.id, status: "resuelta" },
              {
                onSuccess: () => onClose(),
              }
            );
            return;
          }

          onClose();
        },
        onError: () => {
          toast.error("No se pudo enviar la respuesta");
        },
      }
    );
  };

  return (
    <ComplaintActionDialog
      open={open}
      onClose={onClose}
      title="Emitir respuesta oficial"
      complaint={complaint}
      icon="reply"
      iconWrapperClassName="bg-[var(--color-primary-selected)] text-[var(--color-primary-dark)]"
      maxWidthClassName="max-w-2xl"
      headerLayout="inline"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="confirm" disabled={!isValid || isPending}>
            <span className="material-symbols-outlined text-sm">send</span>
            {isPending ? "Enviando..." : "Enviar respuesta"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-6">
        {complaint ? (
          <div className="rounded-xl border border-[var(--color-outline-variant)]/20 bg-[var(--color-surface-container-low)] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[var(--color-on-surface)]">
                  {getComplaintSenderSubtitle(complaint)}
                </p>
                <span className="mt-1 inline-flex max-w-full items-center rounded bg-[var(--color-primary-selected)] px-2 py-0.5 text-[10px] font-bold uppercase text-[var(--color-primary-dark)]">
                  {getComplaintTypeLabel(complaint)}
                </span>
              </div>
              <span className="shrink-0 text-[11px] font-medium text-[var(--color-outline)]">
                {formatComplaintDate(complaint.date)}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 break-words text-sm font-bold text-[var(--color-on-surface)]">
              Asunto: {getComplaintTitle(complaint.description)}
            </p>
            <p className="mt-2 line-clamp-4 break-words text-sm italic leading-relaxed text-[var(--color-on-surface-variant)]">
              &ldquo;{complaint.description}&rdquo;
            </p>
          </div>
        ) : null}

        <div className="space-y-3">
          <label
            htmlFor={`${formId}-response`}
            className="block text-xs font-bold uppercase tracking-widest text-[var(--color-primary-dark)]"
          >
            Redactar resolución oficial
          </label>
          <Textarea
            id={`${formId}-response`}
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Escriba la respuesta institucional que será enviada al estudiante..."
            rows={5}
            maxLength={MAX_RESPONSE_LENGTH}
            className="min-h-[8rem] resize-y rounded-xl border border-[var(--color-outline-variant)]/25 bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
          />
          <p className="text-xs text-[var(--color-outline)]">
            Mínimo {MIN_RESPONSE_LENGTH} caracteres · {trimmed.length}/{MAX_RESPONSE_LENGTH}
          </p>

          <label className="flex cursor-pointer items-start gap-3">
            <Checkbox
              checked={markResolved}
              onCheckedChange={(checked) => setMarkResolved(checked === true)}
              className="mt-0.5"
            />
            <span className="text-sm font-medium leading-snug text-[var(--color-on-surface-variant)]">
              Marcar automáticamente el estado de esta queja como &ldquo;Solucionada&rdquo; al enviar la respuesta
            </span>
          </label>
        </div>
      </form>
    </ComplaintActionDialog>
  );
}
