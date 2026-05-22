import { fetchClient } from "@/lib/fetchClient";
import { Report, PaginatedResponse } from "@/types/models";

export const reportService = {
  getReports: (filters?: { type?: string; generated_date?: string; page?: number }): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== undefined) params.append(k, String(v));
      });
    }
    const qs = params.toString();
    return fetchClient(`/api/v1/reportes/${qs ? `?${qs}` : ""}`);
  },

  getReportById: (id: number): Promise<Report> => fetchClient(`/api/v1/reportes/${id}/`),
  
  createReport: (data: Omit<Report, "id" | "generated_date" | "file_url">): Promise<Report> => fetchClient("/api/v1/reportes/", { method: "POST", body: JSON.stringify(data) }),
};
