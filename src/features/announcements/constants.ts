import { AnnouncementCategory } from "@/features/announcements/types";

export const ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS: Record<AnnouncementCategory, number> = {
  urgent: 7,
  important: 21,
  informative: 60,
};

export const ANNOUNCEMENT_CATEGORY_CONFIG: Record<
  AnnouncementCategory,
  {
    label: string;
    description: string;
    badgeClassName: string;
    cardClassName: string;
    selectedClassName: string;
    icon: string;
    iconClassName: string;
    listAccentClassName: string;
    listHeaderGradientClassName: string;
    listHoverShadowClassName: string;
  }
> = {
  urgent: {
    label: "Urgente",
    description: "Avisos críticos que requieren atención inmediata.",
    badgeClassName: "bg-[var(--color-error-container)] text-[var(--color-on-error-container)]",
    cardClassName: "border-[var(--color-error-container)]/60 bg-[var(--color-error-container)]/10",
    selectedClassName: "border-[var(--color-error)] ring-2 ring-[var(--color-error)]/25 shadow-[0_12px_24px_rgba(186,26,26,0.12)]",
    icon: "campaign",
    iconClassName: "text-[var(--color-error)]",
    listAccentClassName: "border-l-[var(--color-error)]",
    listHeaderGradientClassName: "from-[var(--color-error-container)]/55 via-[var(--color-error-container)]/15 to-transparent",
    listHoverShadowClassName: "hover:shadow-[0_20px_40px_rgba(186,26,26,0.1)]",
  },
  informative: {
    label: "Informativa",
    description: "Comunicados generales de interés para la comunidad.",
    badgeClassName: "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]",
    cardClassName: "border-[var(--color-secondary-container)]/80 bg-[var(--color-secondary-container)]/35",
    selectedClassName: "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20 shadow-[0_12px_24px_rgba(0,55,176,0.12)]",
    icon: "info",
    iconClassName: "text-[var(--color-primary)]",
    listAccentClassName: "border-l-[var(--color-primary)]",
    listHeaderGradientClassName: "from-[var(--color-secondary-container)]/80 via-[var(--color-secondary-container)]/20 to-transparent",
    listHoverShadowClassName: "hover:shadow-[0_20px_40px_rgba(0,55,176,0.08)]",
  },
  important: {
    label: "Importante",
    description: "Información relevante que debe destacarse en el tablón.",
    badgeClassName: "bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]",
    cardClassName: "border-[var(--color-primary-fixed)]/80 bg-[var(--color-primary-fixed)]/25",
    selectedClassName: "border-[var(--color-on-primary-fixed-variant)] ring-2 ring-[var(--color-primary-fixed)]/40 shadow-[0_12px_24px_rgba(0,55,176,0.1)]",
    icon: "groups",
    iconClassName: "text-[var(--color-on-primary-fixed-variant)]",
    listAccentClassName: "border-l-[var(--color-on-primary-fixed-variant)]",
    listHeaderGradientClassName: "from-[var(--color-primary-fixed)]/70 via-[var(--color-primary-fixed)]/20 to-transparent",
    listHoverShadowClassName: "hover:shadow-[0_20px_40px_rgba(0,55,176,0.1)]",
  },
};

export const ANNOUNCEMENT_VISIBILITY_DISPLAY = {
  public: {
    label: "Público",
    badgeClassName: "bg-[var(--color-primary-selected)] text-[var(--color-primary)]",
    cardClassName: "border-[var(--color-primary)]/12 bg-[var(--color-surface-container-lowest)]",
    headerClassName: "bg-[var(--color-primary-selected)]/20",
    icon: "public",
    iconClassName: "text-[var(--color-primary)]",
  },
  internal: {
    label: "Interno",
    badgeClassName: "bg-[var(--color-surface-container-highest)] text-[var(--color-on-surface-variant)]",
    cardClassName: "border border-dashed border-[var(--color-outline-variant)]/55 bg-[var(--color-surface-container-low)]",
    headerClassName: "bg-[var(--color-surface-container-high)]/70",
    icon: "lock",
    iconClassName: "text-[var(--color-on-surface-variant)]",
  },
} as const;

export const ANNOUNCEMENT_VISIBILITY_OPTIONS = [
  {
    value: true,
    label: "Visible para estudiantes",
    description: "Se mostrará en el tablón público de la residencia.",
    icon: "public",
    cardClassName: "border-[var(--color-primary)]/20 bg-[var(--color-primary-selected)]/40",
    selectedClassName: "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)]/20",
    iconClassName: "text-[var(--color-primary)]",
  },
  {
    value: false,
    label: "Solo panel interno",
    description: "Quedará visible únicamente para el equipo administrativo.",
    icon: "admin_panel_settings",
    cardClassName: "border-[var(--color-outline-variant)]/40 bg-[var(--color-surface-container-low)]",
    selectedClassName: "border-[var(--color-on-surface-variant)] ring-2 ring-[var(--color-outline-variant)]/30",
    iconClassName: "text-[var(--color-on-surface-variant)]",
  },
] as const;

export const DEFAULT_ANNOUNCEMENTS_PAGE_SIZE = 6;
