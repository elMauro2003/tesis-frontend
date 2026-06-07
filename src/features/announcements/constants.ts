import { AnnouncementCategory } from "@/features/announcements/types";

export const ANNOUNCEMENT_CATEGORY_CONFIG: Record<
  AnnouncementCategory,
  {
    label: string;
    badgeClassName: string;
    icon: string;
    iconClassName: string;
  }
> = {
  urgent: {
    label: "Urgente",
    badgeClassName: "bg-[var(--color-error-container)] text-[var(--color-on-error-container)]",
    icon: "campaign",
    iconClassName: "text-[var(--color-error)] opacity-60",
  },
  informative: {
    label: "Informativa",
    badgeClassName: "bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]",
    icon: "info",
    iconClassName: "text-[var(--color-primary)] opacity-60",
  },
  important: {
    label: "Importante",
    badgeClassName: "bg-[var(--color-primary-fixed)] text-[var(--color-on-primary-fixed)]",
    icon: "groups",
    iconClassName: "text-[var(--color-on-tertiary-fixed-variant)] opacity-60",
  },
};

export const DEFAULT_ANNOUNCEMENTS_PAGE_SIZE = 6;
