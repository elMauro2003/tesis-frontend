"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { canAccessRoute, getDefaultRouteForRoles } from "@/configs/permissions";
import { useAuthStore } from "@/store/useAuthStore";

type ForbiddenEventDetail = {
  message: string;
  endpoint?: string;
};

export function ForbiddenHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const handleForbidden = (event: Event) => {
      const detail = (event as CustomEvent<ForbiddenEventDetail>).detail;
      const message = detail?.message ?? "No tienes permiso para realizar esta acción.";

      toast.error("Acceso denegado", { description: message });

      if (user && pathname && !canAccessRoute(pathname, user.roles)) {
        router.replace(`${getDefaultRouteForRoles(user.roles)}?error=unauthorized`);
      }
    };

    window.addEventListener("auth:forbidden", handleForbidden);
    return () => window.removeEventListener("auth:forbidden", handleForbidden);
  }, [pathname, router, user]);

  return null;
}
