import { fetchClient } from "@/lib/fetchClient";
import { PaginatedResponse, Report } from "@/types/models";

export interface GetReportsFilters {
  type?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
}

export interface CreateReportPayload {
  name: string;
  type: string;
  parameters?: Record<string, unknown> | null;
}

export const reportService = {
  getReports: (filters: GetReportsFilters = {}): Promise<PaginatedResponse<Report>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        params.append(key, String(value));
      }
    });
    const qs = params.toString();
    return fetchClient(`/api/v1/reportes/${qs ? `?${qs}` : ""}`);
  },

  getReportById: (id: number): Promise<Report> => fetchClient(`/api/v1/reportes/${id}/`),

  createReport: (
    data: CreateReportPayload,
    options?: { suppressForbiddenEvent?: boolean }
  ): Promise<Report> =>
    fetchClient("/api/v1/reportes/", {
      method: "POST",
      body: JSON.stringify(data),
      suppressForbiddenEvent: options?.suppressForbiddenEvent,
    }),

  pollUntilFileReady: async (
    id: number,
    options?: { maxAttempts?: number; intervalMs?: number }
  ): Promise<Report> => {
    const maxAttempts = options?.maxAttempts ?? 12;
    const intervalMs = options?.intervalMs ?? 2000;
    let latest = await reportService.getReportById(id);

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      if (latest.file_url?.trim()) {
        return latest;
      }
      await new Promise((resolve) => window.setTimeout(resolve, intervalMs));
      latest = await reportService.getReportById(id);
    }

    return latest;
  },
};
