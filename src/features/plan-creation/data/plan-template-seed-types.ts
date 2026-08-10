import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";

export interface TemplateSeed {
  id: string;
  title: string;
  description: string;
  coverImageSource?: string | null;
  groupName: string;
  groupDescription: string;
  locationType?: PlanTemplate["locationType"];
  recommendedMinimumGroupSize: number;
  recommendedMaximumGroupSize: number;
  visibility?: PlanTemplate["visibility"];
  interestHints?: string[];
}

export type TemplateTrait =
  | "active"
  | "calm"
  | "creative"
  | "exploratory"
  | "focused"
  | "helpful"
  | "online"
  | "outgoing"
  | "practical"
  | "small-group"
  | "social"
  | "structured";
