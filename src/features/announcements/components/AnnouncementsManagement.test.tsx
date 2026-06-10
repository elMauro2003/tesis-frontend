import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AnnouncementsManagement } from "@/features/announcements/components/AnnouncementsManagement";
import { communicationService } from "@/core/services/communication.service";
import { emptyPaginated, renderWithProviders } from "@/test/test-utils";

vi.mock("@/core/services/communication.service", () => ({
  communicationService: {
    getAllInformations: vi.fn(),
  },
}));

describe("AnnouncementsManagement", () => {
  beforeEach(() => {
    vi.mocked(communicationService.getAllInformations).mockResolvedValue(emptyPaginated());
  });

  it("renderiza el tablón de anuncios para directivo", async () => {
    renderWithProviders(<AnnouncementsManagement />);

    expect(screen.getByRole("heading", { name: /tablón de anuncios/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/el tablón está vacío/i)).toBeInTheDocument();
    });
  });
});
