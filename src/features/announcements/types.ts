import { Information } from "@/types/models";

export type AnnouncementCategory = "urgent" | "informative" | "important";

export type AnnouncementVisibilityFilter = "all" | "public" | "private";

export type AnnouncementStatusFilter = "active" | "archived";

export type AnnouncementWithCategory = Information & {
  category: AnnouncementCategory;
};
