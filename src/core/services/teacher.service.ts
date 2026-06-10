import { fetchClient } from "@/lib/fetchClient";
import { PaginatedResponse, Teacher, WingSupervisor } from "@/types/models";

export type ProfessorListFilters = {
  search?: string;
  department?: string;
  page?: number;
  page_size?: number;
};

export const teacherService = {
  getTeachers: (filters: ProfessorListFilters = {}): Promise<PaginatedResponse<Teacher>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    return fetchClient(`/api/v1/profesores/${queryString ? `?${queryString}` : ""}`);
  },

  getAllTeachers: async (filters: ProfessorListFilters = {}): Promise<PaginatedResponse<Teacher>> => {
    const pageSize = filters.page_size ?? 100;
    const firstPage = await teacherService.getTeachers({ ...filters, page: 1, page_size: pageSize });

    if (!firstPage.next) {
      return firstPage;
    }

    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        teacherService.getTeachers({ ...filters, page, page_size: pageSize })
      )
    );

    return {
      ...firstPage,
      results: [
        ...firstPage.results,
        ...remainingPages.flatMap((page) => page.results),
      ],
    };
  },

  getTeacherById: (id: number): Promise<Teacher> => fetchClient(`/api/v1/profesores/${id}/`),
  createTeacher: (data: Omit<Teacher, "id">): Promise<Teacher> => fetchClient("/api/v1/profesores/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacher: (id: number, data: Partial<Teacher>): Promise<Teacher> => fetchClient(`/api/v1/profesores/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/`, { method: "DELETE" }),

  getWingSupervisor: (professorId: number): Promise<WingSupervisor> =>
    fetchClient(`/api/v1/profesores/${professorId}/responsable-ala/`),

  assignWingSupervisor: (professorId: number, wingId: number): Promise<WingSupervisor> =>
    fetchClient(`/api/v1/profesores/${professorId}/responsable-ala/`, {
      method: "POST",
      body: JSON.stringify({ wing: wingId }),
    }),

  removeWingSupervisor: (professorId: number): Promise<void> =>
    fetchClient(`/api/v1/profesores/${professorId}/responsable-ala/`, { method: "DELETE" }),

  getSupervisorsByWingIds: async (wingIds: number[]): Promise<Map<number, WingSupervisor>> => {
    if (wingIds.length === 0) {
      return new Map();
    }

    const wingIdSet = new Set(wingIds);
    const teachersResponse = await teacherService.getAllTeachers();
    const supervisors = teachersResponse.results.filter((teacher) => teacher.is_wing_supervisor);

    const assignments = await Promise.all(
      supervisors.map(async (teacher) => {
        try {
          return await teacherService.getWingSupervisor(teacher.id);
        } catch {
          return null;
        }
      })
    );

    const map = new Map<number, WingSupervisor>();

    for (const assignment of assignments) {
      if (assignment && wingIdSet.has(assignment.wing)) {
        map.set(assignment.wing, assignment);
      }
    }

    return map;
  },

  // Asignaciones de roles
  assignDean: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/decano/`, { method: "POST" }),
  removeDean: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/decano/`, { method: "DELETE" }),

  assignGuideTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/profesor-guia/`, { method: "POST" }),
  removeGuideTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/profesor-guia/`, { method: "DELETE" }),

  assignPrincipalTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/ppa/`, { method: "POST" }),
  removePrincipalTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/ppa/`, { method: "DELETE" }),
};
