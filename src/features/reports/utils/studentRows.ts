import { getBuildingSiteId } from "@/features/rooms/utils/roomLabels";
import type { ReportsDraftFilters } from "@/features/reports/types";
import { Building, Site, Student } from "@/types/models";

type CatalogMaps = {
  buildings: Building[];
  buildingsById: Map<number, Building>;
  sitesById: Map<number, Site>;
};

export type ReportStudentRow = {
  id: number;
  fullName: string;
  studentId: string;
  siteName: string;
  buildingName: string;
  facultyLabel: string;
  evaluationGrade: string;
};

const getRoomInfo = (student: Student) => {
  const extended = student as Student & {
    current_room_info?: {
      building?: string;
      wing?: string;
      room_number?: string;
    };
  };

  return extended.current_room_info ?? student.current_room ?? null;
};

export const getStudentLocation = (student: Student, catalog: CatalogMaps) => {
  const roomInfo = getRoomInfo(student);
  const buildingName = roomInfo?.building?.trim() || "—";

  if (buildingName === "—") {
    return { siteName: "—", buildingName };
  }

  const building =
    catalog.buildings.find((item) => item.name === buildingName) ??
    catalog.buildings.find((item) => buildingName.includes(item.name));

  if (!building) {
    return { siteName: "—", buildingName };
  }

  const siteId = getBuildingSiteId(building);
  const site = siteId !== null ? catalog.sitesById.get(siteId) : undefined;

  return {
    siteName: site?.name ?? "—",
    buildingName: building.name,
  };
};

export const getStudentFacultyLabel = (student: Student, facultiesById: Map<number, { name: string }>) => {
  const group = student.group;
  const career = group?.career_year?.career;
  const careerRecord = career as { name?: string; faculty?: number; faculty_id?: number } | undefined;
  const facultyId = careerRecord?.faculty ?? careerRecord?.faculty_id;

  if (facultyId && facultiesById.has(facultyId)) {
    const name = facultiesById.get(facultyId)?.name ?? "";
    const words = name.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return words
        .slice(0, 3)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
    }
    return name.slice(0, 3).toUpperCase();
  }

  if (career?.name) {
    return career.name.slice(0, 3).toUpperCase();
  }

  return "—";
};

export const matchesInfrastructureFilters = (
  student: Student,
  filters: Pick<ReportsDraftFilters, "siteId" | "buildingId">,
  catalog: CatalogMaps
) => {
  if (filters.siteId === "all" && filters.buildingId === "all") {
    return true;
  }

  const { siteName, buildingName } = getStudentLocation(student, catalog);

  if (filters.buildingId !== "all") {
    const building = catalog.buildingsById.get(filters.buildingId);
    return building ? building.name === buildingName : false;
  }

  if (filters.siteId !== "all") {
    const site = catalog.sitesById.get(filters.siteId);
    return site ? site.name === siteName : false;
  }

  return true;
};

export const mapStudentToReportRow = (
  student: Student,
  catalog: CatalogMaps,
  facultiesById: Map<number, { name: string }>
): ReportStudentRow => {
  const { siteName, buildingName } = getStudentLocation(student, catalog);

  return {
    id: student.id,
    fullName: student.full_name,
    studentId: student.student_id,
    siteName,
    buildingName,
    facultyLabel: getStudentFacultyLabel(student, facultiesById),
    evaluationGrade: student.academic_performance?.trim() || "—",
  };
};

export const paginateItems = <T,>(items: T[], page: number, pageSize: number) => {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    totalItems,
    totalPages,
    page: safePage,
    results: items.slice(start, start + pageSize),
  };
};
