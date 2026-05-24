import { fetchClient } from "@/lib/fetchClient";
import { Student, PaginatedResponse } from "@/types/models";

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

  getStudentById: (id: number): Promise<Student> => {
    return fetchClient<Student>(`/api/v1/estudiantes/${id}/`);
  },

  createStudent: (data: Partial<Student>): Promise<Student> => {
    return fetchClient<Student>("/api/v1/estudiantes/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateStudent: (id: number, data: Partial<Student>): Promise<Student> => {
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
