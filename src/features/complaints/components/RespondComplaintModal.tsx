"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useComplaintMutations } from "@/features/complaints/hooks/useComplaintMutations";
import { getComplaintTitle } from "@/features/complaints/utils/complaintDashboard";
import { Complaint } from "@/types/models";

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
  const { respondMutation } = useComplaintMutations();

  useEffect(() => {
    if (!open) {
      setResponse(complaint?.response ?? "");
      respondMutation.reset();
      return;
    }

    setResponse(complaint?.response ?? "");
  }, [open, complaint?.id, complaint?.response]);

  const trimmed = response.trim();
  const isValid = trimmed.length >= MIN_RESPONSE_LENGTH && trimmed.length <= MAX_RESPONSE_LENGTH;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!complaint || !isValid || respondMutation.isPending) {
      return;
    }

    respondMutation.mutate(
      { id: complaint.id, response: trimmed },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <BottomSheet
      open={open && !!complaint}
      onClose={onClose}
      title="Responder queja"
      subtitle="La respuesta quedará registrada y visible para el estudiante."
      maxWidthClassName="max-w-lg"
      scrollable
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="cancel" onClick={onClose} disabled={respondMutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} variant="confirm" disabled={!isValid || respondMutation.isPending}>
            {respondMutation.isPending ? "Enviando..." : "Enviar respuesta"}
          </Button>
        </div>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="space-y-5 p-6">
        <div className="rounded-2xl bg-[var(--color-surface-container-low)] p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--color-outline)]">Queja</p>
          <p className="mt-2 text-sm font-semibold text-[var(--color-primary-dark)]">
            {complaint ? getComplaintTitle(complaint.description) : "—"}
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor={`${formId}-response`}
            className="ml-1 block text-[10px] font-bold uppercase tracking-widest text-[var(--color-on-surface-variant)]"
          >
            Respuesta oficial
          </label>
          <Textarea
            id={`${formId}-response`}
            value={response}
            onChange={(event) => setResponse(event.target.value)}
            placeholder="Escriba la respuesta o resolución para el estudiante..."
            rows={6}
            maxLength={MAX_RESPONSE_LENGTH}
            className="min-h-[9rem] resize-y rounded-2xl border-0 bg-[var(--color-surface-container-low)] px-4 py-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/20"
          />
          <p className="text-xs text-[var(--color-outline)]">
            Mínimo {MIN_RESPONSE_LENGTH} caracteres · {trimmed.length}/{MAX_RESPONSE_LENGTH}
          </p>
        </div>
      </form>
    </BottomSheet>
  );
}
