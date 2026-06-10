import { test, expect } from "@playwright/test";
import { authenticateAsStudent } from "../fixtures/auth";
import { setupPortalApiMocks } from "../fixtures/api-mocks";

test.describe("Portal navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupPortalApiMocks(page);
    await authenticateAsStudent(page);
  });

  const tabs = [
    { label: "Evaluaciones", heading: /mis evaluaciones/i, path: "/portal/evaluaciones" },
    { label: "Quejas", heading: "Quejas", path: "/portal/quejas", headingLevel: 1 as const },
    { label: "Anuncios", heading: /tablón de anuncios/i, path: "/portal/anuncios" },
  ];

  for (const tab of tabs) {
    test(`carga la pestaña ${tab.label}`, async ({ page }) => {
      await page.goto(tab.path);
      const heading = tab.headingLevel
        ? page.getByRole("heading", { level: tab.headingLevel, name: tab.heading })
        : page.getByRole("heading", { name: tab.heading });
      await expect(heading).toBeVisible();
      await expect(page.getByRole("navigation").getByRole("link", { name: tab.label })).toBeVisible();
    });
  }

  test("muestra la cabecera del portal", async ({ page }) => {
    await page.goto("/portal/evaluaciones");
    await expect(page.getByRole("heading", { name: /uclv residencias/i })).toBeVisible();
  });

  test("redirige estudiante fuera del dashboard", async ({ page }) => {
    await page.goto("/dashboard/reportes");
    await expect(page).toHaveURL(/\/portal\/evaluaciones/);
  });
});
