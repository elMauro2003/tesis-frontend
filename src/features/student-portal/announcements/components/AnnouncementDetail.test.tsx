import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AnnouncementDetail } from "@/features/student-portal/announcements/components/AnnouncementDetail";
import { communicationService } from "@/core/services/communication.service";
import { renderWithPortalProviders } from "@/test/test-utils";

vi.mock("@/core/services/communication.service", () => ({
  communicationService: {
    getInformationById: vi.fn(),
  },
}));

describe("AnnouncementDetail", () => {
  beforeEach(() => {
    vi.mocked(communicationService.getInformationById).mockRejectedValue(new Error("not found"));
  });

  it("muestra error cuando el anuncio no está disponible", async () => {
    renderWithPortalProviders(<AnnouncementDetail id={99} />);

    await waitFor(() => {
      expect(screen.getByText(/anuncio no disponible/i)).toBeInTheDocument();
    });

    expect(screen.getByRole("link", { name: /volver al tablón/i })).toHaveAttribute("href", "/portal/anuncios");
  });
});
