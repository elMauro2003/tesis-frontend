import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SitesManagement } from "@/features/sites/components/SitesManagement";
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
    getAllActiveRooms: vi.fn(),
  },
}));

describe("SitesManagement", () => {
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
    vi.mocked(infrastructureService.getAllActiveRooms).mockResolvedValue({
      ...emptyPaginated(),
      results: mockRooms,
      count: mockRooms.length,
    });
  });

  it("renderiza la cabecera y la sede cargada", async () => {
    renderWithProviders(<SitesManagement />);

    expect(screen.getByRole("heading", { level: 1, name: /^sedes$/i })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText("Sede Central")).toBeInTheDocument();
    });
  });

  it("filtra sedes por búsqueda", async () => {
    renderWithProviders(<SitesManagement />);

    await waitFor(() => {
      expect(screen.getByText("Sede Central")).toBeInTheDocument();
    });

    const search = screen.getByPlaceholderText(/buscar sede/i);
    await userEvent.type(search, "inexistente");

    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });
});
