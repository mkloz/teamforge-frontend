import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { RecentActivityItem } from "@/features/forge/lib/recent-activity/types";

export const RECENT_ACTIVITIES_DESKTOP_PAGE_SIZE = 3;
export const RECENT_ACTIVITIES_MOBILE_PAGE_SIZE = 1;

export interface RecentActivityRowProps {
  appliedTemplateId: string | null;
  selectedActivity: string | null;
  onTemplateToggle: (templateId: string, template: ForgePlanTemplate) => void;
}

export interface RecentActivityCardProps {
  activity: RecentActivityItem;
  active: boolean;
  onTemplateToggle: (templateId: string, template: ForgePlanTemplate) => void;
}
