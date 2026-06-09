import { fetchClient } from "@/lib/fetchClient";
import { Complaint, ComplaintWritePayload, PaginatedResponse } from "@/types/models";

export interface GetComplaintsFilters {
  status?: string;
  type?: string;
  date?: string;
  building?: number;
  search?: string;
  ordering?: string;
  visibility?: boolean;
  page?: number;
  page_size?: number;
}

function normalizeComplaint(raw: Complaint & { is_public?: boolean; visibility?: boolean }): Complaint {
  const visibility = raw.visibility ?? raw.is_public ?? false;

  return {
    ...raw,
    visibility,
    is_public: visibility,
  };
}

function normalizePage(response: PaginatedResponse<Complaint>): PaginatedResponse<Complaint> {
  return {
    ...response,
    results: response.results.map(normalizeComplaint),
  };
}

export const complaintService = {
  getComplaints: async (filters: GetComplaintsFilters = {}): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/v1/quejas/${queryString ? `?${queryString}` : ""}`;

    const response = await fetchClient<PaginatedResponse<Complaint>>(endpoint);
    return normalizePage(response);
  },

  getComplaintById: async (id: number): Promise<Complaint> => {
    const response = await fetchClient<Complaint>(`/api/v1/quejas/${id}/`);
    return normalizeComplaint(response);
  },

  getMyComplaints: async (
    filters: Pick<GetComplaintsFilters, "page" | "page_size"> = {}
  ): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const response = await fetchClient<PaginatedResponse<Complaint>>(
      `/api/v1/quejas/mis-quejas/${queryString ? `?${queryString}` : ""}`
    );
    return normalizePage(response);
  },

  getPublicComplaints: async (
    filters: Pick<GetComplaintsFilters, "page" | "page_size"> = {}
  ): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    const response = await fetchClient<PaginatedResponse<Complaint>>(
      `/api/v1/quejas/visibles/${queryString ? `?${queryString}` : ""}`
    );
    return normalizePage(response);
  },

  createComplaint: async (data: ComplaintWritePayload): Promise<Complaint> => {
    const response = await fetchClient<Complaint>("/api/v1/quejas/", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return normalizeComplaint(response);
  },

  updateComplaint: async (id: number, data: ComplaintWritePayload): Promise<Complaint> => {
    const response = await fetchClient<Complaint>(`/api/v1/quejas/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return normalizeComplaint(response);
  },

  deleteComplaint: (id: number): Promise<void> => {
    return fetchClient<void>(`/api/v1/quejas/${id}/`, { method: "DELETE" });
  },

  updateComplaintStatus: async (id: number, status: string): Promise<Complaint> => {
    const response = await fetchClient<Complaint>(`/api/v1/quejas/${id}/estado/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    return normalizeComplaint(response);
  },

  respondToComplaint: async (id: number, responseText: string): Promise<Complaint> => {
    const response = await fetchClient<Complaint>(`/api/v1/quejas/${id}/respuesta/`, {
      method: "POST",
      body: JSON.stringify({ response: responseText }),
    });
    return normalizeComplaint(response);
  },

  /**
   * Envía la respuesta y, si no se desea marcar como resuelta, restaura el estado previo.
   * La API siempre marca la queja como resuelta al responder; el segundo paso solo aplica
   * cuando markResolved es false.
   */
  respondToComplaintWithOptions: async (
    id: number,
    responseText: string,
    options: { markResolved: boolean; previousStatus: Complaint["status"] }
  ): Promise<Complaint> => {
    const responded = await complaintService.respondToComplaint(id, responseText);

    if (
      !options.markResolved &&
      options.previousStatus !== "resuelta" &&
      responded.status === "resuelta"
    ) {
      return complaintService.updateComplaintStatus(id, options.previousStatus);
    }

    return responded;
  },

  updateComplaintVisibility: async (id: number, visibility: boolean): Promise<Complaint> => {
    const response = await fetchClient<Complaint>(`/api/v1/quejas/${id}/visibilidad/`, {
      method: "PATCH",
      body: JSON.stringify({ visibility }),
    });
    return normalizeComplaint(response);
  },

  getAllPublicComplaints: async (): Promise<PaginatedResponse<Complaint>> => {
    const pageSize = 50;
    const firstPage = await complaintService.getPublicComplaints({ page: 1, page_size: pageSize });

    if (!firstPage.next) {
      return firstPage;
    }

    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        complaintService.getPublicComplaints({ page, page_size: pageSize })
      )
    );

    return {
      ...firstPage,
      results: [...firstPage.results, ...remainingPages.flatMap((page) => page.results)],
    };
  },

  getAllComplaints: async (
    filters: Omit<GetComplaintsFilters, "page"> = {}
  ): Promise<PaginatedResponse<Complaint>> => {
    const pageSize = 100;
    const firstPage = await complaintService.getComplaints({ ...filters, page: 1, page_size: pageSize });

    if (!firstPage.next) {
      return firstPage;
    }

    const totalPages = Math.max(1, Math.ceil(firstPage.count / pageSize));
    const remainingPages = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, index) => index + 2).map((page) =>
        complaintService.getComplaints({ ...filters, page, page_size: pageSize })
      )
    );

    return {
      ...firstPage,
      results: [...firstPage.results, ...remainingPages.flatMap((page) => page.results)],
    };
  },
};
