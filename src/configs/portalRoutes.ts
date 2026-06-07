export const PORTAL_ROUTES = {
  home: "/portal/evaluaciones",
  evaluaciones: "/portal/evaluaciones",
  quejas: "/portal/quejas",
  quejasNueva: "/portal/quejas/nueva",
  quejasVisibles: "/portal/quejas/visibles",
  anuncios: "/portal/anuncios",
  perfil: "/portal/perfil",
  anuncioDetalle: (id: number | string) => `/portal/anuncios/${id}`,
} as const;
