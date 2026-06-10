import { describe, expect, it } from "vitest";
import {
  canAccessRoute,
  getNavItemsForRoles,
  getDefaultRouteForRoles,
  getPortalNavItemsForRoles,
} from "@/configs/permissions";
import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";

describe("permissions", () => {
  it("expone todas las pestañas del dashboard para directivo", () => {
    const items = getNavItemsForRoles(["directivo"]);
    const hrefs = items.map((item) => item.href);

    expect(hrefs).toContain(DASHBOARD_ROUTES.reportes);
    expect(hrefs).toContain(DASHBOARD_ROUTES.sedes);
    expect(hrefs).toContain(DASHBOARD_ROUTES.edificios);
    expect(hrefs).toContain(DASHBOARD_ROUTES.cuartos);
    expect(hrefs).toContain(DASHBOARD_ROUTES.estudiantes);
    expect(hrefs).toContain(DASHBOARD_ROUTES.quejas);
    expect(hrefs).toContain(DASHBOARD_ROUTES.anuncios);
  });

  it("restringe reportes y sedes a roles directivos", () => {
    expect(canAccessRoute(DASHBOARD_ROUTES.reportes, ["instructor"])).toBe(false);
    expect(canAccessRoute(DASHBOARD_ROUTES.sedes, ["instructor"])).toBe(false);
    expect(canAccessRoute(DASHBOARD_ROUTES.estudiantes, ["instructor"])).toBe(true);
  });

  it("permite quejas solo a subdirector, directivo y admin", () => {
    expect(canAccessRoute(DASHBOARD_ROUTES.quejas, ["subdirector"])).toBe(true);
    expect(canAccessRoute(DASHBOARD_ROUTES.quejas, ["instructor"])).toBe(false);
  });

  it("redirige subdirector a quejas por defecto", () => {
    expect(getDefaultRouteForRoles(["subdirector"])).toBe(DASHBOARD_ROUTES.quejas);
  });

  it("expone las pestañas del portal para estudiante", () => {
    const items = getPortalNavItemsForRoles(["estudiante"]);
    const hrefs = items.map((item) => item.href);

    expect(hrefs).toContain(PORTAL_ROUTES.evaluaciones);
    expect(hrefs).toContain(PORTAL_ROUTES.quejas);
    expect(hrefs).toContain(PORTAL_ROUTES.anuncios);
  });

  it("bloquea el dashboard a estudiantes", () => {
    expect(canAccessRoute(DASHBOARD_ROUTES.reportes, ["estudiante"])).toBe(false);
    expect(canAccessRoute(PORTAL_ROUTES.evaluaciones, ["estudiante"])).toBe(true);
  });
});
