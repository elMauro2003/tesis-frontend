import type { Page, Route } from "@playwright/test";
import { mockDirectivoUser } from "./auth";
import {
  alaNorte,
  alaSur,
  asignacionActivaCuarto102,
  asignacionHistoricaCuarto102,
  cuarteleria101,
  cuarto101,
  cuarto102,
  edificioA,
  edificioB,
  profesorGuia,
  profesorSinRol,
  responsableAlaNorte,
  sedeCentral,
} from "./infrastructure-data";

type Paginated<T> = {
  count: number;
  next: null;
  previous: null;
  results: T[];
};

export type InfrastructureScenario =
  | "vacio"
  | "listado-basico"
  | "ala-sin-dependencias"
  | "ala-bloqueada-asignaciones"
  | "ala-con-responsable"
  | "edificio-sin-alas";

const paginated = <T>(results: T[]): Paginated<T> => ({
  count: results.length,
  next: null,
  previous: null,
  results,
});

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

function getQueryParam(url: string, key: string): string | null {
  try {
    return new URL(url).searchParams.get(key);
  } catch {
    return null;
  }
}

function filterByBuilding<T extends { building: number }>(items: T[], buildingId: string | null) {
  if (!buildingId) return items;
  return items.filter((item) => String(item.building) === buildingId);
}

function filterByWing<T extends { wing: number }>(items: T[], wingId: string | null) {
  if (!wingId) return items;
  return items.filter((item) => String(item.wing) === wingId);
}

function filterByRoom<T extends { room: number }>(items: T[], roomId: string | null) {
  if (!roomId) return items;
  return items.filter((item) => String(item.room) === roomId);
}

function filterAssignmentsByWing(
  assignments: typeof asignacionActivaCuarto102[],
  wingId: string | null,
  rooms: Array<{ id: number; wing: number }>
) {
  if (!wingId) return assignments;
  const roomIds = new Set(rooms.filter((room) => String(room.wing) === wingId).map((room) => room.id));
  return assignments.filter((assignment) => roomIds.has(assignment.room));
}

function filterAssignmentsByBuilding(
  assignments: typeof asignacionActivaCuarto102[],
  buildingId: string | null,
  rooms: Array<{ id: number; wing: number }>,
  wings: Array<{ id: number; building: number }>
) {
  if (!buildingId) return assignments;
  const wingIds = new Set(wings.filter((wing) => String(wing.building) === buildingId).map((wing) => wing.id));
  const roomIds = new Set(rooms.filter((room) => wingIds.has(room.wing)).map((room) => room.id));
  return assignments.filter((assignment) => roomIds.has(assignment.room));
}

function getScenarioData(scenario: InfrastructureScenario) {
  switch (scenario) {
    case "vacio":
      return {
        sites: [] as typeof sedeCentral[],
        buildings: [] as typeof edificioA[],
        wings: [] as typeof alaNorte[],
        rooms: [] as typeof cuarto101[],
        assignments: [] as typeof asignacionActivaCuarto102[],
        duties: [] as typeof cuarteleria101[],
        professors: [] as typeof profesorGuia[],
        wingSupervisors: new Map<number, typeof responsableAlaNorte>(),
      };

    case "listado-basico":
      return {
        sites: [sedeCentral],
        buildings: [edificioA, edificioB],
        wings: [alaNorte, alaSur],
        rooms: [cuarto101, cuarto102],
        assignments: [],
        duties: [],
        professors: [profesorGuia, profesorSinRol],
        wingSupervisors: new Map<number, typeof responsableAlaNorte>(),
      };

    case "ala-sin-dependencias":
      return {
        sites: [sedeCentral],
        buildings: [edificioA],
        wings: [alaNorte, alaSur],
        rooms: [cuarto101],
        assignments: [],
        duties: [cuarteleria101],
        professors: [profesorSinRol],
        wingSupervisors: new Map<number, typeof responsableAlaNorte>(),
      };

    case "ala-bloqueada-asignaciones":
      return {
        sites: [sedeCentral],
        buildings: [edificioA],
        wings: [alaNorte],
        rooms: [cuarto102],
        assignments: [asignacionActivaCuarto102, asignacionHistoricaCuarto102],
        duties: [],
        professors: [profesorSinRol],
        wingSupervisors: new Map<number, typeof responsableAlaNorte>(),
      };

    case "ala-con-responsable":
      return {
        sites: [sedeCentral],
        buildings: [edificioA],
        wings: [alaNorte],
        rooms: [cuarto101],
        assignments: [],
        duties: [],
        professors: [profesorGuia, profesorSinRol],
        wingSupervisors: new Map([[alaNorte.id, responsableAlaNorte]]),
      };

    case "edificio-sin-alas":
      return {
        sites: [sedeCentral],
        buildings: [edificioB],
        wings: [],
        rooms: [],
        assignments: [],
        duties: [],
        professors: [profesorSinRol],
        wingSupervisors: new Map<number, typeof responsableAlaNorte>(),
      };
  }
}

export async function setupInfrastructureScenario(page: Page, scenario: InfrastructureScenario) {
  const data = getScenarioData(scenario);

  await page.route(/\/api\/v1\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/me")) {
      return fulfillJson(route, mockDirectivoUser);
    }

    if (url.includes("/auth/refresh")) {
      return fulfillJson(route, { access: "refreshed-token" });
    }

    if (url.includes("/auth/logout") && method === "POST") {
      return fulfillJson(route, {});
    }

    if (url.includes("/sedes/") && method === "GET") {
      return fulfillJson(route, paginated(data.sites));
    }

    if (url.includes("/edificios/") && method === "GET") {
      const siteId = getQueryParam(url, "site");
      const buildings = siteId
        ? data.buildings.filter((building) => String(building.site) === siteId)
        : data.buildings;
      return fulfillJson(route, paginated(buildings));
    }

    if (url.includes("/alas/") && method === "GET") {
      const buildingId = getQueryParam(url, "building");
      return fulfillJson(route, paginated(filterByBuilding(data.wings, buildingId)));
    }

    if (url.includes("/cuartos/") && method === "GET") {
      const wingId = getQueryParam(url, "wing");
      const buildingId = getQueryParam(url, "wing__building");
      let rooms = data.rooms;

      if (wingId) {
        rooms = filterByWing(rooms, wingId);
      } else if (buildingId) {
        const wingIds = new Set(
          data.wings.filter((wing) => String(wing.building) === buildingId).map((wing) => wing.id)
        );
        rooms = rooms.filter((room) => wingIds.has(room.wing));
      }

      return fulfillJson(route, paginated(rooms));
    }

    if (url.includes("/asignaciones/activas")) {
      const activas = data.assignments.filter((assignment) => assignment.is_active);
      return fulfillJson(route, paginated(activas));
    }

    if (url.includes("/asignaciones/") && method === "GET") {
      const roomId = getQueryParam(url, "room");
      const wingId = getQueryParam(url, "room__wing");
      const buildingId = getQueryParam(url, "room__wing__building");

      let assignments = data.assignments;
      if (roomId) assignments = filterByRoom(assignments, roomId);
      else if (wingId) assignments = filterAssignmentsByWing(assignments, wingId, data.rooms);
      else if (buildingId) assignments = filterAssignmentsByBuilding(assignments, buildingId, data.rooms, data.wings);

      return fulfillJson(route, paginated(assignments));
    }

    if (url.includes("/cuartelerias/") && method === "GET") {
      const roomId = getQueryParam(url, "room");
      const wingId = getQueryParam(url, "room__wing");
      let duties = data.duties;

      if (roomId) duties = filterByRoom(duties, roomId);
      else if (wingId) {
        const roomIds = new Set(data.rooms.filter((room) => String(room.wing) === wingId).map((room) => room.id));
        duties = duties.filter((duty) => roomIds.has(duty.room));
      }

      return fulfillJson(route, paginated(duties));
    }

    if (url.includes("/profesores/") && url.includes("/responsable-ala/")) {
      const match = url.match(/\/profesores\/(\d+)\/responsable-ala\//);
      const professorId = match ? Number(match[1]) : null;

      if (method === "GET") {
        for (const supervisor of data.wingSupervisors.values()) {
          if (supervisor.professor === professorId) {
            return fulfillJson(route, supervisor);
          }
        }
        return fulfillJson(route, { error: { message: "No encontrado" } }, 404);
      }

      if (method === "DELETE" || method === "POST") {
        return fulfillJson(route, {});
      }
    }

    if (url.includes("/profesores/") && method === "GET") {
      return fulfillJson(route, paginated(data.professors));
    }

    if (method === "GET") {
      return fulfillJson(route, paginated([]));
    }

    if (["POST", "PATCH", "PUT", "DELETE"].includes(method)) {
      return fulfillJson(route, {}, method === "DELETE" ? 204 : 200);
    }

    return route.continue();
  });
}
