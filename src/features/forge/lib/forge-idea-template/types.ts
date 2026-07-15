import type { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { PlanCategory } from "@/shared/schemas";

export type ActivityCategory = (typeof ACTIVITIES)[number];

export interface CandidateCategory {
  category: ActivityCategory;
  weight: number;
}

export interface ScoredTemplateSeed {
  category: ActivityCategory;
  score: number;
  seed: TemplateSeed;
}

export interface ForgeIdeaTemplateSelection {
  id: string;
  template: ForgePlanTemplate;
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
