import { fetchClient } from "@/lib/fetchClient";
import { Room, Student, StudentCreateRequest, PaginatedResponse } from "@/types/models";

export interface GetStudentsFilters {
  search?: string;
  group?: number;
  gender?: "M" | "F";
  is_militant?: boolean;
  page?: number;
  page_size?: number;
  ordering?: string;
}
// Extend filters with optional server-side room filter if supported
export interface ExtendedGetStudentsFilters extends GetStudentsFilters {
  has_room?: boolean;
}

export const studentService = {
  getStudents: (filters: ExtendedGetStudentsFilters = {}): Promise<PaginatedResponse<Student>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/v1/estudiantes/${queryString ? `?${queryString}` : ""}`;

    return fetchClient<PaginatedResponse<Student>>(endpoint);
  },

  getAllStudents: async (filters: ExtendedGetStudentsFilters = {}): Promise<PaginatedResponse<Student>> => {
    const pageSize = filters.page_size ?? 100;
    const firstPage = await studentService.getStudents({ ...filters, page: 1, page_size: pageSize });
    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));

    if (totalPages === 1) {
      return firstPage;
    }

    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        studentService.getStudents({ ...filters, page, page_size: pageSize })
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

  getStudentCurrentRoom: (id: number): Promise<Room> => {
    return fetchClient<Room>(`/api/v1/estudiantes/${id}/current_room/`);
  },

  getStudentById: (id: number): Promise<Student> => {
    return fetchClient<Student>(`/api/v1/estudiantes/${id}/`);
  },

  // Fetch multiple student details by ids in parallel. Useful to enrich list rows with full relations.
  getStudentsByIds: async (ids: number[]): Promise<Student[]> => {
    if (!ids || ids.length === 0) return [];
    // Use allSettled so a failure fetching one student's detail doesn't reject the whole batch.
    const results = await Promise.allSettled(ids.map((id) => studentService.getStudentById(id)));
    return results
      .filter((r): r is PromiseFulfilledResult<Student> => r.status === 'fulfilled')
      .map((r) => r.value);
  },

  createStudent: (data: StudentCreateRequest): Promise<Student> => {
    return fetchClient<Student>("/api/v1/estudiantes/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStudent: (id: number, data: Partial<StudentCreateRequest>): Promise<Student> => {
    return fetchClient<Student>(`/api/v1/estudiantes/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  deleteStudent: (id: number): Promise<void> => {
    return fetchClient<void>(`/api/v1/estudiantes/${id}/`, {
      method: "DELETE",
    });
  }
};
