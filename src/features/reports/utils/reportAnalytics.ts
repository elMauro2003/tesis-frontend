import { getBuildingSiteId, getNumericId, getRoomWingId, getWingBuildingId } from "@/features/rooms/utils/roomLabels";
import type { ReportsDraftFilters } from "@/features/reports/types";
import {
  getStudentFacultyLabel,
  getStudentLocation,
  matchesInfrastructureFilters,
} from "@/features/reports/utils/studentRows";
import { Building, Room, RoomAssignment, Site, Student, Wing } from "@/types/models";
import type { ExtendedGetStudentsFilters } from "@/core/services/student.service";

export type ReportInsight = {
  id: string;
  label: string;
  value: string;
  hint?: string;
  icon?: string;
};

type CatalogMaps = {
  buildings: Building[];
  buildingsById: Map<number, Building>;
  sitesById: Map<number, Site>;
  wingsById: Map<number, Wing>;
};

const formatCount = (value: number) => new Intl.NumberFormat("es-ES").format(value);

export const buildStudentApiFilters = (
  filters: ReportsDraftFilters,
  page: number,
  pageSize: number
): ExtendedGetStudentsFilters => {
  const apiFilters: ExtendedGetStudentsFilters = { page, page_size: pageSize };

  if (filters.facultyId !== "all") {
    apiFilters.group__career_year__career__faculty = filters.facultyId;
  }

  if (filters.careerId !== "all") {
    apiFilters.group__career_year__career = filters.careerId;
  }

  if (filters.academicYear !== "all") {
    apiFilters.group__career_year__year = filters.academicYear;
  }

  if (filters.gender !== "all") {
    apiFilters.gender = filters.gender;
  }

  if (filters.militant === "yes") {
    apiFilters.is_militant = true;
  }

  if (filters.militant === "no") {
    apiFilters.is_militant = false;
  }

  if (filters.housing === "with_room") {
    apiFilters.has_room = true;
  }

  if (filters.housing === "without_room") {
    apiFilters.has_room = false;
  }

  return apiFilters;
};

export const applyClientStudentFilters = (
  students: Student[],
  filters: ReportsDraftFilters,
  catalog: CatalogMaps
): Student[] => {
  return students.filter((student) => {
    if (!matchesInfrastructureFilters(student, filters, catalog)) {
      return false;
    }

    if (filters.performance !== "all") {
      const grade = student.academic_performance?.trim();
      if (grade !== filters.performance) return false;
    }

    if (filters.gender !== "all" && student.gender !== filters.gender) {
      return false;
    }

    if (filters.militant === "yes" && !student.is_militant) return false;
    if (filters.militant === "no" && student.is_militant) return false;

    const hasRoom =
      student.has_room ??
      Boolean(
        student.current_room ??
          (student as Student & { current_room_info?: unknown }).current_room_info
      );

    if (filters.housing === "with_room" && !hasRoom) return false;
    if (filters.housing === "without_room" && hasRoom) return false;

    return true;
  });
};

export const buildAssignmentBuildingMap = (
  assignments: RoomAssignment[],
  rooms: Room[],
  wingsById: Map<number, Wing>
): Map<number, number> => {
  const roomToBuilding = new Map<number, number>();

  for (const room of rooms) {
    const wingId = getRoomWingId(room);
    const wing = wingId !== null ? wingsById.get(wingId) : null;
    const buildingId = wing ? getWingBuildingId(wing) : null;
    if (buildingId !== null) {
      roomToBuilding.set(room.id, buildingId);
    }
  }

  const studentToBuilding = new Map<number, number>();

  for (const assignment of assignments) {
    const studentId = getNumericId(assignment.student);
    const roomId = getNumericId(assignment.room);
    if (studentId === null || roomId === null) continue;

    const buildingId = roomToBuilding.get(roomId);
    if (buildingId !== undefined) {
      studentToBuilding.set(studentId, buildingId);
    }
  }

  return studentToBuilding;
};

const getStudentYear = (student: Student): number | null => {
  const year = student.group?.career_year?.year;
  return typeof year === "number" ? year : null;
};

const isMixedBuilding = (building?: Building) => {
  const gender = building?.gender?.toLowerCase() ?? "";
  return gender.includes("mixto");
};

export const computeDynamicInsights = (input: {
  filters: ReportsDraftFilters;
  students: Student[];
  assignments: RoomAssignment[];
  catalog: CatalogMaps;
  facultiesById: Map<number, { name: string }>;
}): ReportInsight[] => {
  const { filters, students, assignments, catalog, facultiesById } = input;
  const insights: ReportInsight[] = [];
  const studentHasRoom = (student: Student) =>
    student.has_room ??
    Boolean(
      student.current_room ??
        (student as Student & { current_room_info?: unknown }).current_room_info
    );

  const housed = students.filter((student) => studentHasRoom(student));
  const women = housed.filter((student) => student.gender === "F");
  const men = housed.filter((student) => student.gender === "M");

  insights.push({
    id: "total-scope",
    label: "Estudiantes en alcance",
    value: formatCount(students.length),
    hint: "Según filtros académicos y de infraestructura aplicados",
    icon: "groups",
  });

  insights.push({
    id: "housed-scope",
    label: "Con alojamiento en alcance",
    value: formatCount(housed.length),
    icon: "bed",
  });

  if (filters.buildingId !== "all") {
    const building = catalog.buildingsById.get(filters.buildingId);
    const buildingName = building?.name ?? "Edificio";

    insights.push({
      id: "building-focus",
      label: `En ${buildingName}`,
      value: formatCount(housed.length),
      hint: "Estudiantes alojados en el edificio seleccionado",
      icon: "domain",
    });

    if (building && isMixedBuilding(building)) {
      insights.push({
        id: "women-mixed",
        label: "Mujeres en edificio mixto",
        value: formatCount(women.length),
        hint: `${men.length} hombres en el mismo edificio`,
        icon: "female",
      });
      insights.push({
        id: "men-mixed",
        label: "Hombres en edificio mixto",
        value: formatCount(men.length),
        icon: "male",
      });
    }
  }

  if (filters.siteId !== "all" && filters.buildingId === "all") {
    const site = catalog.sitesById.get(filters.siteId);
    const siteName = site?.name ?? "Sede";
    const byBuilding = new Map<number, number>();

    for (const student of housed) {
      const { buildingName } = getStudentLocation(student, catalog);
      const building = catalog.buildings.find((item) => item.name === buildingName);
      if (!building) continue;
      const siteId = getBuildingSiteId(building);
      if (siteId !== filters.siteId) continue;
      byBuilding.set(building.id, (byBuilding.get(building.id) ?? 0) + 1);
    }

    const topBuilding = Array.from(byBuilding.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topBuilding) {
      const [buildingId, count] = topBuilding;
      insights.push({
        id: "top-building-site",
        label: `Mayor concentración en ${catalog.buildingsById.get(buildingId)?.name ?? "edificio"}`,
        value: formatCount(count),
        hint: `Sede ${siteName}`,
        icon: "leaderboard",
      });
    }
  }

  if (filters.academicYear !== "all") {
    const yearStudents = students.filter((student) => getStudentYear(student) === filters.academicYear);
    insights.push({
      id: "academic-year",
      label: `Estudiantes de ${filters.academicYear}.º año`,
      value: formatCount(yearStudents.length),
      hint: `${yearStudents.filter((s) => s.has_room !== false).length} con cuarto`,
      icon: "school",
    });
  }

  if (filters.facultyId !== "all") {
    const facultyName = facultiesById.get(filters.facultyId)?.name ?? "Facultad";
    insights.push({
      id: "faculty",
      label: facultyName,
      value: formatCount(students.length),
      icon: "account_balance",
    });
  }

  if (filters.gender === "F") {
    insights.push({
      id: "gender-f",
      label: "Estudiantes femeninas",
      value: formatCount(students.length),
      icon: "female",
    });
  }

  if (filters.militant === "yes") {
    insights.push({
      id: "militant",
      label: "Militantes",
      value: formatCount(students.filter((student) => student.is_militant).length),
      icon: "flag",
    });
  }

  if (filters.performance !== "all") {
    insights.push({
      id: "performance",
      label: `Aprovechamiento ${filters.performance}`,
      value: formatCount(students.length),
      icon: "grade",
    });
  }

  const activeCount = assignments.length;
  if (activeCount > 0 && filters.reportType === "assignments") {
    insights.push({
      id: "assignments-active",
      label: "Asignaciones activas (global)",
      value: formatCount(activeCount),
      icon: "swap_horiz",
    });
  }

  return insights.slice(0, 8);
};
