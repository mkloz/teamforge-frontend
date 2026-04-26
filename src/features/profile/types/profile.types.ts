import type { User, Interest as SharedInterest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";

export type MBTIType = PersonalityType;

export type DimensionKey = "EI" | "SN" | "TF" | "JP";

export interface DimensionScore {
  dimension: DimensionKey;
  score: number; // 0-100 where 0 = first letter (E, S, T, J), 100 = second letter (I, N, F, P)
  letter: string; // The resulting letter based on score
  isBorderline: boolean; // true if score is 45-55
}

export type CognitiveFunctionCode =
  | "Ne"
  | "Ni"
  | "Se"
  | "Si"
  | "Te"
  | "Ti"
  | "Fe"
  | "Fi";

export interface CognitiveFunction {
  code: CognitiveFunctionCode;
  name: string;
  shortName: string;
  description: string;
  role: "dominant" | "auxiliary" | "tertiary" | "inferior";
}

// OCEAN Big Five Personality Traits (UI projection)
export interface OceanScores {
  openness: number; // 0-100: Curiosity, creativity, openness to new experiences
  conscientiousness: number; // 0-100: Organization, dependability, self-discipline
  extraversion: number; // 0-100: Sociability, assertiveness, positive emotions
  agreeableness: number; // 0-100: Cooperation, trust, empathy
  neuroticism: number; // 0-100: Emotional sensitivity, anxiety, moodiness
}

export type OceanTraitKey = keyof OceanScores;

export interface OceanTraitMeta {
  key: OceanTraitKey;
  label: string; // User-friendly name
  highDescription: string; // What high score means
  lowDescription: string; // What low score means
}

/**
 * UserProfile is a UI-specific projection of the core User entity.
 * It combines the base user data with derived psychometric scores
 * and localized interest mappings.
 */
export type UserProfile = User & {
  // UI Projections
  oceanScores: OceanScores;
  dimensionScores: DimensionScore[];
  archetype: string;

  // Interests (localized for UI)
  interests: SharedInterest[];
};
