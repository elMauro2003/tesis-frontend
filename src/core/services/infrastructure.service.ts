import { fetchClient } from "@/lib/fetchClient";
import { Room, Wing, Building, Site, PaginatedResponse } from "@/types/models";

const isRoomAvailable = (room: Room) => {
  const currentOccupancy = room.current_occupancy ?? room.occupancy ?? 0;
  return room.is_active && !room.is_full && currentOccupancy < room.capacity;
};

export const infrastructureService = {
  // Sedes
  getSites: (): Promise<PaginatedResponse<Site>> => fetchClient("/api/v1/sedes/"),
  getSiteById: (id: number): Promise<Site> => fetchClient(`/api/v1/sedes/${id}/`),
  createSite: (data: Omit<Site, "id">): Promise<Site> => fetchClient("/api/v1/sedes/", { method: "POST", body: JSON.stringify(data) }),
  updateSite: (id: number, data: Partial<Site>): Promise<Site> => fetchClient(`/api/v1/sedes/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteSite: (id: number): Promise<void> => fetchClient(`/api/v1/sedes/${id}/`, { method: "DELETE" }),
  
  // Edificios
  getBuildings: (siteId?: number): Promise<PaginatedResponse<Building>> => {
    const query = siteId ? `?site=${siteId}` : "";
    return fetchClient(`/api/v1/edificios/${query}`);
  },
  getBuildingById: (id: number): Promise<Building> => fetchClient(`/api/v1/edificios/${id}/`),
  createBuilding: (data: Omit<Building, "id">): Promise<Building> => fetchClient("/api/v1/edificios/", { method: "POST", body: JSON.stringify(data) }),
  updateBuilding: (id: number, data: Partial<Building>): Promise<Building> => fetchClient(`/api/v1/edificios/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteBuilding: (id: number): Promise<void> => fetchClient(`/api/v1/edificios/${id}/`, { method: "DELETE" }),

  // Alas
  getWings: (buildingId?: number): Promise<PaginatedResponse<Wing>> => {
    const query = buildingId ? `?building=${buildingId}` : "";
    return fetchClient(`/api/v1/alas/${query}`);
  },
  getWingById: (id: number): Promise<Wing> => fetchClient(`/api/v1/alas/${id}/`),
  createWing: (data: Omit<Wing, "id">): Promise<Wing> => fetchClient("/api/v1/alas/", { method: "POST", body: JSON.stringify(data) }),
  updateWing: (id: number, data: Partial<Wing>): Promise<Wing> => fetchClient(`/api/v1/alas/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteWing: (id: number): Promise<void> => fetchClient(`/api/v1/alas/${id}/`, { method: "DELETE" }),

  // Cuartos
  getRooms: (filters?: { wing?: number; is_active?: boolean; page?: number }): Promise<PaginatedResponse<Room>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) params.append(key, String(value));
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/cuartos/${qs ? `?${qs}` : ""}`);
  },
  getAllRooms: async (filters?: { wing?: number; is_active?: boolean }): Promise<PaginatedResponse<Room>> => {
    const firstPage = await infrastructureService.getRooms(filters);

    if (!firstPage.next) {
      return firstPage;
    }

    const pageSize = firstPage.results.length || 20;
    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        infrastructureService.getRooms({ ...filters, page })
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
  getActiveRooms: (): Promise<PaginatedResponse<Room>> => infrastructureService.getRooms({ is_active: true }),
  getRoomById: (id: number): Promise<Room> => fetchClient(`/api/v1/cuartos/${id}/`),
  getAllActiveRooms: async (): Promise<PaginatedResponse<Room>> => {
    return infrastructureService.getAllRooms({ is_active: true });
  },
  getAvailableRooms: async (): Promise<PaginatedResponse<Room>> => {
    const activeRooms = await infrastructureService.getAllRooms({ is_active: true });
    const availableRooms = activeRooms.results.filter(isRoomAvailable);

    return {
      ...activeRooms,
      count: availableRooms.length,
      next: null,
      previous: null,
      results: availableRooms,
    };
  },
  createRoom: (data: Omit<Room, "id">): Promise<Room> => fetchClient("/api/v1/cuartos/", { method: "POST", body: JSON.stringify(data) }),
  updateRoom: (id: number, data: Partial<Room>): Promise<Room> => fetchClient(`/api/v1/cuartos/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  deleteRoom: (id: number): Promise<void> => fetchClient(`/api/v1/cuartos/${id}/`, { method: "DELETE" }),
};
