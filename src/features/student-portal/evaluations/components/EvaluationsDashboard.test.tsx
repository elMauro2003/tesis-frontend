import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { EvaluationsDashboard } from "@/features/student-portal/evaluations/components/EvaluationsDashboard";
import { mockInfiniteQueryResult, renderWithPortalProviders } from "@/test/test-utils";

vi.mock("@/features/student-portal/evaluations/hooks/useMyEvaluations", () => ({
  useMyEvaluations: vi.fn(),
}));

import { useMyEvaluations } from "@/features/student-portal/evaluations/hooks/useMyEvaluations";

describe("EvaluationsDashboard", () => {
  it("muestra estado vacío cuando no hay evaluaciones", async () => {
    vi.mocked(useMyEvaluations).mockReturnValue(mockInfiniteQueryResult() as ReturnType<typeof useMyEvaluations>);

    renderWithPortalProviders(<EvaluationsDashboard />);

    expect(screen.getByRole("heading", { name: /mis evaluaciones/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/sin evaluaciones registradas/i)).toBeInTheDocument();
    });
  });
});
