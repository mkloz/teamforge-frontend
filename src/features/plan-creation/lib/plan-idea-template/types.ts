import type { ACTIVITIES } from "@/features/plan-creation/constants/plan-creation.constants";
import type { TemplateSeed } from "@/features/plan-creation/data/plan-template-seed-types";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
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

export interface PlanIdeaTemplateSelection {
  id: string;
  template: PlanTemplate;
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
