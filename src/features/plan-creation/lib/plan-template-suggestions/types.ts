import type {
  TemplateSeed,
  TemplateTrait,
} from "@/features/plan-creation/data/plan-template-seed-types";
import type { PlanTemplate } from "@/features/plan-creation/lib/plan-template";
import type { User } from "@/shared/schemas";

export interface SuggestedTemplate {
  id: string;
  categoryId: string;
  categoryLabel: string;
  coverImage: string | null;
  title: string;
  description: string;
  badge: string;
  score: number;
  template: PlanTemplate;
}

export interface RankedTemplate {
  originalIndex: number;
  score: number;
  seed: TemplateSeed;
  template: PlanTemplate;
}

export interface CategoryFit {
  bestScore: number;
  categoryId: string;
  confidenceScore: number;
  coverageScore: number;
  directScore: number;
  topScore: number;
}

export interface ActivityIntentSignals {
  tokens: Set<string>;
}

export type WeightedTraits = Map<TemplateTrait, number>;
export type TraitWeights = readonly (readonly [TemplateTrait, number])[];
export type OceanScoreKey = keyof Pick<
  User,
  "oceanA" | "oceanC" | "oceanE" | "oceanN" | "oceanO"
>;

export interface PersonalityTraitRule {
  fallbackTraits: TraitWeights;
  preferredTraits: TraitWeights;
  preferredValue: string;
}

export interface OceanTraitRule {
  highThreshold: number;
  highTraits: TraitWeights;
  lowThreshold: number;
  lowTraits: TraitWeights;
  score: OceanScoreKey;
}
