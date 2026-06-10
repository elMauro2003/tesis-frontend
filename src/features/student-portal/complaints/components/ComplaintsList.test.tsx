import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { ComplaintsList } from "@/features/student-portal/complaints/components/ComplaintsList";
import { mockInfiniteQueryResult, renderWithPortalProviders } from "@/test/test-utils";

vi.mock("@/features/student-portal/complaints/hooks/useMyComplaints", () => ({
  useMyComplaints: vi.fn(),
}));

vi.mock("@/features/student-portal/complaints/hooks/usePublicComplaints", () => ({
  usePublicComplaints: vi.fn(),
}));

vi.mock("@/features/student-portal/complaints/hooks/useDailyComplaintQuota", () => ({
  useDailyComplaintQuota: vi.fn(),
}));

import { useMyComplaints } from "@/features/student-portal/complaints/hooks/useMyComplaints";
import { usePublicComplaints } from "@/features/student-portal/complaints/hooks/usePublicComplaints";
import { useDailyComplaintQuota } from "@/features/student-portal/complaints/hooks/useDailyComplaintQuota";

describe("ComplaintsList", () => {
  it("muestra quejas vacías y cupo diario disponible", async () => {
    vi.mocked(useMyComplaints).mockReturnValue(mockInfiniteQueryResult() as ReturnType<typeof useMyComplaints>);
    vi.mocked(usePublicComplaints).mockReturnValue(mockInfiniteQueryResult() as ReturnType<typeof usePublicComplaints>);
    vi.mocked(useDailyComplaintQuota).mockReturnValue({
      todayCount: 0,
      remainingToday: 3,
      canCreate: true,
      limit: 3,
      isLoading: false,
      isReady: true,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithPortalProviders(<ComplaintsList />);

    expect(screen.getByRole("heading", { name: /^quejas$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no hay quejas registradas/i)).toBeInTheDocument();
      expect(screen.getByText(/quejas disponibles hoy: 3 de 3/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /nueva queja/i })).toBeInTheDocument();
      expect(screen.getByText(/sin quejas visibles/i)).toBeInTheDocument();
    });
  });
});
