import { fetchClient } from "@/lib/fetchClient";
import { Information, InformationWritePayload, PaginatedResponse } from "@/types/models";

export type GetInformationsFilters = {
  is_public?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
};

export const communicationService = {
  getInformations: (filters?: GetInformationsFilters): Promise<PaginatedResponse<Information>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined && v !== "") {
          params.append(k, String(v));
        }
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/informaciones/${qs ? `?${qs}` : ""}`);
  },

  getInformationById: (id: number): Promise<Information> => fetchClient(`/api/v1/informaciones/${id}/`),
  
  getPublicInformations: (filters?: Pick<GetInformationsFilters, "page" | "page_size">): Promise<PaginatedResponse<Information>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) {
          params.append(k, String(v));
        }
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/informaciones/publicas/${qs ? `?${qs}` : ""}`);
  },

  createInformation: (data: InformationWritePayload): Promise<Information> =>
    fetchClient("/api/v1/informaciones/", { method: "POST", body: JSON.stringify(data) }),

  updateInformation: (id: number, data: Partial<InformationWritePayload>): Promise<Information> =>
    fetchClient(`/api/v1/informaciones/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  
  deleteInformation: (id: number): Promise<void> => fetchClient(`/api/v1/informaciones/${id}/`, { method: "DELETE" }),

  getAllPublicInformations: async (
    filters: Pick<GetInformationsFilters, "page_size"> = {}
  ): Promise<PaginatedResponse<Information>> => {
    const pageSize = filters.page_size ?? 100;
    const firstPage = await communicationService.getPublicInformations({ page: 1, page_size: pageSize });

    if (!firstPage.next) {
      return firstPage;
    }

    const effectivePageSize = firstPage.results.length || pageSize;
    const totalPages = Math.max(1, Math.ceil(firstPage.count / effectivePageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        communicationService.getPublicInformations({ page, page_size: pageSize })
      )
    );

    return {
      ...firstPage,
      results: [...firstPage.results, ...remainingPages.flatMap((page) => page.results)],
    };
  },

  getAllInformations: async (
    filters: Omit<GetInformationsFilters, "page" | "page_size"> = {}
  ): Promise<PaginatedResponse<Information>> => {
    const pageSize = 100;
    const firstPage = await communicationService.getInformations({ ...filters, page: 1, page_size: pageSize });

    if (!firstPage.next) {
      return firstPage;
    }

    const effectivePageSize = firstPage.results.length || pageSize;
    const totalPages = Math.max(1, Math.ceil(firstPage.count / effectivePageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        communicationService.getInformations({ ...filters, page, page_size: pageSize })
      )
    );

    return {
      ...firstPage,
      results: [...firstPage.results, ...remainingPages.flatMap((page) => page.results)],
    };
  },
};
