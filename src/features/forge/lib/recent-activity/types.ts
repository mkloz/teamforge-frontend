import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

export interface RecentActivityItem {
  id: string;
  title: string;
  categoryId: string;
  count: number;
  lastUsedAt: string;
  template: ForgePlanTemplate;
}
