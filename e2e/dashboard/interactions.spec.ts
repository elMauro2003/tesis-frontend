import { test, expect } from "@playwright/test";
import { authenticateAs } from "../fixtures/auth";
import { setupDashboardApiMocks } from "../fixtures/api-mocks";

test.describe("Dashboard interactions", () => {
  test.beforeEach(async ({ page }) => {
    await setupDashboardApiMocks(page);
    await authenticateAs(page, ["directivo"]);
  });

  test("sedes muestra estado vacío cuando no hay datos", async ({ page }) => {
    await page.goto("/dashboard/sedes");
    await expect(page.getByText(/no hay sedes para mostrar/i)).toBeVisible();
  });

  test("edificios muestra estado vacío cuando no hay datos", async ({ page }) => {
    await page.goto("/dashboard/edificios");
    await expect(page.getByText(/aún no hay edificios/i)).toBeVisible();
  });

  test("quejas muestra estado vacío para subdirector", async ({ page }) => {
    await authenticateAs(page, ["subdirector"]);
    await page.goto("/dashboard/quejas");
    await expect(page.getByText(/no hay quejas registradas/i)).toBeVisible();
  });

  test("anuncios muestra tablón vacío", async ({ page }) => {
    await page.goto("/dashboard/anuncios");
    await expect(page.getByText(/el tablón está vacío/i)).toBeVisible();
  });

  test("reportes muestra métricas en cero sin datos", async ({ page }) => {
    await page.goto("/dashboard/reportes");
    await expect(page.getByRole("button", { name: /exportar informe/i })).toBeVisible();
    await expect(page.getByText("0").first()).toBeVisible();
  });
});
