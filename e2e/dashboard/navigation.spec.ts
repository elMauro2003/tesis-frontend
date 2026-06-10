import { test, expect } from "@playwright/test";
import { authenticateAs } from "../fixtures/auth";
import { setupDashboardApiMocks } from "../fixtures/api-mocks";

test.describe("Dashboard navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupDashboardApiMocks(page);
    await authenticateAs(page, ["directivo"]);
  });

  const tabs = [
    { label: "Reportes", heading: /resumen de ocupación/i, path: "/dashboard/reportes" },
    { label: "Sedes", heading: /^sedes$/i, path: "/dashboard/sedes" },
    { label: "Edificios", heading: /^edificios$/i, path: "/dashboard/edificios" },
    { label: "Cuartos", heading: /^cuartos$/i, path: "/dashboard/cuartos" },
    { label: "Estudiantes", heading: /^estudiantes$/i, path: "/dashboard/estudiantes" },
    { label: "Quejas", heading: /^quejas$/i, path: "/dashboard/quejas" },
    { label: "Anuncios", heading: /tablón de anuncios/i, path: "/dashboard/anuncios" },
  ];

  for (const tab of tabs) {
    test(`carga la pestaña ${tab.label}`, async ({ page }) => {
      await page.goto(tab.path);
      await expect(page.getByRole("heading", { name: tab.heading })).toBeVisible();
      await expect(page.getByRole("link", { name: tab.label })).toBeVisible();
    });
  }

  test("no muestra la opción Settings en el sidebar", async ({ page }) => {
    await page.goto("/dashboard/reportes");
    await expect(page.getByText("Settings", { exact: true })).toHaveCount(0);
  });

  test("el botón de logout tiene cursor pointer", async ({ page }) => {
    await page.goto("/dashboard/reportes");
    const logoutButton = page.getByRole("button", { name: /logout/i });
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toHaveCSS("cursor", "pointer");
  });
});
