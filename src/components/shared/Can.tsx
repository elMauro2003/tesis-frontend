"use client";

import { ReactNode } from "react";
import { Feature, PermissionAction } from "@/configs/permissions";
import { usePermissions } from "@/hooks/usePermissions";

interface CanProps {
  feature: Feature;
  action?: PermissionAction;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ feature, action = "view", children, fallback = null }: CanProps) {
  const { can } = usePermissions();

  if (!can(feature, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
