import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

export interface RecentActivityItem {
  id: string;
  title: string;
  categoryId: string;
  count: number;
  lastUsedAt: string;
  template: PlanTemplate;
}
