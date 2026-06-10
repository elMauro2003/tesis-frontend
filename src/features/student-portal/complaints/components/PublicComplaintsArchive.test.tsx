import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { PublicComplaintsArchive } from "@/features/student-portal/complaints/components/PublicComplaintsArchive";
import { emptyPaginated, renderWithPortalProviders } from "@/test/test-utils";

vi.mock("@/features/student-portal/complaints/hooks/useAllPublicComplaints", () => ({
  useAllPublicComplaints: vi.fn(),
}));

import { useAllPublicComplaints } from "@/features/student-portal/complaints/hooks/useAllPublicComplaints";

describe("PublicComplaintsArchive", () => {
  it("renderiza el archivo público vacío", async () => {
    vi.mocked(useAllPublicComplaints).mockReturnValue({
      data: emptyPaginated(),
      isLoading: false,
      isError: false,
      isFetching: false,
      refetch: vi.fn(),
    } as ReturnType<typeof useAllPublicComplaints>);

    renderWithPortalProviders(<PublicComplaintsArchive />);

    expect(screen.getByRole("heading", { name: /archivo público de quejas/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/aún no hay quejas públicas/i)).toBeInTheDocument();
    });
  });
});
