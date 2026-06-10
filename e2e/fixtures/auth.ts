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

export async function authenticateAs(page: Page, roles: Role[] = ["directivo"]) {
  const accessToken = createMockAccessToken(roles);

  await page.context().addCookies([
    { name: "auth_session", value: "1", url: "http://127.0.0.1:3000/" },
    { name: "user_roles", value: roles.join(","), url: "http://127.0.0.1:3000/" },
    { name: "access_token", value: accessToken, url: "http://127.0.0.1:3000/" },
  ]);

  await page.addInitScript((token) => {
    localStorage.setItem("access_token", token);
    localStorage.setItem("refresh_token", "refresh-test-token");
  }, accessToken);
}
