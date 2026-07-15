import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import { buildTemplateFromSeed } from "@/features/forge/lib/forge-template-suggestions";
import type { ForgeIdeaLaunch } from "@/shared/navigation/forge-navigation";

import { getCandidateCategories } from "./category-candidates";
import { getIdeaSearchText } from "./idea-text";
import {
  getIdeaTokenWeights,
  getSeedTokens,
  normalizeForTemplateSearch,
} from "./tokenization";
import type {
  CandidateCategory,
  ForgeIdeaTemplateSelection,
  PreferredTemplateRule,
  ScoredTemplateSeed,
} from "./types";

const CATALOG_FALLBACK_SEED_ID = "show-and-tell";
const TEMPLATE_SELECTION_SCORE_THRESHOLD = 5;

const DEFAULT_SEED_ID_BY_LANE: Readonly<Record<string, string>> = {
  builder: "brainstorm",
  creative: "creative",
  food: "brunch",
  general: CATALOG_FALLBACK_SEED_ID,
  learning: "mini-lecture",
  outdoors: "walk",
  play: "board-game-cafe",
  social: "small-table",
  wellness: "habit-check-in",
};

const DEFAULT_SEED_ID_BY_LANE_PAIR: Readonly<Record<string, string>> = {
  "builder:creative": "brainstorm",
  "builder:food": "build",
  "creative:builder": "design-critique",
  "creative:food": "craft-cafe",
  "creative:outdoors": "photo-route",
  "food:creative": "coffee-tasting",
  "food:learning": "tea-chat",
  "learning:food": "tea-chat",
  "learning:outdoors": "conversation-walk",
  "outdoors:creative": "photo-route",
  "outdoors:food": "map-and-cafe",
  "outdoors:play": "tiny-challenge",
  "play:food": "board-game-cafe",
  "play:outdoors": "outdoor-games",
  "social:food": "small-table",
  "wellness:food": "walk-talk",
};

const PREFERRED_TEMPLATE_RULES: readonly PreferredTemplateRule[] = [
  {
    patterns: [/\bphoto\b/, /\b(?:coffee|cafe)\b/],
    seedId: "photo-walk",
  },
  {
    patterns: [/\bboard\b/, /\bgame\b/],
    seedId: "board-game-cafe",
  },
  {
    patterns: [/\bgames?\b/, /\btable\b/],
    seedId: "board-game-cafe",
  },
  {
    patterns: [/\boutdoor\b/, /\bmini[- ]challenge\b/],
    seedId: "tiny-challenge",
  },
  {
    patterns: [/\boutdoor\b/, /\bgame\b/],
    seedId: "outdoor-games",
  },
];

export function selectForgeIdeaTemplate(
  idea: ForgeIdeaLaunch,
): ForgeIdeaTemplateSelection {
  const selection = selectTemplateSeed(idea);

  return {
    id: `${selection.category.id}-${selection.seed.id}`,
    template: buildTemplateFromSeed(
      selection.category,
      selection.seed,
      undefined,
    ),
  };
}

function selectTemplateSeed(idea: ForgeIdeaLaunch): ScoredTemplateSeed {
  return (
    findPreferredTemplateSeed(idea, getCandidateCategories(idea)) ??
    findHighestScoringTemplateSeed(idea) ??
    findLaneDefaultTemplateSeed(idea) ??
    getCatalogFallbackTemplateSeed()
  );
}

function findPreferredTemplateSeed(
  idea: ForgeIdeaLaunch,
  categories: CandidateCategory[],
) {
  const preferredSeedId = getPreferredSeedId(idea);

  if (!preferredSeedId) {
    return null;
  }

  for (const { category } of categories) {
    const seed = (CATEGORY_TEMPLATES[category.id] ?? []).find(
      (candidate) => candidate.id === preferredSeedId,
    );

    if (seed) {
      return createSelectedSeed(category, seed);
    }
  }

  return findTemplateSeedById(preferredSeedId);
}

function getPreferredSeedId(idea: ForgeIdeaLaunch) {
  const text = normalizeForTemplateSearch(getIdeaSearchText(idea));

  return (
    PREFERRED_TEMPLATE_RULES.find((rule) =>
      rule.patterns.every((pattern) => pattern.test(text)),
    )?.seedId ?? null
  );
}

function findLaneDefaultTemplateSeed(idea: ForgeIdeaLaunch) {
  const pairKey = getLanePairKey(idea);
  const pairSeedId = pairKey
    ? DEFAULT_SEED_ID_BY_LANE_PAIR[pairKey]
    : undefined;
  const laneSeedId = idea.laneKey
    ? DEFAULT_SEED_ID_BY_LANE[idea.laneKey]
    : undefined;
  const seedId = pairSeedId ?? laneSeedId;

  return seedId ? findTemplateSeedById(seedId) : null;
}

function getLanePairKey(idea: ForgeIdeaLaunch) {
  if (!idea.laneKey || !idea.secondaryLaneKey) {
    return null;
  }

  return `${idea.laneKey}:${idea.secondaryLaneKey}`;
}

function findHighestScoringTemplateSeed(idea: ForgeIdeaLaunch) {
  const tokenWeights = getIdeaTokenWeights(idea);
  let bestSelection: ScoredTemplateSeed | null = null;

  for (const candidate of getCandidateCategories(idea)) {
    for (const seed of CATEGORY_TEMPLATES[candidate.category.id] ?? []) {
      const score = scoreSeedFit(seed, tokenWeights) + candidate.weight;

      if (!bestSelection || score > bestSelection.score) {
        bestSelection = {
          category: candidate.category,
          score,
          seed,
        };
      }
    }
  }

  return bestSelection &&
    bestSelection.score >= TEMPLATE_SELECTION_SCORE_THRESHOLD
    ? bestSelection
    : null;
}

function findTemplateSeedById(seedId: string): ScoredTemplateSeed | null {
  for (const category of ACTIVITIES) {
    const seed = (CATEGORY_TEMPLATES[category.id] ?? []).find(
      (candidate) => candidate.id === seedId,
    );

    if (seed) {
      return createSelectedSeed(category, seed);
    }
  }

  return null;
}

function createSelectedSeed(
  category: (typeof ACTIVITIES)[number],
  seed: TemplateSeed,
): ScoredTemplateSeed {
  return {
    category,
    score: Number.POSITIVE_INFINITY,
    seed,
  };
}

function getCatalogFallbackTemplateSeed() {
  const fallback = findTemplateSeedById(CATALOG_FALLBACK_SEED_ID);

  if (!fallback) {
    throw new Error("The forge template catalog has no fallback template.");
  }

  return fallback;
}

function scoreSeedFit(seed: TemplateSeed, tokenWeights: Map<string, number>) {
  const seedTokens = getSeedTokens(seed);
  let score = 0;

  for (const [token, tokenWeight] of tokenWeights) {
    if (seedTokens.title.has(token)) {
      score += 3 * tokenWeight;
      continue;
    }

    if (seedTokens.hints.has(token)) {
      score += 2.2 * tokenWeight;
      continue;
    }

    if (seedTokens.body.has(token)) {
      score += tokenWeight;
    }
  }

  return score;
}
