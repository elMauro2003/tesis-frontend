import { DASHBOARD_ROUTES } from "@/configs/dashboardRoutes";
import { PORTAL_ROUTES } from "@/configs/portalRoutes";
import { Role } from "@/types/auth";

export type PermissionAction = "view" | "create" | "update" | "delete";

export type Feature =
  | "reports"
  | "sites"
  | "buildings"
  | "rooms"
  | "students"
  | "complaints"
  | "complaints_manage"
  | "announcements"
  | "announcements_manage"
  | "admin"
  | "evaluations_self";

const STUDENT_ROLE = ["estudiante"] as const satisfies readonly Role[];

const STAFF_ROLES = [
  "instructor",
  "directivo",
  "subdirector",
  "comunicador",
  "decano",
  "ppa",
  "pg",
  "admin",
] as const satisfies readonly Role[];

type FeaturePermissions = Partial<Record<PermissionAction, readonly Role[]>>;

const DIRECTIVE_ROLES = ["directivo", "admin"] as const satisfies readonly Role[];

const FEATURE_PERMISSIONS: Record<Feature, FeaturePermissions> = {
  reports: {
    view: DIRECTIVE_ROLES,
    create: DIRECTIVE_ROLES,
  },
  sites: {
    view: DIRECTIVE_ROLES,
    create: DIRECTIVE_ROLES,
    update: DIRECTIVE_ROLES,
    delete: DIRECTIVE_ROLES,
  },
  buildings: {
    view: DIRECTIVE_ROLES,
    create: DIRECTIVE_ROLES,
    update: DIRECTIVE_ROLES,
    delete: DIRECTIVE_ROLES,
  },
  rooms: {
    view: ["directivo", "instructor", "admin"],
    create: DIRECTIVE_ROLES,
    update: DIRECTIVE_ROLES,
    delete: DIRECTIVE_ROLES,
  },
  students: {
    view: ["instructor", "directivo", "admin", "decano", "ppa", "pg"],
    create: ["instructor", "directivo", "admin"],
    update: ["instructor", "directivo", "admin"],
    delete: ["instructor", "directivo", "admin"],
  },
  complaints: {
    view: ["estudiante", "subdirector", "admin"],
    create: ["estudiante"],
    update: ["estudiante"],
  },
  complaints_manage: {
    view: ["subdirector", "admin"],
    update: ["subdirector", "admin"],
  },
  announcements: {
    view: [
      "estudiante",
      "instructor",
      "directivo",
      "subdirector",
      "comunicador",
      "decano",
      "ppa",
      "pg",
      "admin",
    ],
  },
  announcements_manage: {
    view: ["comunicador", "directivo", "admin"],
    create: ["comunicador", "directivo", "admin"],
    update: ["comunicador", "directivo", "admin"],
    delete: ["comunicador", "directivo", "admin"],
  },
  admin: {
    view: ["admin"],
    create: ["admin"],
    update: ["admin"],
    delete: ["admin"],
  },
  evaluations_self: {
    view: STUDENT_ROLE,
  },
};

export interface NavItemConfig {
  href: string;
  label: string;
  icon: string;
  feature: Feature;
  filledIcon?: boolean;
  labelByRole?: Partial<Record<Role, string>>;
}

export const NAV_ITEMS: NavItemConfig[] = [
  {
    href: DASHBOARD_ROUTES.reportes,
    label: "Reportes",
    icon: "analytics",
    feature: "reports",
  },
  {
    href: DASHBOARD_ROUTES.sedes,
    label: "Sedes",
    icon: "location_city",
    feature: "sites",
  },
  {
    href: DASHBOARD_ROUTES.edificios,
    label: "Edificios",
    icon: "domain",
    feature: "buildings",
  },
  {
    href: DASHBOARD_ROUTES.cuartos,
    label: "Cuartos",
    icon: "bed",
    feature: "rooms",
  },
  {
    href: DASHBOARD_ROUTES.estudiantes,
    label: "Estudiantes",
    icon: "school",
    feature: "students",
    filledIcon: true,
    labelByRole: {
      decano: "Consulta de estudiantes",
      ppa: "Consulta de estudiantes",
      pg: "Consulta de estudiantes",
    },
  },
  {
    href: DASHBOARD_ROUTES.quejas,
    label: "Quejas",
    icon: "emergency_home",
    feature: "complaints",
    labelByRole: {
      subdirector: "Gestión de quejas",
    },
  },
  {
    href: DASHBOARD_ROUTES.anuncios,
    label: "Anuncios",
    icon: "campaign",
    feature: "announcements",
    labelByRole: {
      instructor: "Comunicados",
      decano: "Comunicados",
      ppa: "Comunicados",
      pg: "Comunicados",
    },
  },
];

export interface PortalNavItemConfig {
  href: string;
  label: string;
  icon: string;
  feature: Feature;
}

export const PORTAL_NAV_ITEMS: PortalNavItemConfig[] = [
  {
    href: PORTAL_ROUTES.evaluaciones,
    label: "Evaluaciones",
    icon: "emoji_events",
    feature: "evaluations_self",
  },
  {
    href: PORTAL_ROUTES.quejas,
    label: "Quejas",
    icon: "emergency_home",
    feature: "complaints",
  },
  {
    href: PORTAL_ROUTES.anuncios,
    label: "Anuncios",
    icon: "campaign",
    feature: "announcements",
  },
];

const DEFAULT_ROUTE_PRIORITY: { roles: readonly Role[]; route: string }[] = [
  { roles: ["admin", "directivo"], route: DASHBOARD_ROUTES.reportes },
  { roles: ["subdirector"], route: DASHBOARD_ROUTES.quejas },
  { roles: ["comunicador"], route: DASHBOARD_ROUTES.anuncios },
  { roles: ["instructor", "decano", "ppa", "pg"], route: DASHBOARD_ROUTES.estudiantes },
  { roles: ["estudiante"], route: PORTAL_ROUTES.home },
];

export const PORTAL_ROUTE_PERMISSIONS: Record<string, readonly Role[]> = {
  "/portal/evaluaciones": FEATURE_PERMISSIONS.evaluations_self.view!,
  "/portal/quejas": STUDENT_ROLE,
  "/portal/quejas/nueva": STUDENT_ROLE,
  "/portal/quejas/visibles": STUDENT_ROLE,
  "/portal/anuncios": STUDENT_ROLE,
};

export const ROUTE_PERMISSIONS: Record<string, readonly Role[]> = {
  "/dashboard/reportes": FEATURE_PERMISSIONS.reports.view!,
  "/dashboard/sedes": FEATURE_PERMISSIONS.sites.view!,
  "/dashboard/edificios": FEATURE_PERMISSIONS.buildings.view!,
  "/dashboard/cuartos": FEATURE_PERMISSIONS.rooms.view!,
  "/dashboard/estudiantes/nueva": FEATURE_PERMISSIONS.students.create!,
  "/dashboard/estudiantes": FEATURE_PERMISSIONS.students.view!,
  "/dashboard/quejas": FEATURE_PERMISSIONS.complaints.view!,
  "/dashboard/anuncios": FEATURE_PERMISSIONS.announcements.view!,
  "/dashboard/administracion": FEATURE_PERMISSIONS.admin.view!,
};

export function hasAnyRole(userRoles: Role[], allowed: readonly Role[]): boolean {
  return userRoles.some((role) => allowed.includes(role));
}

export function can(
  userRoles: Role[],
  feature: Feature,
  action: PermissionAction = "view"
): boolean {
  const permissions = FEATURE_PERMISSIONS[feature];
  const allowed = permissions[action] ?? permissions.view;

  if (!allowed) {
    return false;
  }

  return hasAnyRole(userRoles, allowed);
}

export function isReadOnlyForFeature(userRoles: Role[], feature: Feature): boolean {
  if (!can(userRoles, feature, "view")) {
    return false;
  }

  return (
    !can(userRoles, feature, "create") &&
    !can(userRoles, feature, "update") &&
    !can(userRoles, feature, "delete")
  );
}

export function getNavLabelForRoles(item: NavItemConfig, userRoles: Role[]): string {
  if (item.labelByRole) {
    for (const role of userRoles) {
      const label = item.labelByRole[role];
      if (label) {
        return label;
      }
    }
  }

  return item.label;
}

export function getNavItemsForRoles(userRoles: Role[]): NavItemConfig[] {
  return NAV_ITEMS.filter((item) => can(userRoles, item.feature, "view"));
}

export function isStudentOnly(userRoles: Role[]): boolean {
  return userRoles.includes("estudiante") && !hasAnyRole(userRoles, STAFF_ROLES);
}

export function isPortalRoute(pathname: string): boolean {
  return pathname === "/portal" || pathname.startsWith("/portal/");
}

export function isDashboardRoute(pathname: string): boolean {
  return pathname === "/dashboard" || pathname.startsWith("/dashboard/");
}

export function getPortalNavItemsForRoles(userRoles: Role[]): PortalNavItemConfig[] {
  return PORTAL_NAV_ITEMS.filter((item) => can(userRoles, item.feature, "view"));
}

export function getDefaultRouteForRoles(userRoles: Role[]): string {
  if (isStudentOnly(userRoles)) {
    return PORTAL_ROUTES.home;
  }

  for (const entry of DEFAULT_ROUTE_PRIORITY) {
    if (hasAnyRole(userRoles, entry.roles) && canAccessRoute(entry.route, userRoles)) {
      return entry.route;
    }
  }

  const navItems = getNavItemsForRoles(userRoles);
  return navItems[0]?.href ?? DASHBOARD_ROUTES.reportes;
}

const STUDENT_EDIT_ROUTE = /^\/dashboard\/estudiantes\/[^/]+\/editar(?:\/|$)/;
const PORTAL_ANNOUNCEMENT_DETAIL_ROUTE = /^\/portal\/anuncios\/[^/]+(?:\/|$)/;

export function canAccessPortalRoute(pathname: string, userRoles: Role[]): boolean {
  if (!isStudentOnly(userRoles)) {
    return false;
  }

  if (pathname === "/portal" || pathname === "/portal/") {
    return true;
  }

  if (PORTAL_ANNOUNCEMENT_DETAIL_ROUTE.test(pathname)) {
    return true;
  }

  const matchedRoute = Object.keys(PORTAL_ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!matchedRoute) {
    return false;
  }

  return hasAnyRole(userRoles, PORTAL_ROUTE_PERMISSIONS[matchedRoute]);
}

export function canAccessRoute(pathname: string, userRoles: Role[]): boolean {
  if (isPortalRoute(pathname)) {
    return canAccessPortalRoute(pathname, userRoles);
  }

  if (isStudentOnly(userRoles)) {
    return false;
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return getNavItemsForRoles(userRoles).length > 0;
  }

  if (STUDENT_EDIT_ROUTE.test(pathname)) {
    return can(userRoles, "students", "update");
  }

  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .sort((a, b) => b.length - a.length)
    .find((route) => pathname === route || pathname.startsWith(`${route}/`));

  if (!matchedRoute) {
    return false;
  }

  return hasAnyRole(userRoles, ROUTE_PERMISSIONS[matchedRoute]);
}

export function canManageComplaints(userRoles: Role[]): boolean {
  return can(userRoles, "complaints_manage", "view");
}

export function canManageAnnouncements(userRoles: Role[]): boolean {
  return can(userRoles, "announcements_manage", "view");
}

export function canManageRooms(userRoles: Role[]): boolean {
  return can(userRoles, "rooms", "create");
}
