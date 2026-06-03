/** Tipos alineados con el backend (seed + tests de integración). */
export const REPORT_TYPE_OPTIONS = [
  { value: "ocupacion", label: "Ocupación e infraestructura" },
  { value: "students", label: "Estudiantes" },
  { value: "complaints", label: "Quejas" },
  { value: "assignments", label: "Asignaciones activas" },
  { value: "statistics", label: "Estadísticas generales" },
] as const;

export const ACADEMIC_YEAR_OPTIONS = [
  { value: "all", label: "Todos los años" },
  { value: "1", label: "1.er año" },
  { value: "2", label: "2.º año" },
  { value: "3", label: "3.er año" },
  { value: "4", label: "4.º año" },
  { value: "5", label: "5.º año" },
] as const;

export const HOUSING_FILTER_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "with_room", label: "Con cuarto asignado" },
  { value: "without_room", label: "Sin cuarto" },
] as const;

export const GENDER_FILTER_OPTIONS = [
  { value: "all", label: "Todos los sexos" },
  { value: "F", label: "Femenino" },
  { value: "M", label: "Masculino" },
] as const;

export const MILITANT_FILTER_OPTIONS = [
  { value: "all", label: "Militancia: todos" },
  { value: "yes", label: "Solo militantes" },
  { value: "no", label: "No militantes" },
] as const;

export const PERFORMANCE_FILTER_OPTIONS = [
  { value: "all", label: "Aprovechamiento: todos" },
  { value: "Excelente", label: "Excelente" },
  { value: "Bien", label: "Bien" },
  { value: "Regular", label: "Regular" },
  { value: "Mal", label: "Mal" },
] as const;

export const ANALYSIS_VIEW_OPTIONS = [
  { value: "charts", label: "Gráficos" },
  { value: "data", label: "Vista de datos puros" },
] as const;

export const COMPLAINTS_LOOKBACK_DAYS = 30;

export const REPORTS_RESULTS_PAGE_SIZE_OPTIONS = [10, 25, 50] as const;
export const DEFAULT_REPORTS_RESULTS_PAGE_SIZE = 10;
