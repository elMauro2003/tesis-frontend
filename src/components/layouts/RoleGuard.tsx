"use client";

import { ReactNode, useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { Role } from "@/types/auth";
import { canAccessRoute, getDefaultRouteForRoles } from "@/configs/permissions";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles?: Role[];
  loadingFallback?: ReactNode;
}

/**
 * HOC (Wrapper) que protege secciones del layout según los roles de usuario.
 * Puede leer desde `src/configs/routes.ts` automáticamente basándose en la URL,
 * o recibir un array de `allowedRoles` hardcodeado.
 */
export const RoleGuard = ({ children, allowedRoles, loadingFallback }: RoleGuardProps) => {
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
      const fallbackRoute = getDefaultRouteForRoles(user.roles);
      router.replace(`${fallbackRoute}?error=unauthorized`);
    }
  }, [user, isAuthenticated, isLoading, pathname, allowedRoles, router]);

  if (isAuthorized === null || isLoading) {
    if (loadingFallback) {
      return loadingFallback;
    }

    return (
      <div
        className="flex w-full flex-col items-center justify-center space-y-4 p-10"
        aria-busy="true"
        aria-label="Verificando acceso"
      >
        <Skeleton className="h-4 w-1/4 max-w-xs" />
        <Skeleton className="h-32 w-full max-w-lg rounded-xl" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
};
