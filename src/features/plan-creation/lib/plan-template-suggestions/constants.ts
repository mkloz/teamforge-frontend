import type { TemplateTrait } from "@/features/plan-creation/data/plan-template-seed-types";
import {
  PLAN_COVER_PRESET_IDS,
  PLAN_COVER_PRESETS,
} from "@/shared/lib/plan-cover";

import type {
  OceanScoreKey,
  OceanTraitRule,
  PersonalityTraitRule,
} from "./types";

export const MIN_PERSONAL_FIT_SCORE = 3.4;
export const PERSONAL_FIT_TOP_SCORE_RATIO = 0.72;
export const MIN_CATEGORY_CONFIDENCE_SCORE = 2.6;
export const MIN_CATEGORY_STRONG_TEMPLATE_SCORE = 3.4;
export const MIN_CATEGORY_SUPPORTING_TEMPLATE_SCORE = 2.2;

export const MEANINGFUL_SHORT_TOKENS = new Set([
  "2d",
  "3d",
  "ai",
  "ar",
  "cv",
  "dj",
  "qa",
  "ui",
  "ux",
  "vr",
]);

export const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "into",
  "the",
  "this",
  "that",
  "with",
  "your",
]);

export const TEMPLATE_TOKEN_ALIASES: Record<string, string[]> = {
  biking: ["bike", "cycling"],
  cinema: ["film", "movie"],
  coding: ["code", "programming"],
  football: ["soccer"],
  gym: ["fitness", "workout"],
  movie: ["film", "cinema"],
  programming: ["code", "coding"],
  run: ["running"],
  soccer: ["football"],
  workout: ["fitness", "gym"],
};

export const TEMPLATE_TRAIT_VALUES: TemplateTrait[] = [
  "active",
  "calm",
  "creative",
  "exploratory",
  "focused",
  "helpful",
  "online",
  "outgoing",
  "practical",
  "small-group",
  "social",
  "structured",
];

export const PERSONALITY_TYPE_TRAIT_RULES: readonly PersonalityTraitRule[] = [
  {
    fallbackTraits: [
      ["small-group", 0.75],
      ["calm", 0.65],
      ["focused", 0.45],
    ],
    preferredTraits: [
      ["social", 0.75],
      ["outgoing", 0.65],
    ],
    preferredValue: "E",
  },
  {
    fallbackTraits: [
      ["practical", 0.65],
      ["structured", 0.45],
    ],
    preferredTraits: [
      ["creative", 0.65],
      ["exploratory", 0.55],
    ],
    preferredValue: "N",
  },
  {
    fallbackTraits: [
      ["focused", 0.65],
      ["practical", 0.55],
    ],
    preferredTraits: [
      ["helpful", 0.65],
      ["social", 0.55],
    ],
    preferredValue: "F",
  },
  {
    fallbackTraits: [
      ["exploratory", 0.75],
      ["creative", 0.55],
    ],
    preferredTraits: [
      ["structured", 0.75],
      ["focused", 0.55],
    ],
    preferredValue: "J",
  },
];

export const OCEAN_TRAIT_RULES: readonly OceanTraitRule[] = [
  {
    highThreshold: 70,
    highTraits: [
      ["creative", 1],
      ["exploratory", 0.9],
    ],
    lowThreshold: 35,
    lowTraits: [
      ["practical", 0.75],
      ["structured", 0.55],
    ],
    score: "oceanO",
  },
  {
    highThreshold: 70,
    highTraits: [
      ["structured", 1],
      ["focused", 0.9],
      ["practical", 0.65],
    ],
    lowThreshold: 35,
    lowTraits: [
      ["exploratory", 0.6],
      ["creative", 0.45],
    ],
    score: "oceanC",
  },
  {
    highThreshold: 65,
    highTraits: [
      ["social", 1],
      ["outgoing", 0.9],
      ["active", 0.45],
    ],
    lowThreshold: 40,
    lowTraits: [
      ["small-group", 1],
      ["calm", 0.85],
      ["focused", 0.5],
    ],
    score: "oceanE",
  },
  {
    highThreshold: 70,
    highTraits: [
      ["helpful", 1],
      ["social", 0.55],
      ["calm", 0.35],
    ],
    lowThreshold: 35,
    lowTraits: [
      ["focused", 0.55],
      ["practical", 0.45],
    ],
    score: "oceanA",
  },
  {
    highThreshold: 65,
    highTraits: [
      ["calm", 0.95],
      ["structured", 0.7],
      ["small-group", 0.45],
    ],
    lowThreshold: 35,
    lowTraits: [
      ["active", 0.55],
      ["outgoing", 0.45],
      ["exploratory", 0.35],
    ],
    score: "oceanN",
  },
];

export const OCEAN_SCORE_KEYS: readonly OceanScoreKey[] = [
  "oceanO",
  "oceanC",
  "oceanE",
  "oceanA",
  "oceanN",
];

export const TEMPLATE_COVER_PRESET_IDS = PLAN_COVER_PRESETS.map(
  (preset) => preset.id,
);
export const PLAN_COVER_PRESET_ID_SET = new Set<string>(PLAN_COVER_PRESET_IDS);
export const VARIANT_READY_ORIGINAL_PATH = /\/original[.][a-z0-9]+$/i;
export const TEMPLATE_PREVIEW_VARIANT_FILE_NAME = "card-384.webp";
