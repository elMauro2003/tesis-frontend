import type { Page, Route } from "@playwright/test";
import { mockDirectivoUser } from "./auth";

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

export async function setupDashboardApiMocks(page: Page) {
  await page.route("**/api/v1/**", async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    if (url.includes("/auth/me")) {
      return fulfillJson(route, mockDirectivoUser);
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
