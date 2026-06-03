import { fetchClient, FetchError } from "@/lib/fetchClient";
import { RoomAssignment, RoomDuty, PaginatedResponse } from "@/types/models";

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const isAssignmentReleased = (assignment: RoomAssignment) =>
  Boolean(assignment.released_date) || assignment.is_active === false;

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
  
  releaseAssignment: async (id: number, releasedDate?: string): Promise<void> => {
    const payload = { released_date: releasedDate ?? todayIsoDate() };

    try {
      await fetchClient<RoomAssignment>(`/api/v1/asignaciones/${id}/liberar/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return;
    } catch (error) {
      // El backend a veces aplica la liberación pero responde 500 al serializar released_date.
      if (!(error instanceof FetchError) || error.status !== 500) {
        throw error;
      }
    }

    const assignment = await fetchClient<RoomAssignment>(`/api/v1/asignaciones/${id}/`);
    if (isAssignmentReleased(assignment)) {
      return;
    }

    throw new FetchError(
      500,
      "No se pudo confirmar la liberación. Intente de nuevo o contacte al administrador."
    );
  },

  /** Traslado de estudiante: libera la asignación activa y crea una nueva en otro cuarto (permuta). */
  transferStudentAssignment: async (
    assignmentId: number,
    studentId: number,
    targetRoomId: number,
    assignedDate?: string
  ): Promise<RoomAssignment> => {
    const releaseDate = assignedDate ?? todayIsoDate();
    await accommodationService.releaseAssignment(assignmentId, releaseDate);
    return accommodationService.createAssignment({
      student: studentId,
      room: targetRoomId,
      assigned_date: releaseDate,
    });
  },

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
