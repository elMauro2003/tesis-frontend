import type { Page, Route } from "@playwright/test";
import { mockDirectivoUser } from "./auth";

type MockUser = {
  id: number;
  username: string;
  email: string;
  roles: string[];
};

const emptyPaginated = () => ({
  count: 0,
  next: null,
  previous: null,
  results: [],
});

async function fulfillJson(route: Route, body: unknown, status = 200) {
  await route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });
}

export async function setupApiMocks(page: Page, user: MockUser = mockDirectivoUser) {
  await page.route(/\/api\/v1\//, async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/me")) {
      return fulfillJson(route, user);
    }

    if (url.includes("/auth/logout") && method === "POST") {
      return fulfillJson(route, {});
    }

    if (url.includes("/auth/refresh")) {
      return fulfillJson(route, { access: "refreshed-token" });
    }

    if (method === "GET") {
      return fulfillJson(route, emptyPaginated());
    }

    return fulfillJson(route, {});
  });
}

export async function setupDashboardApiMocks(page: Page) {
  return setupApiMocks(page, mockDirectivoUser);
}

export const mockEstudianteUser = {
  id: 10,
  username: "estudiante.test",
  email: "estudiante@uclv.cu",
  roles: ["estudiante"],
};

export async function setupPortalApiMocks(page: Page) {
  return setupApiMocks(page, mockEstudianteUser);
}
