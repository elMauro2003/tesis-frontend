"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicService } from "@/core/services/academic.service";
import { accommodationService } from "@/core/services/accommodation.service";
import { complaintService } from "@/core/services/complaint.service";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { useRoomsCatalog } from "@/features/rooms/hooks/useRoomsCatalog";
import { DEFAULT_REPORTS_RESULTS_PAGE_SIZE } from "@/features/reports/constants";
import { useReportAnalytics } from "@/features/reports/hooks/useReportAnalytics";
import { DEFAULT_REPORTS_FILTERS, type ReportsDraftFilters } from "@/features/reports/types";
import { paginateItems } from "@/features/reports/utils/studentRows";
import {
  buildReportParameters,
  computeAvailableSpots,
  computeBuildingOccupancy,
  computeClosedRoomsCount,
  computeComplaintStatusBreakdown,
  countActiveAssignmentsInRooms,
  filterComplaintsByBuilding,
  filterComplaintsByLookback,
  filterRoomsBySiteAndBuilding,
} from "@/features/reports/utils/metrics";
import { buildReportPreviewModel, type ReportPreviewModel } from "@/features/reports/utils/reportPreview";

const formatCount = (value: number) => new Intl.NumberFormat("es-ES").format(value);

export function useReportsDashboard() {
  const catalog = useRoomsCatalog();

  const [draftFilters, setDraftFilters] = useState<ReportsDraftFilters>(DEFAULT_REPORTS_FILTERS);
  const [debouncedDraftFilters, setDebouncedDraftFilters] = useState<ReportsDraftFilters>(DEFAULT_REPORTS_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<ReportsDraftFilters>(DEFAULT_REPORTS_FILTERS);
  const [analysisView, setAnalysisView] = useState<"charts" | "data">("charts");
  const [resultsPage, setResultsPage] = useState(1);
  const [resultsPageSize, setResultsPageSize] = useState(DEFAULT_REPORTS_RESULTS_PAGE_SIZE);
  const [exportPreviewOpen, setExportPreviewOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedDraftFilters(draftFilters), 450);
    return () => window.clearTimeout(timer);
  }, [draftFilters]);

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => academicService.getFaculties(),
    staleTime: 5 * 60 * 1000,
  });

  const allRoomsQuery = useQuery({
    queryKey: ["rooms-all"],
    queryFn: () => infrastructureService.getAllRooms(),
    staleTime: 60 * 1000,
  });

  const complaintsQuery = useQuery({
    queryKey: ["complaints-all"],
    queryFn: () => complaintService.getAllComplaints(),
    staleTime: 60 * 1000,
  });

  const activeAssignmentsQuery = useQuery({
    queryKey: ["active-assignments"],
    queryFn: () => accommodationService.getAllActiveAssignments(),
    staleTime: 60 * 1000,
  });

  const pendingComplaintsQuery = useQuery({
    queryKey: ["complaints-pending-count", appliedFilters.buildingId],
    queryFn: () =>
      complaintService.getComplaints({
        status: "pendiente",
        building: appliedFilters.buildingId !== "all" ? appliedFilters.buildingId : undefined,
        page: 1,
        page_size: 1,
      }),
    staleTime: 60 * 1000,
  });

  const inProgressComplaintsQuery = useQuery({
    queryKey: ["complaints-in-progress-count", appliedFilters.buildingId],
    queryFn: () =>
      complaintService.getComplaints({
        status: "en_proceso",
        building: appliedFilters.buildingId !== "all" ? appliedFilters.buildingId : undefined,
        page: 1,
        page_size: 1,
      }),
    staleTime: 60 * 1000,
  });

  const appliedAnalytics = useReportAnalytics(appliedFilters, true);
  const draftAnalytics = useReportAnalytics(debouncedDraftFilters, true);

  const faculties = facultiesQuery.data?.results ?? [];
  const rooms = allRoomsQuery.data?.results ?? [];
  const complaints = complaintsQuery.data?.results ?? [];

  const scopedRooms = useMemo(
    () =>
      filterRoomsBySiteAndBuilding(
        rooms,
        catalog.wingsById,
        catalog.buildingsById,
        appliedFilters.siteId,
        appliedFilters.buildingId
      ),
    [rooms, catalog.wingsById, catalog.buildingsById, appliedFilters.siteId, appliedFilters.buildingId]
  );

  const scopedRoomIds = useMemo(() => new Set(scopedRooms.map((room) => room.id)), [scopedRooms]);

  const buildingOccupancy = useMemo(
    () =>
      computeBuildingOccupancy(
        rooms,
        catalog.wingsById,
        catalog.buildingsById,
        catalog.sitesById,
        appliedFilters.siteId,
        appliedFilters.buildingId
      ),
    [rooms, catalog, appliedFilters.siteId, appliedFilters.buildingId]
  );

  const complaintsInPeriod = useMemo(() => {
    const inPeriod = filterComplaintsByLookback(complaints);
    return filterComplaintsByBuilding(inPeriod, appliedFilters.buildingId);
  }, [complaints, appliedFilters.buildingId]);

  const complaintBreakdown = useMemo(
    () => computeComplaintStatusBreakdown(complaintsInPeriod),
    [complaintsInPeriod]
  );

  const housedStudentsCount = useMemo(() => {
    const assignments = activeAssignmentsQuery.data?.results ?? [];
    return countActiveAssignmentsInRooms(assignments, scopedRoomIds);
  }, [activeAssignmentsQuery.data?.results, scopedRoomIds]);

  const registeredStudentsCount = appliedAnalytics.totalStudents;
  const availableSpots = computeAvailableSpots(scopedRooms);
  const closedRooms = computeClosedRoomsCount(scopedRooms);
  const pendingComplaints = pendingComplaintsQuery.data?.count ?? 0;
  const inProgressComplaints = inProgressComplaintsQuery.data?.count ?? 0;

  const paginatedStudents = useMemo(
    () => paginateItems(appliedAnalytics.students, resultsPage, resultsPageSize),
    [appliedAnalytics.students, resultsPage, resultsPageSize]
  );

  const studentReportRows = useMemo(() => {
    const start = (paginatedStudents.page - 1) * resultsPageSize;
    return appliedAnalytics.studentRows.slice(start, start + resultsPageSize);
  }, [paginatedStudents.page, resultsPageSize, appliedAnalytics.studentRows]);

  const resultsTotalItems = appliedAnalytics.totalStudents;
  const resultsTotalPages = paginatedStudents.totalPages;

  const occupancyAverage =
    buildingOccupancy.length > 0
      ? Math.round(buildingOccupancy.reduce((sum, row) => sum + row.percent, 0) / buildingOccupancy.length)
      : 0;

  const reportExportName = useMemo(() => {
    const labels: Record<string, string> = {
      ocupacion: "Ocupación",
      students: "Estudiantes",
      complaints: "Quejas",
      assignments: "Asignaciones",
      statistics: "Estadísticas",
    };
    const label = labels[appliedFilters.reportType] ?? "Informe";
    return `${label} — ${new Date().toLocaleDateString("es-ES")}`;
  }, [appliedFilters.reportType]);

  const reportPreviewModel: ReportPreviewModel | null = useMemo(() => {
    if (!exportPreviewOpen) return null;

    return buildReportPreviewModel({
      filters: appliedFilters,
      sites: catalog.sites,
      faculties,
      buildingsById: catalog.buildingsById,
      metrics: {
        housedStudents: formatCount(housedStudentsCount),
        availableSpots: formatCount(availableSpots),
        pendingComplaints: formatCount(pendingComplaints),
        closedRooms: formatCount(closedRooms),
        occupancyAverage,
        registeredStudents: formatCount(registeredStudentsCount),
      },
      buildingRows: buildingOccupancy,
      complaintBreakdown,
      studentRows: appliedAnalytics.studentRows.slice(0, 15),
      totalStudents: resultsTotalItems,
      insights: appliedAnalytics.insights,
    });
  }, [
    exportPreviewOpen,
    appliedFilters,
    catalog.sites,
    catalog.buildingsById,
    faculties,
    housedStudentsCount,
    availableSpots,
    pendingComplaints,
    closedRooms,
    registeredStudentsCount,
    buildingOccupancy,
    complaintBreakdown,
    appliedAnalytics.studentRows,
    appliedAnalytics.insights,
    resultsTotalItems,
    occupancyAverage,
  ]);

  const getBuildingOptions = (siteId: number | "all") => {
    const siteBuildings =
      siteId === "all" ? catalog.buildings : (catalog.buildingsBySite.get(siteId) ?? []);

    return [
      { value: "all", label: "Todos los edificios" },
      ...siteBuildings.map((building) => ({
        value: String(building.id),
        label: building.gender ? `${building.name} (${building.gender})` : building.name,
      })),
    ];
  };

  const draftBuildingOptions = useMemo(
    () => getBuildingOptions(draftFilters.siteId),
    [catalog.buildings, catalog.buildingsBySite, draftFilters.siteId]
  );

  const applyFilters = () => {
    setAppliedFilters({ ...draftFilters });
    setResultsPage(1);
  };

  const clearFilters = () => {
    setDraftFilters(DEFAULT_REPORTS_FILTERS);
    setAppliedFilters(DEFAULT_REPORTS_FILTERS);
    setDebouncedDraftFilters(DEFAULT_REPORTS_FILTERS);
    setResultsPage(1);
  };

  useEffect(() => {
    setResultsPage(1);
  }, [resultsPageSize, appliedFilters]);

  useEffect(() => {
    if (resultsPage > resultsTotalPages) {
      setResultsPage(resultsTotalPages);
    }
  }, [resultsPage, resultsTotalPages]);

  const isLoading =
    catalog.isLoading ||
    allRoomsQuery.isLoading ||
    complaintsQuery.isLoading ||
    appliedAnalytics.isLoading ||
    activeAssignmentsQuery.isLoading;

  const isError =
    catalog.isError ||
    allRoomsQuery.isError ||
    complaintsQuery.isError ||
    appliedAnalytics.isError;

  const refetchAll = () => {
    catalog.refetch();
    allRoomsQuery.refetch();
    complaintsQuery.refetch();
    appliedAnalytics.refetchStudents();
    activeAssignmentsQuery.refetch();
    pendingComplaintsQuery.refetch();
    inProgressComplaintsQuery.refetch();
  };

  return {
    draftFilters,
    setDraftFilters,
    appliedFilters,
    analysisView,
    setAnalysisView,
    applyFilters,
    clearFilters,
    draftBuildingOptions,
    draftAnalytics,
    appliedAnalytics,
    faculties,
    catalog,
    buildingOccupancy,
    complaintBreakdown,
    exportPreviewOpen,
    setExportPreviewOpen,
    openExportPreview: () => setExportPreviewOpen(true),
    reportPreviewModel,
    reportExportName,
    reportExportParameters: buildReportParameters(appliedFilters),
    metrics: {
      housedStudentsCount,
      registeredStudentsCount,
      pendingComplaintsCount: pendingComplaints,
      inProgressComplaintsCount: inProgressComplaints,
      closedRoomsCount: closedRooms,
      housedStudents: formatCount(housedStudentsCount),
      registeredStudents: formatCount(registeredStudentsCount),
      availableSpots: formatCount(availableSpots),
      pendingComplaints: formatCount(pendingComplaints),
      closedRooms: formatCount(closedRooms),
      occupancyAverage,
    },
    isLoading,
    isError,
    refetchAll,
    resultsTotalItems,
    resultsTotalPages,
    resultsPage,
    setResultsPage,
    resultsPageSize,
    setResultsPageSize,
    studentReportRows,
    studentsLoading: appliedAnalytics.isLoading,
    studentsError: appliedAnalytics.isError,
  };
}
