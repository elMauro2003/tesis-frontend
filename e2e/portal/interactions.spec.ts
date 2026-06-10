import { test, expect } from "@playwright/test";
import { authenticateAsStudent } from "../fixtures/auth";
import { setupPortalApiMocks } from "../fixtures/api-mocks";

test.describe("Portal interactions", () => {
  test.beforeEach(async ({ page }) => {
    await setupPortalApiMocks(page);
    await authenticateAsStudent(page);
  });

  test("evaluaciones muestra estado vacío", async ({ page }) => {
    await page.goto("/portal/evaluaciones");
    await expect(page.getByText(/sin evaluaciones registradas/i)).toBeVisible();
  });

  test("quejas muestra estado vacío y cupo diario", async ({ page }) => {
    await page.goto("/portal/quejas");
    await expect(page.getByText(/no hay quejas registradas/i)).toBeVisible();
    await expect(page.getByText(/quejas disponibles hoy/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /nueva queja/i })).toBeVisible();
  });

  test("anuncios muestra tablón vacío", async ({ page }) => {
    await page.goto("/portal/anuncios");
    await expect(page.getByText(/sin comunicados vigentes/i)).toBeVisible();
  });

  test("archivo público de quejas está accesible", async ({ page }) => {
    await page.goto("/portal/quejas/visibles");
    await expect(page.getByRole("heading", { name: /archivo público de quejas/i })).toBeVisible();
    await expect(page.getByText(/aún no hay quejas públicas/i)).toBeVisible();
  });

  test("nueva queja muestra el formulario cuando hay cupo", async ({ page }) => {
    await page.goto("/portal/quejas/nueva");
    await expect(page.getByText(/nueva queja/i).first()).toBeVisible();
  });

  test("cerrar sesión tiene cursor pointer en el menú de usuario", async ({ page }) => {
    await page.goto("/portal/evaluaciones");
    await page.getByRole("button", { name: /menú de usuario/i }).click();
    const logoutItem = page.getByRole("menuitem", { name: /cerrar sesión/i });
    await expect(logoutItem).toBeVisible();
    await expect(logoutItem).toHaveCSS("cursor", "pointer");
  });
});
