import { describe, expect, it } from "vitest";
import {
  canAccessRoute,
  getNavItemsForRoles,
  getDefaultRouteForRoles,
} from "@/configs/permissions";
import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";

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
});
