import { fetchClient } from "@/lib/fetchClient";
import { Faculty, Career, AcademicYear, Group, PaginatedResponse } from "@/types/models";

export const academicService = {
  // --- Facultades ---
  getFaculties: (): Promise<PaginatedResponse<Faculty>> => fetchClient("/api/v1/facultades/"),
  getFacultyById: (id: number): Promise<Faculty> => fetchClient(`/api/v1/facultades/${id}/`),
  createFaculty: (data: Omit<Faculty, "id">): Promise<Faculty> => fetchClient("/api/v1/facultades/", { method: "POST", body: JSON.stringify(data) }),
  updateFaculty: (id: number, data: Partial<Faculty>): Promise<Faculty> => fetchClient(`/api/v1/facultades/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteFaculty: (id: number): Promise<void> => fetchClient(`/api/v1/facultades/${id}/`, { method: "DELETE" }),

  // --- Carreras ---
  getCareers: (facultyId?: number): Promise<PaginatedResponse<Career>> => {
    const qs = facultyId ? `?faculty=${facultyId}` : "";
    return fetchClient(`/api/v1/carreras/${qs}`);
  },
  getCareerById: (id: number): Promise<Career> => fetchClient(`/api/v1/carreras/${id}/`),
  createCareer: (data: Omit<Career, "id">): Promise<Career> => fetchClient("/api/v1/carreras/", { method: "POST", body: JSON.stringify(data) }),
  updateCareer: (id: number, data: Partial<Career>): Promise<Career> => fetchClient(`/api/v1/carreras/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteCareer: (id: number): Promise<void> => fetchClient(`/api/v1/carreras/${id}/`, { method: "DELETE" }),

  // --- Años Académicos ---
  getAcademicYears: (careerId?: number): Promise<PaginatedResponse<AcademicYear>> => {
    const qs = careerId ? `?career=${careerId}` : "";
    return fetchClient(`/api/v1/anios-academicos/${qs}`);
  },
  getAcademicYearById: (id: number): Promise<AcademicYear> => fetchClient(`/api/v1/anios-academicos/${id}/`),
  createAcademicYear: (data: Omit<AcademicYear, "id">): Promise<AcademicYear> => fetchClient("/api/v1/anios-academicos/", { method: "POST", body: JSON.stringify(data) }),
  updateAcademicYear: (id: number, data: Partial<AcademicYear>): Promise<AcademicYear> => fetchClient(`/api/v1/anios-academicos/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteAcademicYear: (id: number): Promise<void> => fetchClient(`/api/v1/anios-academicos/${id}/`, { method: "DELETE" }),

  // --- Grupos Estudiantiles ---
  getGroups: (careerYearId?: number): Promise<PaginatedResponse<Group>> => {
    const qs = careerYearId ? `?career_year=${careerYearId}` : "";
    return fetchClient(`/api/v1/grupos/${qs}`);
  },
  getGroupById: (id: number): Promise<Group> => fetchClient(`/api/v1/grupos/${id}/`),
  createGroup: (data: Omit<Group, "id">): Promise<Group> => fetchClient("/api/v1/grupos/", { method: "POST", body: JSON.stringify(data) }),
  updateGroup: (id: number, data: Partial<Group>): Promise<Group> => fetchClient(`/api/v1/grupos/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteGroup: (id: number): Promise<void> => fetchClient(`/api/v1/grupos/${id}/`, { method: "DELETE" }),
};
