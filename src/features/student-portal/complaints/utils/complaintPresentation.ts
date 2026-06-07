import { Complaint } from "@/types/models";

export const COMPLAINT_STATUS_LABELS: Record<Complaint["status"], string> = {
  pendiente: "Pendiente",
  en_proceso: "En proceso",
  resuelta: "Resuelta",
  rechazada: "Rechazada",
};

export const COMPLAINT_TYPE_LABELS: Record<string, string> = {
  administrativa: "Administrativa",
  educativa: "Educativa",
};

export function formatComplaintDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function getComplaintStatusTone(status: Complaint["status"]) {
  if (status === "resuelta") return "success" as const;
  if (status === "pendiente") return "warning" as const;
  if (status === "rechazada") return "error" as const;
  return "primary" as const;
}
