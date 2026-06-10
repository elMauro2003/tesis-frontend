import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { ComplaintsManagement } from "@/features/complaints/components/ComplaintsManagement";
import { emptyPaginated, renderWithProviders, mockSubdirectorUser, mockInstructorUser } from "@/test/test-utils";

vi.mock("@/features/complaints/hooks/useComplaintsForRole", () => ({
  useComplaintsForRole: vi.fn(() => ({
    data: { ...emptyPaginated(), count: 0, results: [] },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  })),
}));

vi.mock("@/features/complaints/hooks/useDashboardComplaintBuildings", () => ({
  useDashboardComplaintBuildings: vi.fn(() => ({
    data: [],
    isLoading: false,
    isError: false,
  })),
}));

describe("ComplaintsManagement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("muestra la vista de quejas para subdirector", async () => {
    renderWithProviders(<ComplaintsManagement />, { user: mockSubdirectorUser });

    expect(screen.getByRole("heading", { name: /^quejas$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/no hay quejas registradas/i)).toBeInTheDocument();
    });
  });

  it("bloquea acceso a roles sin permiso", () => {
    renderWithProviders(<ComplaintsManagement />, { user: mockInstructorUser });

    expect(screen.getByText(/acceso no autorizado/i)).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /^quejas$/i })).not.toBeInTheDocument();
  });
});
