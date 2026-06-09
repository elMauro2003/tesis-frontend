import { Complaint } from "@/types/models";
import {
  COMPLAINT_STATUS_LABELS,
  COMPLAINT_TYPE_LABELS,
  formatComplaintDate,
  getComplaintTitle,
  normalizeComplaintText,
} from "@/features/student-portal/complaints/utils/complaintPresentation";

export type ComplaintStatusSegment = "all" | "pendiente" | "en_proceso" | "cerradas";

export const COMPLAINT_STATUS_SEGMENT_OPTIONS = [
  { value: "all", label: "Todas" },
  { value: "pendiente", label: "Pendientes" },
  { value: "en_proceso", label: "En proceso" },
  { value: "cerradas", label: "Cerradas" },
] as const satisfies ReadonlyArray<{ value: ComplaintStatusSegment; label: string }>;

export const COMPLAINT_TYPE_FILTER_OPTIONS = [
  { value: "all", label: "Categoría: Todas" },
  { value: "administrativa", label: "Categoría: Administrativa" },
  { value: "educativa", label: "Categoría: Educativa" },
];

export const COMPLAINT_STATUS_UPDATE_OPTIONS = [
  { value: "pendiente", label: "Pendiente" },
  { value: "en_proceso", label: "En proceso" },
  { value: "resuelta", label: "Resuelta" },
  { value: "rechazada", label: "Rechazada" },
] as const;

export const COMPLAINT_STATUS_CARD_OPTIONS = [
  {
    value: "pendiente" as const,
    label: "Aceptada",
    description: "La queja es válida y ha sido admitida.",
    icon: "assignment_turned_in",
    hoverIconClass: "group-hover:text-teal-600",
  },
  {
    value: "en_proceso" as const,
    label: "En proceso",
    description: "El personal técnico está trabajando en la incidencia.",
    icon: "sync",
    hoverIconClass: "group-hover:text-[var(--color-primary)]",
  },
  {
    value: "resuelta" as const,
    label: "Solucionada",
    description: "La incidencia ha sido resuelta satisfactoriamente.",
    icon: "task_alt",
    hoverIconClass: "group-hover:text-[var(--color-success)]",
  },
  {
    value: "rechazada" as const,
    label: "Rechazada",
    description: "La queja no procede, está duplicada o es inválida.",
    icon: "cancel",
    hoverIconClass: "group-hover:text-[var(--color-error)]",
  },
];

export function formatComplaintDateCompact(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("es-ES", {
    day: "numeric",
    month: "short",
  }).format(parsed);
}

export function isClosedComplaintStatus(status: Complaint["status"]) {
  return status === "resuelta" || status === "rechazada";
}

export function getComplaintSenderName(complaint: Complaint) {
  if (complaint.student_name?.trim()) {
    return complaint.student_name.trim();
  }

  if (typeof complaint.student === "object" && complaint.student?.full_name?.trim()) {
    return complaint.student.full_name.trim();
  }

  return "Estudiante";
}

export function getComplaintSenderSubtitle(complaint: Complaint) {
  const name = getComplaintSenderName(complaint);
  const location = complaint.building_name?.trim() || "Sin ubicación registrada";
  return `${name} • ${location}`;
}

export function getComplaintTypeLabel(complaint: Complaint) {
  return complaint.type_display ?? COMPLAINT_TYPE_LABELS[complaint.type] ?? complaint.type;
}

export function getComplaintStatusLabel(complaint: Complaint) {
  return complaint.status_display ?? COMPLAINT_STATUS_LABELS[complaint.status] ?? complaint.status;
}

export function getDashboardStatusBadgeClass(status: Complaint["status"]) {
  if (status === "pendiente") {
    return "bg-orange-100 text-orange-700";
  }

  if (status === "en_proceso") {
    return "bg-[var(--color-primary-selected)] text-[var(--color-primary-dark)]";
  }

  if (status === "resuelta") {
    return "bg-[var(--color-success)]/10 text-[var(--color-success)]";
  }

  if (status === "rechazada") {
    return "bg-[var(--color-error-container)] text-[var(--color-error)]";
  }

  return "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)]";
}

export function matchesManagerComplaintSearch(complaint: Complaint, rawQuery: string) {
  const query = normalizeComplaintText(rawQuery);
  if (!query) {
    return true;
  }

  const haystack = normalizeComplaintText(
    [
      String(complaint.id),
      complaint.description,
      getComplaintSenderName(complaint),
      complaint.building_name ?? "",
      getComplaintTypeLabel(complaint),
      getComplaintStatusLabel(complaint),
    ].join(" ")
  );

  const terms = query.split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

export function filterComplaintsBySegment(complaints: Complaint[], segment: ComplaintStatusSegment) {
  if (segment === "all") {
    return complaints;
  }

  if (segment === "cerradas") {
    return complaints.filter((complaint) => isClosedComplaintStatus(complaint.status));
  }

  return complaints.filter((complaint) => complaint.status === segment);
}

export { formatComplaintDate, getComplaintTitle, COMPLAINT_STATUS_LABELS, COMPLAINT_TYPE_LABELS };
