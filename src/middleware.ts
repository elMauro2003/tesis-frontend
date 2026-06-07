import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  canAccessRoute,
  getDefaultRouteForRoles,
  isDashboardRoute,
  isPortalRoute,
  isStudentOnly,
} from "@/configs/permissions";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { PUBLIC_ROUTES } from "@/configs/routes";
import {
  ACCESS_TOKEN_COOKIE,
  AUTH_SESSION_COOKIE,
  USER_ROLES_COOKIE,
  resolveRolesFromCookies,
} from "@/utils/auth/sessionCookies";

function hasAuthSession(request: NextRequest): boolean {
  return (
    request.cookies.get(AUTH_SESSION_COOKIE)?.value === "1" ||
    Boolean(request.cookies.get(ACCESS_TOKEN_COOKIE)?.value)
  );
}

function resolveRequestRoles(request: NextRequest) {
  return resolveRolesFromCookies(
    request.cookies.get(USER_ROLES_COOKIE)?.value,
    request.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const isProtectedRoute = isDashboardRoute(pathname) || isPortalRoute(pathname);

  if (!isPublicRoute && !isProtectedRoute) {
    return NextResponse.next();
  }

  const hasSession = hasAuthSession(request);
  const roles = resolveRequestRoles(request);

  if (isPublicRoute) {
    if (hasSession && roles.length > 0) {
      return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url));
    }

    return NextResponse.next();
  }

  if (!hasSession) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (roles.length > 0) {
    if (isStudentOnly(roles) && isDashboardRoute(pathname)) {
      return NextResponse.redirect(new URL(PORTAL_ROUTES.home, request.url));
    }

    if (!isStudentOnly(roles) && isPortalRoute(pathname)) {
      return NextResponse.redirect(new URL(getDefaultRouteForRoles(roles), request.url));
    }

    if (!canAccessRoute(pathname, roles)) {
      const fallbackUrl = new URL(getDefaultRouteForRoles(roles), request.url);
      fallbackUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(fallbackUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/portal/:path*", "/auth/:path*"],
};
