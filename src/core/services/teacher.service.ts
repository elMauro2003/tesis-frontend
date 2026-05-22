import { fetchClient } from "@/lib/fetchClient";
import { Teacher, PaginatedResponse } from "@/types/models";

export const teacherService = {
  getTeachers: (): Promise<PaginatedResponse<Teacher>> => fetchClient("/api/v1/profesores/"),
  getTeacherById: (id: number): Promise<Teacher> => fetchClient(`/api/v1/profesores/${id}/`),
  createTeacher: (data: Omit<Teacher, "id">): Promise<Teacher> => fetchClient("/api/v1/profesores/", { method: "POST", body: JSON.stringify(data) }),
  updateTeacher: (id: number, data: Partial<Teacher>): Promise<Teacher> => fetchClient(`/api/v1/profesores/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/`, { method: "DELETE" }),

  // Asignaciones de roles
  assignDean: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/decano/`, { method: "POST" }),
  removeDean: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/decano/`, { method: "DELETE" }),
  
  assignGuideTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/profesor-guia/`, { method: "POST" }),
  removeGuideTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/profesor-guia/`, { method: "DELETE" }),
  
  assignPrincipalTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/ppa/`, { method: "POST" }),
  removePrincipalTeacher: (id: number): Promise<void> => fetchClient(`/api/v1/profesores/${id}/ppa/`, { method: "DELETE" }),
};
