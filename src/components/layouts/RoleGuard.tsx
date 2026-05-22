"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@/types/auth";
import { canAccessRoute } from "@/configs/routes";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[]; // Opción de forzar roles sobreescribiendo el config
}

/**
 * HOC (Wrapper) que protege secciones del layout según los roles de usuario.
 * Puede leer desde `src/configs/routes.ts` automáticamente basándose en la URL,
 * o recibir un array de `allowedRoles` hardcodeado.
 */
export const RoleGuard = ({ children, allowedRoles }: RoleGuardProps) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      setIsAuthorized(false);
      return;
    }

    const hasAccess = allowedRoles 
      ? user.roles.some((role) => allowedRoles.includes(role))
      : canAccessRoute(pathname, user.roles);

    setIsAuthorized(hasAccess);

    if (!hasAccess) {
      // Si no tiene acceso, lo rebotamos al dashboard genérico o devolvemos 403
      router.replace("/dashboard?error=unauthorized");
    }
  }, [user, isAuthenticated, isLoading, pathname, allowedRoles, router]);

  // Pantalla de carga mientras resuelve permisos intermedios
  if (isAuthorized === null || isLoading) {
    return (
      <div className="flex w-full animate-pulse flex-col items-center justify-center p-10 space-y-4">
        <div className="h-4 w-1/4 rounded bg-muted"></div>
        <div className="h-32 w-full rounded bg-muted/50"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    // Retornamos un fallback pasivo o simplemente null (el useEffect ya está haciendo redirect)
    return null;
  }

  return <>{children}</>;
};
