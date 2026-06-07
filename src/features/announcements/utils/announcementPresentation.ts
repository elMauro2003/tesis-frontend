import { Information } from "@/types/models";
import { AnnouncementCategory } from "@/features/announcements/types";
import {
  getCategoryFromDates,
  getExpiryDateForCategory,
  getTodayDateInputValue,
  getYesterdayDateInputValue,
} from "@/features/announcements/utils/announcementForm";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export const formatAnnouncementDate = (value?: string | null) => {
  if (!value) {
    return "Fecha no disponible";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Fecha no disponible";
  }

  return dateFormatter.format(parsed);
};

export const getDaysUntilExpiry = (expiresDate?: string | null) => {
  if (!expiresDate) {
    return null;
  }

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

export const getAnnouncementArchivePayload = () => ({
  expires_date: getYesterdayDateInputValue(),
});

export const getAnnouncementUnarchivePayload = (announcement: Information) => {
  const category = getAnnouncementCategory(announcement);
  const publishedDate = getTodayDateInputValue();

  return {
    published_date: publishedDate,
    expires_date: getExpiryDateForCategory(category, publishedDate),
  };
};

export const getAnnouncementCategory = (announcement: Information): AnnouncementCategory =>
  getCategoryFromDates(announcement.published_date, announcement.expires_date);

export const getAnnouncementDisplayDate = (announcement: Information) =>
  formatAnnouncementDate(announcement.published_date ?? announcement.created_at ?? announcement.expires_date);
