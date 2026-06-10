import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { PortalHeader } from "@/components/student-portal/PortalHeader";
import { renderWithPortalProviders } from "@/test/test-utils";

describe("PortalHeader", () => {
  it("muestra la marca y el menú de usuario", () => {
    renderWithPortalProviders(<PortalHeader />);

    expect(screen.getByRole("heading", { name: /uclv residencias/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /menú de usuario/i })).toBeInTheDocument();
  });
});
