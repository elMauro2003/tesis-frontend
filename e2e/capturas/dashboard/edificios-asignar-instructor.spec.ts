import { test, expect } from "@playwright/test";
import { authenticateAs } from "../../fixtures/auth";
import { setupInfrastructureScenario } from "../../fixtures/infrastructure-mocks";
import { capturarPaso, capturarViewport } from "../../helpers/capturas";
import { abrirMenuAccionesEdificio } from "../../helpers/edificios";

const MODULO = "dashboard/edificios/asignar-instructor";

test.describe("Capturas — Asignar instructor", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page, ["directivo"]);
  });

  test("cp-ins-01-modal-con-alas", async ({ page }) => {
    const caso = "cp-ins-01-modal-con-alas";
    await setupInfrastructureScenario(page, "listado-basico");

    await page.goto("/dashboard/edificios");
    await abrirMenuAccionesEdificio(page, "Edificio A");
    await page.getByRole("menuitem", { name: /asignar instructor/i }).click();

    await expect(page.getByRole("heading", { name: /asignar instructor/i })).toBeVisible();
    await expect(page.getByText(/ala a supervisar/i)).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "modal-asignar-instructor",
      descripcion: "Modal de asignación con selector de ala",
    });

    await page.getByRole("combobox", { name: /seleccionar ala/i }).click();
    await expect(page.getByRole("option", { name: /ala norte/i })).toBeVisible();

    await capturarViewport(page, MODULO, caso, {
      orden: "02",
      nombre: "selector-alas",
      descripcion: "Listado de alas del edificio",
    });
  });

  test("cp-ins-02-edificio-sin-alas", async ({ page }) => {
    const caso = "cp-ins-02-edificio-sin-alas";
    await setupInfrastructureScenario(page, "edificio-sin-alas");

    await page.goto("/dashboard/edificios");
    await abrirMenuAccionesEdificio(page, "Edificio B");
    await page.getByRole("menuitem", { name: /asignar instructor/i }).click();

    await expect(page.getByText(/este edificio no tiene alas/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /registrar ala/i })).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "estado-sin-alas",
      descripcion: "Estado vacío cuando el edificio no tiene alas",
    });
  });

  test("cp-ins-03-busqueda-instructores", async ({ page }) => {
    const caso = "cp-ins-03-busqueda-instructores";
    await setupInfrastructureScenario(page, "listado-basico");

    await page.goto("/dashboard/edificios");
    await abrirMenuAccionesEdificio(page, "Edificio A");
    await page.getByRole("menuitem", { name: /asignar instructor/i }).click();

    await page.getByRole("combobox", { name: /seleccionar ala/i }).click();
    await page.getByRole("option", { name: /ala norte/i }).click();

    await expect(page.getByText(/instructores disponibles/i)).toBeVisible();
    await expect(page.getByText("Prof. Ana Martínez")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "listado-instructores",
      descripcion: "Búsqueda y selección de instructor",
    });
  });
});
