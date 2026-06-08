import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";

export interface TemplateSeed {
  id: string;
  title: string;
  description: string;
  coverImageSource?: string | null;
  groupName: string;
  groupDescription: string;
  locationType?: ForgePlanTemplate["locationType"];
  fixedSize?: number;
  visibility?: ForgePlanTemplate["visibility"];
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
