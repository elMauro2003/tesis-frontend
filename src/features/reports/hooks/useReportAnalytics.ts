"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { academicService } from "@/core/services/academic.service";
import { accommodationService } from "@/core/services/accommodation.service";
import { studentService } from "@/core/services/student.service";
import { useRoomsCatalog } from "@/features/rooms/hooks/useRoomsCatalog";
import type { ReportsDraftFilters } from "@/features/reports/types";
import {
  applyClientStudentFilters,
  buildStudentApiFilters,
  computeDynamicInsights,
} from "@/features/reports/utils/reportAnalytics";
import { mapStudentToReportRow } from "@/features/reports/utils/studentRows";

export function useReportAnalytics(filters: ReportsDraftFilters, enabled = true) {
  const catalog = useRoomsCatalog();

  const facultiesQuery = useQuery({
    queryKey: ["faculties"],
    queryFn: () => academicService.getFaculties(),
    staleTime: 5 * 60 * 1000,
  });

  const careersQuery = useQuery({
    queryKey: ["careers-by-faculty", filters.facultyId],
    queryFn: () =>
      academicService.getCareers(filters.facultyId === "all" ? undefined : filters.facultyId),
    enabled: enabled && filters.facultyId !== "all",
    staleTime: 5 * 60 * 1000,
  });

  const assignmentsQuery = useQuery({
    queryKey: ["active-assignments"],
    queryFn: () => accommodationService.getAllActiveAssignments(),
    enabled,
    staleTime: 60 * 1000,
  });

  const catalogMaps = useMemo(
    () => ({
      buildings: catalog.buildings,
      buildingsById: catalog.buildingsById,
      sitesById: catalog.sitesById,
      wingsById: catalog.wingsById,
    }),
    [catalog.buildings, catalog.buildingsById, catalog.sitesById, catalog.wingsById]
  );

  const studentsDatasetQuery = useQuery({
    queryKey: ["report-students-dataset", filters],
    queryFn: async () => {
      const apiFilters = buildStudentApiFilters(filters, 1, 100);
      const response = await studentService.getAllStudents(apiFilters);
      return applyClientStudentFilters(response.results, filters, catalogMaps);
    },
    enabled: enabled && !catalog.isLoading,
    staleTime: 30 * 1000,
  });

  const faculties = facultiesQuery.data?.results ?? [];
  const facultiesById = useMemo(
    () => new Map(faculties.map((faculty) => [faculty.id, faculty])),
    [faculties]
  );

  const students = studentsDatasetQuery.data ?? [];

  const insights = useMemo(
    () =>
      computeDynamicInsights({
        filters,
        students,
        assignments: assignmentsQuery.data?.results ?? [],
        catalog: catalogMaps,
        facultiesById,
      }),
    [filters, students, assignmentsQuery.data?.results, catalogMaps, facultiesById]
  );

  const studentRows = useMemo(
    () => students.map((student) => mapStudentToReportRow(student, catalogMaps, facultiesById)),
    [students, catalogMaps, facultiesById]
  );

  const selectedBuilding = useMemo(() => {
    if (filters.buildingId === "all") return null;
    return catalog.buildingsById.get(filters.buildingId) ?? null;
  }, [filters.buildingId, catalog.buildingsById]);

  return {
    students,
    insights,
    studentRows,
    totalStudents: students.length,
    selectedBuilding,
    isLoading: catalog.isLoading || studentsDatasetQuery.isLoading,
    isError: catalog.isError || studentsDatasetQuery.isError,
    careers: careersQuery.data?.results ?? [],
    careersLoading: careersQuery.isLoading,
    refetchStudents: studentsDatasetQuery.refetch,
  };
}
