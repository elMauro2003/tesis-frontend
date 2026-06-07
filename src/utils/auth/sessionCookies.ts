import { Role } from "@/types/auth";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const USER_ROLES_COOKIE = "user_roles";
export const AUTH_SESSION_COOKIE = "auth_session";

const ACCESS_MAX_AGE_SECONDS = 15 * 60;
const SESSION_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

export const ALL_ROLES: readonly Role[] = [
  "estudiante",
  "instructor",
  "directivo",
  "subdirector",
  "comunicador",
  "decano",
  "ppa",
  "pg",
  "admin",
];

const isRole = (value: string): value is Role => ALL_ROLES.includes(value as Role);

const getCookieSecuritySuffix = () => {
  if (typeof window === "undefined") {
    return "";
  }

  return window.location.protocol === "https:" ? "; Secure" : "";
};

const writeCookie = (name: string, value: string, maxAgeSeconds: number) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${getCookieSecuritySuffix()}`;
};

const clearCookie = (name: string) => {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${name}=; path=/; max-age=0`;
};

export function setAuthSessionCookies(accessToken: string, roles: Role[]) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_MAX_AGE_SECONDS);
  writeCookie(USER_ROLES_COOKIE, roles.join(","), SESSION_MAX_AGE_SECONDS);
  writeCookie(AUTH_SESSION_COOKIE, "1", SESSION_MAX_AGE_SECONDS);
}

export function syncAccessTokenCookie(accessToken: string) {
  writeCookie(ACCESS_TOKEN_COOKIE, accessToken, ACCESS_MAX_AGE_SECONDS);
}

export function clearAuthSessionCookies() {
  clearCookie(ACCESS_TOKEN_COOKIE);
  clearCookie(USER_ROLES_COOKIE);
  clearCookie(AUTH_SESSION_COOKIE);
}

export function parseRolesCookie(value: string | undefined): Role[] {
  if (!value) {
    return [];
  }

  return decodeURIComponent(value)
    .split(",")
    .map((role) => role.trim())
    .filter(isRole);
}

export function parseRolesFromAccessToken(token: string): Role[] {
  try {
    const [, payloadSegment] = token.split(".");
    if (!payloadSegment) {
      return [];
    }

    const normalized = payloadSegment.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(normalized)) as { roles?: unknown };
    const roles = payload.roles;

    if (!Array.isArray(roles)) {
      return [];
    }

    return roles.filter((role): role is Role => typeof role === "string" && isRole(role));
  } catch {
    return [];
  }
}

export function resolveRolesFromCookies(
  rolesCookie: string | undefined,
  accessTokenCookie: string | undefined
): Role[] {
  const rolesFromCookie = parseRolesCookie(rolesCookie);
  if (rolesFromCookie.length > 0) {
    return rolesFromCookie;
  }

  if (!accessTokenCookie) {
    return [];
  }

  return parseRolesFromAccessToken(decodeURIComponent(accessTokenCookie));
}
