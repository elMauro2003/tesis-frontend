import { test, expect } from "@playwright/test";
import { authenticateAs } from "../../fixtures/auth";
import { setupInfrastructureScenario } from "../../fixtures/infrastructure-mocks";
import { capturarPaso, capturarViewport } from "../../helpers/capturas";
import { abrirMenuAccionesEdificio, consultarEdificio } from "../../helpers/edificios";

const MODULO = "dashboard/edificios";

test.describe("Capturas — Edificios (estados generales)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page, ["directivo"]);
  });

  test("cp-ed-01-estado-vacio", async ({ page }) => {
    const caso = "cp-ed-01-estado-vacio";
    await setupInfrastructureScenario(page, "vacio");

    await page.goto("/dashboard/edificios");
    await expect(page.getByText(/aún no hay edificios/i)).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "listado-vacio",
      descripcion: "Sin edificios registrados",
    });
  });

  test("cp-ed-02-listado-con-datos", async ({ page }) => {
    const caso = "cp-ed-02-listado-con-datos";
    await setupInfrastructureScenario(page, "listado-basico");

    await page.goto("/dashboard/edificios");
    await expect(page.getByText("Edificio A")).toBeVisible();
    await expect(page.getByText("Edificio B")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "listado-edificios",
      descripcion: "Tabla con edificios y métricas",
    });

    await abrirMenuAccionesEdificio(page, "Edificio A");
    await expect(page.getByRole("menuitem", { name: /asignar instructor/i })).toBeVisible();

    await capturarViewport(page, MODULO, caso, {
      orden: "02",
      nombre: "menu-acciones",
      descripcion: "Menú contextual con acciones del edificio",
    });
  });

  test("cp-ed-03-panel-consulta", async ({ page }) => {
    const caso = "cp-ed-03-panel-consulta";
    await setupInfrastructureScenario(page, "listado-basico");

    await page.goto("/dashboard/edificios");
    await consultarEdificio(page, "Edificio A");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByText("Ala Norte")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "panel-lateral-edificio",
      descripcion: "Panel de consulta con alas del edificio",
    });
  });
});
