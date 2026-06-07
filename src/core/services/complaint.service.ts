import { fetchClient } from "@/lib/fetchClient";
import { Complaint, PaginatedResponse } from "@/types/models";

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

export const complaintService = {
  getComplaints: (filters: GetComplaintsFilters = {}): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });

    const queryString = params.toString();
    const endpoint = `/api/v1/quejas/${queryString ? `?${queryString}` : ""}`;

    return fetchClient<PaginatedResponse<Complaint>>(endpoint);
  },

  getComplaintById: (id: number): Promise<Complaint> => {
    return fetchClient<Complaint>(`/api/v1/quejas/${id}/`);
  },

  getMyComplaints: (filters: Pick<GetComplaintsFilters, "page" | "page_size"> = {}): Promise<PaginatedResponse<Complaint>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, String(value));
      }
    });
    const queryString = params.toString();
    return fetchClient<PaginatedResponse<Complaint>>(
      `/api/v1/quejas/mis-quejas/${queryString ? `?${queryString}` : ""}`
    );
  },

  getPublicComplaints: (): Promise<PaginatedResponse<Complaint>> => {
    return fetchClient<PaginatedResponse<Complaint>>("/api/v1/quejas/visibles/");
  },

  createComplaint: (data: Partial<Complaint>): Promise<Complaint> => {
    return fetchClient<Complaint>("/api/v1/quejas/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  updateComplaintStatus: (id: number, status: string): Promise<Complaint> => {
    return fetchClient<Complaint>(`/api/v1/quejas/${id}/estado/`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  respondToComplaint: (id: number, response: string): Promise<Complaint> => {
    return fetchClient<Complaint>(`/api/v1/quejas/${id}/respuesta/`, {
      method: "POST",
      body: JSON.stringify({ response }),
    });
  },

  updateComplaintVisibility: (id: number, is_public: boolean): Promise<Complaint> => {
    return fetchClient<Complaint>(`/api/v1/quejas/${id}/visibilidad/`, {
      method: "PATCH",
      body: JSON.stringify({ is_public }),
    });
  },

  getAllComplaints: async (filters: Omit<GetComplaintsFilters, "page"> = {}): Promise<PaginatedResponse<Complaint>> => {
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
