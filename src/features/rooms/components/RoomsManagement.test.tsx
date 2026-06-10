import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { RoomsManagement } from "@/features/rooms/components/RoomsManagement";
import { infrastructureService } from "@/core/services/infrastructure.service";
import { accommodationService } from "@/core/services/accommodation.service";
import { emptyPaginated, renderWithProviders } from "@/test/test-utils";
import {
  mockBuildings,
  mockRooms,
  mockSites,
  mockWings,
} from "@/test/fixtures/infrastructure";

vi.mock("@/core/services/infrastructure.service", () => ({
  infrastructureService: {
    getRooms: vi.fn(),
    getAllSites: vi.fn(),
    getAllBuildings: vi.fn(),
    getAllWings: vi.fn(),
    getAllRooms: vi.fn(),
  },
}));

vi.mock("@/core/services/accommodation.service", () => ({
  accommodationService: {
    getAllActiveAssignments: vi.fn(),
  },
}));

describe("RoomsManagement", () => {
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
    vi.mocked(infrastructureService.getRooms).mockResolvedValue({
      ...emptyPaginated(),
      results: mockRooms,
      count: mockRooms.length,
    });
    vi.mocked(accommodationService.getAllActiveAssignments).mockResolvedValue(emptyPaginated());
  });

  it("renderiza la cabecera y el cuarto cargado", async () => {
    renderWithProviders(<RoomsManagement />);

    expect(screen.getByRole("heading", { name: /^cuartos$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("101")).toBeInTheDocument();
    });
  });
});
