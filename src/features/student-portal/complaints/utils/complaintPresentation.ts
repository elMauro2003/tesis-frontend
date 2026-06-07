import { Complaint } from "@/types/models";

export const DAILY_COMPLAINT_LIMIT = 3;

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

export function getComplaintBorderClass(status: Complaint["status"]) {
  if (status === "resuelta") return "border-l-green-700";
  if (status === "rechazada") return "border-l-error";
  return "border-l-primary";
}

export function getComplaintTitle(description: string) {
  const trimmed = description.trim();
  if (trimmed.length <= 72) {
    return trimmed;
  }

  return `${trimmed.slice(0, 72).trimEnd()}…`;
}

export function getBuildingLabel(complaint: Complaint) {
  return complaint.building_name?.trim() || "Residencia";
}

export function countTodayComplaints(complaints: Complaint[]) {
  const today = new Date().toISOString().split("T")[0];

  return complaints.filter((complaint) => {
    if (complaint.date === today) {
      return true;
    }

    const createdAt = (complaint as { created_at?: string }).created_at;
    return createdAt?.startsWith(today) ?? false;
  }).length;
}

export function canEditComplaint(status: Complaint["status"]) {
  return status === "pendiente" || status === "en_proceso";
}

export const COMPLAINT_TYPE_OPTIONS = [
  {
    value: "administrativa" as const,
    label: "Administrativa",
    description: "Infraestructura, servicios, convivencia o mantenimiento.",
    icon: "apartment",
  },
  {
    value: "educativa" as const,
    label: "Educativa",
    description: "Actividades académicas, horarios o procesos formativos.",
    icon: "school",
  },
];

export function getPublicComplaintsStats(complaints: import("@/types/models").Complaint[]) {
  const total = complaints.length;
  const resolved = complaints.filter((item) => item.status === "resuelta").length;
  const inProcess = complaints.filter(
    (item) => item.status === "pendiente" || item.status === "en_proceso"
  ).length;
  const successRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

  return { total, resolved, inProcess, successRate };
}

export function getPublicStatusBadgeClass(status: Complaint["status"]) {
  if (status === "resuelta") {
    return "bg-primary/5 text-primary";
  }

  if (status === "en_proceso" || status === "pendiente") {
    return "bg-tertiary-fixed text-tertiary";
  }

  if (status === "rechazada") {
    return "bg-error-container text-error";
  }

  return "bg-secondary-container text-secondary";
}

export function formatComplaintDateShort(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}
