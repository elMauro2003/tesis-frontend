import { fetchClient } from "@/lib/fetchClient";
import { Information, PaginatedResponse } from "@/types/models";

export const communicationService = {
  getInformations: (filters?: { is_public?: boolean; expires_date?: string; page?: number }): Promise<PaginatedResponse<Information>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/informaciones/${qs ? `?${qs}` : ""}`);
  },

  getInformationById: (id: number): Promise<Information> => fetchClient(`/api/v1/informaciones/${id}/`),
  
  getPublicInformations: (): Promise<PaginatedResponse<Information>> => fetchClient("/api/v1/informaciones/publicas/"),

  createInformation: (data: Omit<Information, "id" | "created_at">): Promise<Information> => fetchClient("/api/v1/informaciones/", { method: "POST", body: JSON.stringify(data) }),
  
  updateInformation: (id: number, data: Partial<Information>): Promise<Information> => fetchClient(`/api/v1/informaciones/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  
  deleteInformation: (id: number): Promise<void> => fetchClient(`/api/v1/informaciones/${id}/`, { method: "DELETE" }),

  getAllInformations: async (filters?: { is_public?: boolean }): Promise<PaginatedResponse<Information>> => {
    const pageSize = 100;
    const firstPage = await communicationService.getInformations({ ...filters, page: 1 });

    if (!firstPage.next) {
      return firstPage;
    }

    const effectivePageSize = firstPage.results.length || pageSize;
    const totalPages = Math.max(1, Math.ceil(firstPage.count / effectivePageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        communicationService.getInformations({ ...filters, page })
      )
    );

    return {
      ...firstPage,
      results: [...firstPage.results, ...remainingPages.flatMap((page) => page.results)],
    };
  },
};
