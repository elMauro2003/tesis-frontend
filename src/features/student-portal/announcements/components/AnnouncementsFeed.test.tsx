import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { AnnouncementsFeed } from "@/features/student-portal/announcements/components/AnnouncementsFeed";
import { mockInfiniteQueryResult, renderWithPortalProviders } from "@/test/test-utils";

vi.mock("@/features/student-portal/announcements/hooks/usePublicAnnouncements", () => ({
  usePublicAnnouncements: vi.fn(),
}));

import { usePublicAnnouncements } from "@/features/student-portal/announcements/hooks/usePublicAnnouncements";

describe("AnnouncementsFeed", () => {
  it("muestra tablón vacío sin anuncios públicos", async () => {
    vi.mocked(usePublicAnnouncements).mockReturnValue(
      mockInfiniteQueryResult() as ReturnType<typeof usePublicAnnouncements>
    );

    renderWithPortalProviders(<AnnouncementsFeed />);

    expect(screen.getByRole("heading", { name: /tablón de anuncios/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/sin comunicados vigentes/i)).toBeInTheDocument();
    });
  });
});
