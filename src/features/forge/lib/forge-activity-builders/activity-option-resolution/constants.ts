import type { PlanCategory } from "@/shared/schemas";

export const DESCRIPTION_MATCH_WEIGHT = 0.85;
export const MIN_ACTIVITY_MATCH_SCORE = 68;
export const MIN_ACTIVITY_MATCH_MARGIN = 6;
export const MIN_TOKEN_EVIDENCE_SCORE = 56;
export const SUPPORTING_TOKEN_BONUS = 12;
export const UNMATCHED_TOKEN_PENALTY = 4;

export const DESCRIPTION_FUZZY_DISABLED_IDS = new Set<PlanCategory>(["OTHER"]);

export const ACTIVITY_STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "for",
  "in",
  "of",
  "on",
  "the",
  "to",
  "with",
]);

export const MEANINGFUL_SHORT_ACTIVITY_TOKENS = new Set([
  "2d",
  "3d",
  "ai",
  "ar",
  "dj",
  "ui",
  "ux",
  "vr",
]);
