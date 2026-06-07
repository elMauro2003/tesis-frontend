export const PORTAL_ROUTES = {
  home: "/portal/evaluaciones",
  evaluaciones: "/portal/evaluaciones",
  quejas: "/portal/quejas",
  quejasNueva: "/portal/quejas/nueva",
  anuncios: "/portal/anuncios",
  cuartelerias: "/portal/cuartelerias",
  perfil: "/portal/perfil",
  anuncioDetalle: (id: number | string) => `/portal/anuncios/${id}`,
} as const;
