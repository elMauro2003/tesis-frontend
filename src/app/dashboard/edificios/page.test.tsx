import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import EdificiosPage from "@/app/dashboard/edificios/page";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { emptyPaginated, renderWithProviders } from "@/test/test-utils";
import {
  mockBuildings,
  mockRooms,
  mockSites,
  mockWings,
} from "@/test/fixtures/infrastructure";

vi.mock("@/core/services/infrastructure.service", () => ({
  infrastructureService: {
    getAllSites: vi.fn(),
    getAllBuildings: vi.fn(),
    getAllWings: vi.fn(),
    getAllRooms: vi.fn(),
  },
}));

describe("EdificiosPage", () => {
  beforeEach(() => {
    vi.mocked(infrastructureService.getAllSites).mockResolvedValue({
      ...emptyPaginated(),
      results: mockSites,
      count: mockSites.length,
    });
    vi.mocked(infrastructureService.getAllBuildings).mockResolvedValue({
      ...emptyPaginated(),
      results: mockBuildings,
      count: mockBuildings.length,
    });
    vi.mocked(infrastructureService.getAllWings).mockResolvedValue({
      ...emptyPaginated(),
      results: mockWings,
      count: mockWings.length,
    });
    vi.mocked(infrastructureService.getAllRooms).mockResolvedValue({
      ...emptyPaginated(),
      results: mockRooms,
      count: mockRooms.length,
    });
  });

  it("renderiza edificios y permite buscar", async () => {
    renderWithProviders(<EdificiosPage />);

    expect(screen.getByRole("heading", { name: /^edificios$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Edificio A")).toBeInTheDocument();
    });
  });
});
