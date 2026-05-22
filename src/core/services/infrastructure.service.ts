import { fetchClient } from "@/lib/fetchClient";
import { Room, Wing, Building, Site, PaginatedResponse } from "@/types/models";

// DTOs & Filters omitidos para brevedad
export const infrastructureService = {
  // Sedes
  getSites: (): Promise<PaginatedResponse<Site>> => {
    return fetchClient<PaginatedResponse<Site>>("/api/v1/sedes/");
  },
  
  // Edificios
  getBuildings: (siteId?: number): Promise<PaginatedResponse<Building>> => {
    const query = siteId ? `?site=${siteId}` : "";
    return fetchClient<PaginatedResponse<Building>>(`/api/v1/edificios/${query}`);
  },

  // Alas
  getWings: (buildingId?: number): Promise<PaginatedResponse<Wing>> => {
    const query = buildingId ? `?building=${buildingId}` : "";
    return fetchClient<PaginatedResponse<Wing>>(`/api/v1/alas/${query}`);
  },

  // Cuartos
  getRooms: (filters?: { wing?: number; is_active?: boolean; page?: number }): Promise<PaginatedResponse<Room>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const qs = params.toString();
    return fetchClient<PaginatedResponse<Room>>(`/api/v1/cuartos/${qs ? `?${qs}` : ""}`);
  },

  getRoomById: (id: number): Promise<Room> => {
    return fetchClient<Room>(`/api/v1/cuartos/${id}/`);
  }
};
