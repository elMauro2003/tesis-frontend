export type ReportsHousingFilter = "all" | "with_room" | "without_room";

export type ReportsGenderFilter = "all" | "M" | "F";

export type ReportsMilitantFilter = "all" | "yes" | "no";

export type ReportsPerformanceFilter = "all" | "Excelente" | "Bien" | "Regular" | "Mal";

export type ReportsAnalysisView = "charts" | "data";

export type ReportsDraftFilters = {
  siteId: number | "all";
  buildingId: number | "all";
  facultyId: number | "all";
  careerId: number | "all";
  academicYear: number | "all";
  housing: ReportsHousingFilter;
  gender: ReportsGenderFilter;
  militant: ReportsMilitantFilter;
  performance: ReportsPerformanceFilter;
  reportType: string;
};

export const DEFAULT_REPORTS_FILTERS: ReportsDraftFilters = {
  siteId: "all",
  buildingId: "all",
  facultyId: "all",
  careerId: "all",
  academicYear: "all",
  housing: "all",
  gender: "all",
  militant: "all",
  performance: "all",
  reportType: "ocupacion",
};
