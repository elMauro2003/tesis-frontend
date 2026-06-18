import { test, expect } from "@playwright/test";
import { authenticateAs } from "../../fixtures/auth";
import { setupInfrastructureScenario } from "../../fixtures/infrastructure-mocks";
import { capturarPaso } from "../../helpers/capturas";

const MODULO = "dashboard/navegacion";

test.describe("Capturas — Navegación del dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupInfrastructureScenario(page, "listado-basico");
    await authenticateAs(page, ["directivo"]);
  });

  const pestanas = [
    { caso: "cp-nav-01-reportes", path: "/dashboard/reportes", titulo: /resumen de ocupación/i },
    { caso: "cp-nav-02-sedes", path: "/dashboard/sedes", titulo: /^sedes$/i },
    { caso: "cp-nav-03-edificios", path: "/dashboard/edificios", titulo: /^edificios$/i },
    { caso: "cp-nav-04-cuartos", path: "/dashboard/cuartos", titulo: /^cuartos$/i },
    { caso: "cp-nav-05-estudiantes", path: "/dashboard/estudiantes", titulo: /^estudiantes$/i },
    { caso: "cp-nav-06-quejas", path: "/dashboard/quejas", titulo: /^quejas$/i },
    { caso: "cp-nav-07-anuncios", path: "/dashboard/anuncios", titulo: /tablón de anuncios/i },
  ];

  for (const pestana of pestanas) {
    test(pestana.caso, async ({ page }) => {
      await page.goto(pestana.path);
      await expect(page.getByRole("heading", { name: pestana.titulo })).toBeVisible();

      await capturarPaso(page, MODULO, pestana.caso, {
        orden: "01",
        nombre: "vista-completa",
        descripcion: `Pestaña ${pestana.path} cargada correctamente`,
      });
    });
  }
});
