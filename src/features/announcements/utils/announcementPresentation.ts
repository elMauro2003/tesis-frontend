import { Information } from "@/types/models";
import { AnnouncementCategory } from "@/features/announcements/types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatAnnouncementDate = (value: string) => {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Fecha no disponible";
  }

  return dateFormatter.format(parsed);
};

export const getDaysUntilExpiry = (expiresDate: string) => {
  const expiry = new Date(expiresDate);
  if (Number.isNaN(expiry.getTime())) {
    return null;
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  expiry.setHours(0, 0, 0, 0);

  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

export const isAnnouncementArchived = (announcement: Information) => {
  const daysUntilExpiry = getDaysUntilExpiry(announcement.expires_date);
  return daysUntilExpiry !== null && daysUntilExpiry < 0;
};

export const getAnnouncementCategory = (announcement: Information): AnnouncementCategory => {
  const daysUntilExpiry = getDaysUntilExpiry(announcement.expires_date);

  if (daysUntilExpiry !== null && daysUntilExpiry <= 7) {
    return "urgent";
  }

  if (!announcement.is_public) {
    return "important";
  }

  return "informative";
};

export const getAnnouncementDisplayDate = (announcement: Information) =>
  formatAnnouncementDate(announcement.created_at ?? announcement.expires_date);
