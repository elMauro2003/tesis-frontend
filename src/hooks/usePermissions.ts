"use client";

import { useMemo } from "react";
import {
  can,
  canManageAnnouncements,
  canManageComplaints,
  canManageRooms,
  Feature,
  isReadOnlyForFeature,
  PermissionAction,
} from "@/configs/permissions";
import { useAuthStore } from "@/store/useAuthStore";
import { Role } from "@/types/auth";

export function usePermissions() {
  const user = useAuthStore((state) => state.user);
  const roles = user?.roles ?? [];

  return useMemo(
    () => ({
      roles,
      user,
      can: (feature: Feature, action: PermissionAction = "view") => can(roles, feature, action),
      isReadOnly: (feature: Feature) => isReadOnlyForFeature(roles, feature),
      canManageComplaints: () => canManageComplaints(roles),
      canManageAnnouncements: () => canManageAnnouncements(roles),
      canManageRooms: () => canManageRooms(roles),
      hasRole: (allowed: Role | Role[]) => {
        const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];
        return roles.some((role) => allowedRoles.includes(role));
      },
    }),
    [roles, user]
  );
}
