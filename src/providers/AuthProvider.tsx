"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePathname, useRouter } from "next/navigation";
import { PUBLIC_ROUTES, DEFAULT_LOGIN_REDIRECT } from "@/configs/routes";

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Provider que inicializa la sesión en el cliente (Hydration).
 * Revisa el token guardado y valida contra el backend antes de renderizar la app protegida.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { checkAuth, isLoading, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo checkea auth si no está cargando aún (por defecto true)
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));

    if (!isAuthenticated && !isPublicRoute) {
      // Intenta acceder a zona privada sin sesión
      router.replace(`/auth/login?callbackUrl=${pathname}`);
    } else if (isAuthenticated && isPublicRoute) {
      // Intenta acceder a login estando logueado
      router.replace(DEFAULT_LOGIN_REDIRECT);
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Si está cargando y NO es una ruta pública, bloqueamos el render para evitar FOUC
  // (Flashes of Unauthenticated Content)
  const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));
  if (isLoading && !isPublicRoute) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
