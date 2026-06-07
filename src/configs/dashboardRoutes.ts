export const DASHBOARD_ROUTES = {
  home: "/dashboard/reportes",
  reportes: "/dashboard/reportes",
  estudiantes: "/dashboard/estudiantes",
  estudiantesNueva: "/dashboard/estudiantes/nueva",
  estudianteEditar: (id: number | string) => `/dashboard/estudiantes/${id}/editar`,
  sedes: "/dashboard/sedes",
  edificios: "/dashboard/edificios",
  cuartos: "/dashboard/cuartos",
  quejas: "/dashboard/quejas",
  anuncios: "/dashboard/anuncios",
} as const;
