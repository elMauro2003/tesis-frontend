import { mkdirSync } from "node:fs";
import path from "node:path";
import type { Page } from "@playwright/test";

/** Raíz de todas las capturas de casos de prueba. */
export const CAPTURAS_ROOT = path.join(process.cwd(), "docs/capturas");

export type CapturaPaso = {
  orden: string;
  nombre: string;
  descripcion?: string;
};

/**
 * Guarda una captura en:
 * docs/capturas/{modulo}/{caso}/{orden}-{nombre}.png
 */
export async function capturarPaso(
  page: Page,
  modulo: string,
  caso: string,
  paso: CapturaPaso,
  options?: { fullPage?: boolean; mask?: Parameters<Page["screenshot"]>[0]["mask"] }
) {
  const directorio = path.join(CAPTURAS_ROOT, modulo, caso);
  mkdirSync(directorio, { recursive: true });

  const archivo = `${paso.orden}-${paso.nombre}.png`;
  const rutaCompleta = path.join(directorio, archivo);

  await page.screenshot({
    path: rutaCompleta,
    fullPage: options?.fullPage ?? true,
    mask: options?.mask,
  });

  return rutaCompleta;
}

export async function capturarViewport(
  page: Page,
  modulo: string,
  caso: string,
  paso: CapturaPaso
) {
  return capturarPaso(page, modulo, caso, paso, { fullPage: false });
}
