import { ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS } from "@/features/announcements/constants";
import { AnnouncementCategory } from "@/features/announcements/types";
import { Information, InformationWritePayload } from "@/types/models";
import { FieldErrors, validateFields } from "@/utils/helpers/formFieldErrors";

export type AnnouncementFormValues = {
  category: AnnouncementCategory;
  title: string;
  content: string;
  published_date: string;
  expires_date: string;
  is_public: boolean;
};

export const getTodayDateInputValue = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getYesterdayDateInputValue = () => addDaysToDateInput(getTodayDateInputValue(), -1);

export const toDateInputValue = (value?: string | null) => {
  if (!value) {
    return "";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  return parsed.toISOString().slice(0, 10);
};

export const addDaysToDateInput = (dateInput: string, days: number) => {
  const parsed = new Date(`${dateInput}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateInput;
  }

  parsed.setDate(parsed.getDate() + days);
  return parsed.toISOString().slice(0, 10);
};

export const getExpiryDateForCategory = (category: AnnouncementCategory, publishedDate: string) =>
  addDaysToDateInput(publishedDate, ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS[category]);

export const getDurationDaysBetweenDates = (startDate?: string | null, endDate?: string | null) => {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return null;
  }

  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const getCategoryFromDates = (
  publishedDate?: string | null,
  expiresDate?: string | null
): AnnouncementCategory => {
  const durationDays = getDurationDaysBetweenDates(
    publishedDate ?? getTodayDateInputValue(),
    expiresDate
  );

  if (durationDays === null) {
    return "informative";
  }

  if (durationDays <= ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS.urgent) {
    return "urgent";
  }

  if (durationDays <= ANNOUNCEMENT_CATEGORY_EXPIRY_DAYS.important) {
    return "important";
  }

  return "informative";
};

export const createEmptyAnnouncementFormValues = (): AnnouncementFormValues => {
  const publishedDate = getTodayDateInputValue();

  return {
    category: "informative",
    title: "",
    content: "",
    published_date: publishedDate,
    expires_date: getExpiryDateForCategory("informative", publishedDate),
    is_public: true,
  };
};

export const normalizeAnnouncementFormValues = (announcement: Information | null): AnnouncementFormValues => {
  if (!announcement) {
    return createEmptyAnnouncementFormValues();
  }

  const publishedDate = toDateInputValue(announcement.published_date) || getTodayDateInputValue();
  const expiresDate = toDateInputValue(announcement.expires_date);

  return {
    category: getCategoryFromDates(publishedDate, expiresDate || null),
    title: announcement.title ?? "",
    content: announcement.content ?? "",
    published_date: publishedDate,
    expires_date: expiresDate || getExpiryDateForCategory("informative", publishedDate),
    is_public: announcement.is_public ?? true,
  };
};

export const buildInformationPayload = (values: AnnouncementFormValues): InformationWritePayload => ({
  title: values.title.trim(),
  content: values.content.trim(),
  published_date: values.published_date || null,
  expires_date: values.expires_date || null,
  is_public: values.is_public,
});

export type AnnouncementFormField = "title" | "content" | "published_date" | "expires_date";

export const getAnnouncementFormFieldErrors = (
  values: AnnouncementFormValues
): FieldErrors<AnnouncementFormField> | null => {
  const durationDays = getDurationDaysBetweenDates(values.published_date, values.expires_date);
  const datesValid = durationDays !== null && durationDays >= 0;

  return validateFields<AnnouncementFormField>([
    {
      field: "title",
      valid: !!values.title.trim(),
      message: "Escriba un título para el anuncio.",
    },
    {
      field: "content",
      valid: !!values.content.trim(),
      message: "Escriba el contenido del anuncio.",
    },
    {
      field: "published_date",
      valid: !!values.published_date,
      message: "Seleccione la fecha de publicación.",
    },
    {
      field: "expires_date",
      valid: !!values.expires_date && datesValid,
      message: "La expiración debe ser igual o posterior a la publicación.",
    },
  ]);
};

export const isAnnouncementFormValid = (values: AnnouncementFormValues) => {
  if (!values.title.trim() || !values.content.trim()) {
    return false;
  }

  if (!values.published_date || !values.expires_date) {
    return false;
  }

  const durationDays = getDurationDaysBetweenDates(values.published_date, values.expires_date);
  return durationDays !== null && durationDays >= 0;
};
