import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";
import { canAccessRoute, getDefaultRouteForRoles } from "@/configs/permissions";
import { Role } from "@/types/auth";

/**
 * Definición de rutas públicas que no requieren autenticación.
 */
export const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/recuperar-password",
];

/**
 * Ruta por defecto tras login cuando no hay callbackUrl.
 * Para redirección basada en rol, usar getDefaultRouteForRoles().
 */
export const DEFAULT_LOGIN_REDIRECT = DASHBOARD_ROUTES.home;

export { canAccessRoute, getDefaultRouteForRoles };

/**
 * @deprecated Usar ROUTE_PERMISSIONS desde @/configs/permissions
 */
export { ROUTE_PERMISSIONS } from "@/configs/permissions";

/**
 * Función utilitaria para verificar si un rol tiene acceso a un path específico.
 */
export function userCanAccessRoute(pathname: string, userRoles: Role[]): boolean {
  return canAccessRoute(pathname, userRoles);
}
