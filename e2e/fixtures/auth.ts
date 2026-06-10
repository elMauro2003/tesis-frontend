import type { Page } from "@playwright/test";

type Role =
  | "estudiante"
  | "instructor"
  | "directivo"
  | "subdirector"
  | "comunicador"
  | "decano"
  | "ppa"
  | "pg"
  | "admin";

const APP_ORIGIN = "http://localhost:3000";

function encodeBase64Url(value: string) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createMockAccessToken(roles: Role[]) {
  const header = encodeBase64Url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = encodeBase64Url(JSON.stringify({ roles }));
  return `${header}.${payload}.test-signature`;
}

export const mockDirectivoUser = {
  id: 1,
  username: "directivo.test",
  email: "directivo@uclv.cu",
  roles: ["directivo"] as Role[],
};

export const mockEstudianteUser = {
  id: 10,
  username: "estudiante.test",
  email: "estudiante@uclv.cu",
  roles: ["estudiante"] as Role[],
};

export async function authenticateAs(page: Page, roles: Role[] = ["directivo"]) {
  const accessToken = createMockAccessToken(roles);

  await page.context().addCookies([
    { name: "auth_session", value: "1", url: `${APP_ORIGIN}/` },
    { name: "user_roles", value: roles.join(","), url: `${APP_ORIGIN}/` },
    { name: "access_token", value: accessToken, url: `${APP_ORIGIN}/` },
  ]);

  await page.addInitScript((token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", "refresh-test-token");
  }, accessToken);
}

export async function authenticateAsStudent(page: Page) {
  return authenticateAs(page, ["estudiante"]);
}
