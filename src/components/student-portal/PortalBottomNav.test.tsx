import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { PortalBottomNav } from "@/components/student-portal/PortalBottomNav";
import { renderWithPortalProviders } from "@/test/test-utils";

describe("PortalBottomNav", () => {
  it("muestra las tres pestañas del portal estudiantil", () => {
    renderWithPortalProviders(<PortalBottomNav />);

    expect(screen.getByRole("link", { name: /evaluaciones/i })).toHaveAttribute("href", "/portal/evaluaciones");
    expect(screen.getByRole("link", { name: /quejas/i })).toHaveAttribute("href", "/portal/quejas");
    expect(screen.getByRole("link", { name: /anuncios/i })).toHaveAttribute("href", "/portal/anuncios");
  });
});
