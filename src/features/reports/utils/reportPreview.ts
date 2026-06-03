import { REPORT_TYPE_OPTIONS } from "@/features/reports/constants";
import type { ReportsDraftFilters } from "@/features/reports/types";
import type { ReportInsight } from "@/features/reports/utils/reportAnalytics";
import type { BuildingOccupancyRow, ComplaintStatusBreakdown } from "@/features/reports/utils/metrics";
import type { ReportStudentRow } from "@/features/reports/utils/studentRows";
import { Faculty, Site } from "@/types/models";

export type ReportPreviewModel = {
  title: string;
  typeLabel: string;
  generatedAtLabel: string;
  filterSummary: string[];
  metrics: Array<{ label: string; value: string }>;
  insights: ReportInsight[];
  buildingRows: BuildingOccupancyRow[];
  complaintBreakdown: ComplaintStatusBreakdown;
  studentRows: ReportStudentRow[];
  totalStudents: number;
};

const housingLabels: Record<ReportsDraftFilters["housing"], string> = {
  all: "Todos",
  with_room: "Con cuarto",
  without_room: "Sin cuarto",
};

const genderLabels: Record<ReportsDraftFilters["gender"], string> = {
  all: "Todos",
  F: "Femenino",
  M: "Masculino",
};

export const buildReportPreviewModel = (input: {
  filters: ReportsDraftFilters;
  sites: Site[];
  faculties: Faculty[];
  buildingsById: Map<number, { name: string; gender?: string | null }>;
  metrics: {
    housedStudents: string;
    availableSpots: string;
    pendingComplaints: string;
    closedRooms: string;
    occupancyAverage: number;
    registeredStudents: string;
  };
  buildingRows: BuildingOccupancyRow[];
  complaintBreakdown: ComplaintStatusBreakdown;
  studentRows: ReportStudentRow[];
  totalStudents: number;
  insights: ReportInsight[];
}): ReportPreviewModel => {
  const typeLabel =
    REPORT_TYPE_OPTIONS.find((option) => option.value === input.filters.reportType)?.label ??
    input.filters.reportType;

  const siteLabel =
    input.filters.siteId === "all"
      ? "Todas las sedes"
      : (input.sites.find((site) => site.id === input.filters.siteId)?.name ?? "Sede");

  const building =
    input.filters.buildingId === "all" ? null : input.buildingsById.get(input.filters.buildingId);

  const buildingLabel =
    input.filters.buildingId === "all"
      ? "Todos los edificios"
      : `${building?.name ?? "Edificio"}${building?.gender ? ` (${building.gender})` : ""}`;

  const facultyLabel =
    input.filters.facultyId === "all"
      ? "Todas las facultades"
      : (input.faculties.find((faculty) => faculty.id === input.filters.facultyId)?.name ?? "Facultad");

  const yearLabel =
    input.filters.academicYear === "all" ? "Todos los años" : `${input.filters.academicYear}.º año`;

  const performanceLabel =
    input.filters.performance === "all" ? "Todos" : input.filters.performance;

  const militantLabel =
    input.filters.militant === "all"
      ? "Todos"
      : input.filters.militant === "yes"
        ? "Solo militantes"
        : "No militantes";

  return {
    title: `Informe de ${typeLabel}`,
    typeLabel,
    generatedAtLabel: new Date().toLocaleString("es-ES", {
      dateStyle: "long",
      timeStyle: "short",
    }),
    filterSummary: [
      `Sede: ${siteLabel}`,
      `Edificio: ${buildingLabel}`,
      `Facultad: ${facultyLabel}`,
      `Año académico: ${yearLabel}`,
      `Sexo: ${genderLabels[input.filters.gender]}`,
      `Alojamiento: ${housingLabels[input.filters.housing]}`,
      `Militancia: ${militantLabel}`,
      `Aprovechamiento: ${performanceLabel}`,
    ],
    metrics: [
      { label: "Estudiantes alojados", value: input.metrics.housedStudents },
      { label: "Plazas disponibles", value: input.metrics.availableSpots },
      { label: "Quejas pendientes", value: input.metrics.pendingComplaints },
      { label: "Cuartos clausurados", value: input.metrics.closedRooms },
      { label: "Estudiantes en alcance", value: input.metrics.registeredStudents },
      { label: "Ocupación media", value: `${input.metrics.occupancyAverage}%` },
    ],
    insights: input.insights,
    buildingRows: input.buildingRows,
    complaintBreakdown: input.complaintBreakdown,
    studentRows: input.studentRows,
    totalStudents: input.totalStudents,
  };
};
