import type { Page } from "@playwright/test";

/** Abre el panel lateral de consulta de un edificio desde la tabla. */
export async function consultarEdificio(page: Page, nombreEdificio: string) {
  const fila = page.locator("tr", { hasText: nombreEdificio });
  await fila.getByTitle("Consultar").click();
}

/** Abre el menú de acciones de un edificio desde la tabla. */
export async function abrirMenuAccionesEdificio(page: Page, nombreEdificio: string) {
  const fila = page.locator("tr", { hasText: nombreEdificio });
  await fila.getByRole("button", { name: "Más acciones" }).click();
}

/** Solicita eliminar un ala desde el panel de consulta abierto. */
export async function solicitarEliminarAla(page: Page, nombreAla: string) {
  await page.getByRole("button", { name: new RegExp(`quitar ala ${nombreAla}`, "i") }).click();
}
