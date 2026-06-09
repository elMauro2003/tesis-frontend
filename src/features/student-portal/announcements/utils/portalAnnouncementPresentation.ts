import { ANNOUNCEMENT_CATEGORY_CONFIG } from "@/features/announcements/constants";
import { AnnouncementCategory } from "@/features/announcements/types";
import {
  formatAnnouncementDate,
  getAnnouncementCategory,
  isAnnouncementArchived,
} from "@/features/announcements/utils/announcementPresentation";
import { Information } from "@/types/models";

export const isActivePublicAnnouncement = (announcement: Information) =>
  !isAnnouncementArchived(announcement);

export const getPortalAnnouncementCategory = (announcement: Information): AnnouncementCategory =>
  getAnnouncementCategory(announcement);

export const getPortalAnnouncementCategoryConfig = (announcement: Information) => {
  const category = getPortalAnnouncementCategory(announcement);
  return ANNOUNCEMENT_CATEGORY_CONFIG[category];
};

export const getPortalAnnouncementFooterIconClassName = (category: AnnouncementCategory) => {
  switch (category) {
    case "urgent":
      return "text-error";
    case "informative":
      return "text-primary";
    case "important":
      return "text-on-primary-fixed-variant";
    default:
      return "text-primary";
  }
};

export const getPortalAnnouncementDisplayDate = (announcement: Information) =>
  formatAnnouncementDate(announcement.published_date);
