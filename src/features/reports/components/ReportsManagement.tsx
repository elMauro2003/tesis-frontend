"use client";

import { DashboardPageHeader } from "@/components/shared/DashboardPageHeader";
import { DashboardSegmentedFilter } from "@/components/shared/DashboardSegmentedFilter";
import { ComplaintsStatusPanel } from "@/features/reports/components/ComplaintsStatusPanel";
import { ExportReportPreviewModal } from "@/features/reports/components/ExportReportPreviewModal";
import { OccupancyByBuildingChart } from "@/features/reports/components/OccupancyByBuildingChart";
import { ReportMetricCard } from "@/features/reports/components/ReportMetricCard";
import { ReportsDataView } from "@/features/reports/components/ReportsDataView";
import { ReportsGeneratorPanel } from "@/features/reports/components/ReportsGeneratorPanel";
import { ANALYSIS_VIEW_OPTIONS } from "@/features/reports/constants";
import { useReportsDashboard } from "@/features/reports/hooks/useReportsDashboard";

export function ReportsManagement() {
  const {
    draftFilters,
    setDraftFilters,
    analysisView,
    setAnalysisView,
    applyFilters,
    clearFilters,
    draftBuildingOptions,
    draftAnalytics,
    faculties,
    catalog,
    buildingOccupancy,
    complaintBreakdown,
    metrics,
    isLoading,
    isError,
    exportPreviewOpen,
    setExportPreviewOpen,
    openExportPreview,
    reportPreviewModel,
    reportExportName,
    reportExportParameters,
    resultsTotalItems,
    resultsTotalPages,
    resultsPage,
    setResultsPage,
    resultsPageSize,
    setResultsPageSize,
    studentReportRows,
    studentsLoading,
    studentsError,
    appliedFilters,
  } = useReportsDashboard();

  const urgentComplaints =
    metrics.pendingComplaintsCount > 0 || metrics.inProgressComplaintsCount > 0;

  const isDataView = analysisView === "data";

  return (
    <>
      <DashboardPageHeader
        title="Resumen de ocupación"
        description="Panel operativo con métricas en tiempo real de estudiantes, infraestructura y quejas. Los filtros refinan las vistas; la exportación muestra una vista previa antes de generar el PDF."
        searchValue=""
        onSearchChange={() => undefined}
        searchPlaceholder=""
        actionLabel="Exportar informe"
        actionIcon="file_download"
        onAction={openExportPreview}
        showSearch={false}
      />

      {isError ? (
        <div className="mb-8 rounded-xl border border-error/20 bg-error-container/30 px-4 py-3 text-sm text-error">
          No se pudieron cargar algunos datos. Verifique la conexión con la API e intente actualizar.
        </div>
      ) : null}

      <section className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <ReportMetricCard
          title="Estudiantes alojados"
          value={isLoading ? "…" : metrics.housedStudents}
          badge="Asignaciones activas"
          icon="group"
          filledIcon
        />
        <ReportMetricCard
          title="Capacidad disponible"
          value={isLoading ? "…" : metrics.availableSpots}
          suffix="plazas"
          badge="Cuartos activos"
          icon="bed"
          tone="success"
          filledIcon
        />
        <ReportMetricCard
          title="Quejas pendientes"
          value={isLoading ? "…" : metrics.pendingComplaints}
          badge={urgentComplaints ? "Revisar" : "Al día"}
          icon="warning"
          tone="warning"
          filledIcon
        />
        <ReportMetricCard
          title="Cuartos clausurados"
          value={isLoading ? "…" : metrics.closedRooms}
          badge="Inactivos"
          icon="block"
          tone="danger"
        />
      </section>

      <ReportsGeneratorPanel
        draftFilters={draftFilters}
        onChange={setDraftFilters}
        sites={catalog.sites}
        buildingOptions={draftBuildingOptions}
        faculties={faculties}
        careers={draftAnalytics.careers}
        careersLoading={draftAnalytics.careersLoading}
        draftAnalytics={draftAnalytics}
        resultsCount={resultsTotalItems}
        onApply={applyFilters}
        onClear={clearFilters}
        disabled={isLoading}
      />

      <section className="space-y-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h3 className="mb-2 font-headline text-2xl font-bold text-on-surface">
              {isDataView ? "Resultados del reporte" : "Análisis operativo"}
            </h3>
            <p className="text-sm text-outline">
              {isDataView
                ? "Listado detallado de estudiantes según los filtros aplicados."
                : "Distribución de ocupación por edificio y gestión de incidencias."}
            </p>
          </div>
          <DashboardSegmentedFilter
            value={analysisView}
            onValueChange={(value) => setAnalysisView(value as "charts" | "data")}
            options={ANALYSIS_VIEW_OPTIONS.map((option) => ({
              value: option.value,
              label: option.label,
            }))}
          />
        </div>

        {isDataView ? (
          <ReportsDataView
            rows={studentReportRows}
            totalItems={resultsTotalItems}
            page={resultsPage}
            pageSize={resultsPageSize}
            totalPages={resultsTotalPages}
            onPageChange={setResultsPage}
            onPageSizeChange={setResultsPageSize}
            isLoading={studentsLoading}
            isError={studentsError}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <OccupancyByBuildingChart rows={buildingOccupancy} isLoading={isLoading} />
            <ComplaintsStatusPanel breakdown={complaintBreakdown} isLoading={isLoading} />
          </div>
        )}
      </section>

      <ExportReportPreviewModal
        open={exportPreviewOpen}
        onClose={() => setExportPreviewOpen(false)}
        preview={reportPreviewModel}
        reportName={reportExportName}
        reportType={appliedFilters.reportType}
        reportParameters={reportExportParameters}
      />
    </>
  );
}
