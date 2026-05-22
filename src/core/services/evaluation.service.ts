import { fetchClient } from "@/lib/fetchClient";
import { Evaluation, PaginatedResponse } from "@/types/models";

export interface GetEvaluationsFilters {
  student?: number;
  date?: string;
  grade?: number;
  page?: number;
  page_size?: number;
}

export const evaluationService = {
  getEvaluations: (filters: GetEvaluationsFilters = {}): Promise<PaginatedResponse<Evaluation>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined) params.append(k, String(v));
    });
    const qs = params.toString();
    return fetchClient(`/api/v1/evaluaciones/${qs ? `?${qs}` : ""}`);
  },

  getEvaluationById: (id: number): Promise<Evaluation> => fetchClient(`/api/v1/evaluaciones/${id}/`),
  
  getMyEvaluations: (): Promise<PaginatedResponse<Evaluation>> => fetchClient("/api/v1/evaluaciones/mis-evaluaciones/"),

  createEvaluation: (data: Omit<Evaluation, "id">): Promise<Evaluation> => fetchClient("/api/v1/evaluaciones/", { method: "POST", body: JSON.stringify(data) }),
  
  updateEvaluation: (id: number, data: Partial<Evaluation>): Promise<Evaluation> => fetchClient(`/api/v1/evaluaciones/${id}/`, { method: "PATCH", body: JSON.stringify(data) }),
  
  deleteEvaluation: (id: number): Promise<void> => fetchClient(`/api/v1/evaluaciones/${id}/`, { method: "DELETE" }),
};
