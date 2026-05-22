import { Role } from "@/types/auth";

/**
 * Definición de rutas públicas que no requieren autenticación.
 */
export const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/recuperar-password",
];

/**
 * Ruta por defecto a la que se redirige tras un login exitoso.
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";

/**
 * Mapeo estricto de rutas base con los roles permitidos.
 * Si una ruta no está aquí pero el usuario está autenticado, se asume acceso denegado por defecto (Whitelist approach).
 */
export const ROUTE_PERMISSIONS: Record<string, Role[]> = {
  "/dashboard": [
    "estudiante", "instructor", "directivo", "subdirector", 
    "comunicador", "decano", "ppa", "pg", "admin"
  ],
  "/estudiantes": ["instructor", "directivo", "admin", "decano", "ppa", "pg"],
  "/quejas": ["estudiante", "subdirector", "admin"],
  "/infraestructura": ["directivo", "admin"],
  "/cuartelerias": ["estudiante", "instructor", "directivo", "admin"],
  "/administracion": ["admin"],
  // Estas rutas pueden crecer jerárquicamente. 
  // Evaluaremos startsWith para subrutas dinámicas (ej. /estudiantes/[id])
};

/**
 * Función utilitaria para verificar si un rol tiene acceso a un path específico.
 */
export const canAccessRoute = (pathname: string, userRoles: Role[]): boolean => {
  // 1. Si es ruta pública, todos pasan
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return true;
  }

  // 2. Buscar matching de ruta (exacta o prefijo)
  // Ordenamos por longitud descendente para que machee /admin/usuarios antes que /admin
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find(route => pathname.startsWith(route));

  if (!matchedRoute) {
    return false; // Principio de privilegio mínimo: si no está definido, no pasa.
  }

  const requiredRoles = ROUTE_PERMISSIONS[matchedRoute];
  
  // 3. Verificamos intersección de roles
  return userRoles.some(role => requiredRoles.includes(role));
};
