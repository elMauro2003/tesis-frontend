import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { renderWithProviders, mockDirectivoUser } from "@/test/test-utils";
import { useAuthStore } from "@/store/useAuthStore";

describe("DashboardLayout", () => {
  it("muestra las pestañas del dashboard según el rol", () => {
    renderWithProviders(
      <DashboardLayout>
        <div>Contenido</div>
      </DashboardLayout>
    );

    expect(screen.getByRole("link", { name: /reportes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /sedes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /edificios/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /cuartos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /estudiantes/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /quejas/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /anuncios/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /settings/i })).not.toBeInTheDocument();
  });

  it("muestra cursor pointer en cerrar sesión y ejecuta logout", async () => {
    const logoutSpy = vi.fn();
    useAuthStore.setState({ logout: logoutSpy });

    renderWithProviders(
      <DashboardLayout>
        <div>Contenido</div>
      </DashboardLayout>,
      { user: mockDirectivoUser }
    );

    const logoutButton = screen.getByRole("button", { name: /logout/i });
    expect(logoutButton).toHaveClass("cursor-pointer");

    await userEvent.click(logoutButton);
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
