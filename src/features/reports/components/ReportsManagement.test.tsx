import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { ReportsManagement } from "@/features/reports/components/ReportsManagement";
import { renderWithProviders } from "@/test/test-utils";

vi.mock("@/features/reports/hooks/useReportsDashboard", () => ({
  useReportsDashboard: () => ({
    draftFilters: { siteId: "all", buildingId: "all", facultyId: "all", lookbackDays: 30 },
    setDraftFilters: vi.fn(),
    analysisView: "charts",
    setAnalysisView: vi.fn(),
    applyFilters: vi.fn(),
    clearFilters: vi.fn(),
    draftBuildingOptions: [],
    draftAnalytics: {
      students: [],
      insights: [],
      studentRows: [],
      totalStudents: 0,
      selectedBuilding: null,
      isLoading: false,
      isError: false,
      careers: [],
      careersLoading: false,
      refetchStudents: vi.fn(),
    },
    faculties: [],
    catalog: { sites: [], buildings: [], wings: [] },
    buildingOccupancy: [],
    complaintBreakdown: [],
    metrics: {
      housedStudents: 120,
      availableSpots: 45,
      pendingComplaints: 3,
      closedRooms: 2,
    },
    isLoading: false,
    isError: false,
    exportPreviewOpen: false,
    setExportPreviewOpen: vi.fn(),
    openExportPreview: vi.fn(),
    reportPreviewModel: null,
    reportExportName: "reporte",
    reportExportParameters: {},
    resultsTotalItems: 0,
    resultsTotalPages: 1,
    resultsPage: 1,
    setResultsPage: vi.fn(),
    resultsPageSize: 10,
    setResultsPageSize: vi.fn(),
    studentReportRows: [],
    studentsLoading: false,
    studentsError: false,
    appliedFilters: { siteId: "all", buildingId: "all", facultyId: "all", lookbackDays: 30 },
  }),
}));

describe("ReportsManagement", () => {
  it("muestra métricas y permite exportar informe", () => {
    renderWithProviders(<ReportsManagement />);

    expect(screen.getByRole("heading", { name: /resumen de ocupación/i })).toBeInTheDocument();
    expect(screen.getByText("120")).toBeInTheDocument();
    expect(screen.getByText("45")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /exportar informe/i })).toBeInTheDocument();
  });
});
