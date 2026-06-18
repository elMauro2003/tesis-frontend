import { test, expect } from "@playwright/test";
import { authenticateAs } from "../../fixtures/auth";
import { setupInfrastructureScenario } from "../../fixtures/infrastructure-mocks";
import { capturarPaso, capturarViewport } from "../../helpers/capturas";
import { consultarEdificio, solicitarEliminarAla } from "../../helpers/edificios";

const MODULO = "dashboard/edificios/eliminar-ala";

test.describe("Capturas — Eliminar ala (cascada)", () => {
  test.beforeEach(async ({ page }) => {
    await authenticateAs(page, ["directivo"]);
  });

  test("cp-elim-01-ala-sin-dependencias-bloqueantes", async ({ page }) => {
    const caso = "cp-elim-01-ala-sin-dependencias";
    await setupInfrastructureScenario(page, "ala-sin-dependencias");

    await page.goto("/dashboard/edificios");
    await expect(page.getByText("Edificio A")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "listado-edificios",
      descripcion: "Edificio con alas antes de eliminar",
    });

    await consultarEdificio(page, "Edificio A");
    await expect(page.getByRole("dialog")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "02",
      nombre: "panel-consulta-alas",
      descripcion: "Panel con alas disponibles para eliminar",
    });

    await solicitarEliminarAla(page, "Ala Norte");
    await expect(page.getByRole("heading", { name: /eliminar ala/i })).toBeVisible();
    await expect(page.getByText(/recursos vinculados/i)).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "03",
      nombre: "modal-eliminar-ala",
      descripcion: "Modal con resumen de dependencias",
    });

    await capturarViewport(page, MODULO, caso, {
      orden: "04",
      nombre: "detalle-cascada-habilitada",
      descripcion: "Botón eliminar habilitado cuando no hay asignaciones",
    });
  });

  test("cp-elim-02-ala-bloqueada-por-asignaciones", async ({ page }) => {
    const caso = "cp-elim-02-ala-bloqueada-asignaciones";
    await setupInfrastructureScenario(page, "ala-bloqueada-asignaciones");

    await page.goto("/dashboard/edificios");
    await consultarEdificio(page, "Edificio A");
    await solicitarEliminarAla(page, "Ala Norte");

    await expect(page.getByText(/eliminación bloqueada por la api/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /eliminar ala/i })).toBeDisabled();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "modal-bloqueado",
      descripcion: "Modal impide eliminar por historial de asignaciones",
    });

    await capturarViewport(page, MODULO, caso, {
      orden: "02",
      nombre: "aviso-cuartos-bloqueados",
      descripcion: "Aviso con cuartos que tienen asignaciones registradas",
    });
  });

  test("cp-elim-03-ala-con-responsable-sin-asignaciones", async ({ page }) => {
    const caso = "cp-elim-03-ala-con-responsable";
    await setupInfrastructureScenario(page, "ala-con-responsable");

    await page.goto("/dashboard/edificios");
    await consultarEdificio(page, "Edificio A");
    await solicitarEliminarAla(page, "Ala Norte");

    await expect(page.getByText(/responsable actual/i)).toBeVisible();
    await expect(page.getByText("Prof. Ana Martínez")).toBeVisible();

    await capturarPaso(page, MODULO, caso, {
      orden: "01",
      nombre: "modal-con-responsable",
      descripcion: "Modal muestra instructor asignado al ala",
    });
  });
});
