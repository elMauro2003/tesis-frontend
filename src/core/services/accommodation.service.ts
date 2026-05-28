import { fetchClient } from "@/lib/fetchClient";
import { RoomAssignment, RoomDuty, PaginatedResponse } from "@/types/models";

export interface RoomAssignmentCreatePayload {
  student: number;
  room: number;
  assigned_date: string;
}

export const accommodationService = {
  // --- Asignaciones de Cuartos ---
  getAssignments: (filters?: { student?: number; room?: number; is_active?: boolean; page?: number }): Promise<PaginatedResponse<RoomAssignment>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/asignaciones/${qs ? `?${qs}` : ""}`);
  },

  getAssignmentById: (id: number): Promise<RoomAssignment> => fetchClient(`/api/v1/asignaciones/${id}/`),
  
  getActiveAssignments: (): Promise<PaginatedResponse<RoomAssignment> | RoomAssignment[]> => fetchClient("/api/v1/asignaciones/activas/"),

  getAllActiveAssignments: async (): Promise<PaginatedResponse<RoomAssignment>> => {
    const response = await accommodationService.getActiveAssignments();

    if (Array.isArray(response)) {
      return {
        count: response.length,
        next: null,
        previous: null,
        results: response,
      };
    }

    const firstPage = response;
    if (!firstPage.next) {
      return firstPage;
    }

    const pageSize = firstPage.results.length || 20;
    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        accommodationService.getAssignments({ is_active: true, page })
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
  
  createAssignment: (data: RoomAssignmentCreatePayload): Promise<RoomAssignment> => fetchClient("/api/v1/asignaciones/", { method: "POST", body: JSON.stringify(data) }),
  
  releaseAssignment: (id: number): Promise<void> => fetchClient(`/api/v1/asignaciones/${id}/liberar/`, { method: "POST" }),

  // --- Cuartelerías (Room Duties) ---
  getRoomDuties: (filters?: { room?: number; student?: number; completed?: boolean; page?: number }): Promise<PaginatedResponse<RoomDuty>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/cuartelerias/${qs ? `?${qs}` : ""}`);
  },

  getRoomDutyById: (id: number): Promise<RoomDuty> => fetchClient(`/api/v1/cuartelerias/${id}/`),
  
  getMyRoomDuties: (): Promise<PaginatedResponse<RoomDuty>> => fetchClient("/api/v1/cuartelerias/mis-cuartelerias/"),
  
  createRoomDuty: (data: Omit<RoomDuty, "id" | "completed">): Promise<RoomDuty> => fetchClient("/api/v1/cuartelerias/", { method: "POST", body: JSON.stringify(data) }),
  
  completeRoomDuty: (id: number, notes?: string): Promise<RoomDuty> => fetchClient(`/api/v1/cuartelerias/${id}/completar/`, { method: "PATCH", body: JSON.stringify({ notes }) }),
};
