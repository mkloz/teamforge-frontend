import type { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { PlanCategory } from "@/shared/schemas";

export type ActivityCategory = (typeof ACTIVITIES)[number];

export interface CandidateCategory {
  category: ActivityCategory;
  weight: number;
}

export interface TemplateMatch {
  category: ActivityCategory;
  score: number;
  seed: TemplateSeed;
}

export interface PreferredTemplateRule {
  patterns: RegExp[];
  seedId: string;
}

export interface TextCategoryRule {
  id: PlanCategory;
  pattern: RegExp;
}

export interface TokenNormalizationRule {
  minLength: number;
  normalize: (token: string) => string;
  suffix: string;
}

export interface IdeaTemplateText {
  detail: string;
  eventDescription: string;
  title: string;
}

export type ResolvedForgeTemplate = ForgePlanTemplate | null;

export type ActivityTemplateSection = Pick<
  ForgePlanTemplate,
  "selectedActivity"
>;

export type PlanTemplateSection = Pick<
  ForgePlanTemplate,
  | "planName"
  | "planDescription"
  | "planLocation"
  | "planLocationLat"
  | "planLocationLng"
  | "locationType"
  | "planCost"
  | "planCostAmount"
  | "planCostDetails"
>;

export type PlanCopyTemplateSection = Pick<
  PlanTemplateSection,
  "planName" | "planDescription"
>;

export type PlanLocationTemplateSection = Pick<
  PlanTemplateSection,
  "planLocation" | "planLocationLat" | "planLocationLng" | "locationType"
>;

export type PlanCostTemplateSection = Pick<
  PlanTemplateSection,
  "planCost" | "planCostAmount" | "planCostDetails"
>;

export type GroupSettingsTemplateSection = Pick<
  ForgePlanTemplate,
  "forgeMode" | "fixedSize" | "visibility"
>;

export type GroupCopyTemplateSection = Pick<
  ForgePlanTemplate,
  "groupName" | "groupDescription"
>;

export type TemplateImagesSection = Pick<
  ForgePlanTemplate,
  "coverImage" | "avatarImage"
>;
