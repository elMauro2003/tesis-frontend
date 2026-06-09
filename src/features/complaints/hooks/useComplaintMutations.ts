"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { complaintService } from "@/core/services/complaint.service";
import { FetchError } from "@/lib/fetchClient";
import { Complaint } from "@/types/models";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof FetchError) {
    return error.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

export function useComplaintMutations() {
  const queryClient = useQueryClient();

  const invalidateComplaints = async () => {
    await queryClient.invalidateQueries({ queryKey: ["complaints"] });
  };

  const respondMutation = useMutation({
    mutationFn: async ({ id, response }: { id: number; response: string }) => {
      return complaintService.respondToComplaint(id, response);
    },
    onSuccess: async () => {
      await invalidateComplaints();
      toast.success("Respuesta enviada", {
        description: "La queja fue respondida correctamente.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo enviar la respuesta", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: Complaint["status"] }) => {
      return complaintService.updateComplaintStatus(id, status);
    },
    onSuccess: async () => {
      await invalidateComplaints();
      toast.success("Estado actualizado", {
        description: "El estado de la queja fue modificado.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo actualizar el estado", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  const visibilityMutation = useMutation({
    mutationFn: async ({ id, visibility }: { id: number; visibility: boolean }) => {
      return complaintService.updateComplaintVisibility(id, visibility);
    },
    onSuccess: async (_data, variables) => {
      await invalidateComplaints();
      toast.success(variables.visibility ? "Queja pública" : "Queja privada", {
        description: variables.visibility
          ? "La queja ahora es visible para la comunidad estudiantil."
          : "La queja quedó restringida a la administración.",
      });
    },
    onError: (error) => {
      toast.error("No se pudo cambiar la visibilidad", {
        description: getErrorMessage(error, "Intente nuevamente en unos segundos."),
      });
    },
  });

  return {
    respondMutation,
    statusMutation,
    visibilityMutation,
    invalidateComplaints,
  };
}
