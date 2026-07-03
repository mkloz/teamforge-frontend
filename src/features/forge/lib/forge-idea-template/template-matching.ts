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
  normalizeForMatching,
} from "./tokenization";
import type {
  CandidateCategory,
  PreferredTemplateRule,
  TemplateMatch,
} from "./types";

const TEMPLATE_MATCH_THRESHOLD = 5;
const PREFERRED_TEMPLATE_RULES: PreferredTemplateRule[] = [
  {
    patterns: [/\bphoto\b/, /\b(?:coffee|cafe)\b/],
    seedId: "photo-walk",
  },
  {
    patterns: [/\bphoto\b/, /\broute\b/],
    seedId: "photo-route",
  },
  {
    patterns: [/\bphoto\b/, /\bwalk\b/],
    seedId: "photo-walk",
  },
  {
    patterns: [/\bboard\b/, /\bgame\b/],
    seedId: "board-game-cafe",
  },
  {
    patterns: [/\bgame\b/, /\btable\b/],
    seedId: "party",
  },
  {
    patterns: [/\b(?:builder|prototype|product)\b/],
    seedId: "brainstorm",
  },
  {
    patterns: [/\boutdoor\b/, /\b(?:coffee|cafe)\b/],
    seedId: "park-picnic",
  },
  {
    patterns: [/\b(?:walk|route)\b/],
    seedId: "walk",
  },
];

export function resolveExistingTemplate(idea: ForgeIdeaLaunch) {
  const match = findBestTemplateSeed(idea);

  if (!match) {
    return null;
  }

  return buildTemplateFromSeed(match.category, match.seed, undefined);
}

function findBestTemplateSeed(idea: ForgeIdeaLaunch) {
  const categories = getCandidateCategories(idea);
  const preferredMatch = findPreferredTemplateSeed(idea, categories);

  if (preferredMatch) {
    return preferredMatch;
  }

  const tokenWeights = getIdeaTokenWeights(idea);
  let bestMatch: TemplateMatch | null = null;

  for (const candidate of categories) {
    for (const seed of CATEGORY_TEMPLATES[candidate.category.id] ?? []) {
      const score = scoreSeedMatch(seed, tokenWeights) + candidate.weight;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          category: candidate.category,
          score,
          seed,
        };
      }
    }
  }

  return bestMatch && bestMatch.score >= TEMPLATE_MATCH_THRESHOLD
    ? bestMatch
    : null;
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
      return {
        category,
        score: Number.POSITIVE_INFINITY,
        seed,
      };
    }
  }

  return findTemplateSeedById(preferredSeedId);
}

function getPreferredSeedId(idea: ForgeIdeaLaunch) {
  const text = normalizeForMatching(getIdeaSearchText(idea));

  return (
    PREFERRED_TEMPLATE_RULES.find((rule) =>
      rule.patterns.every((pattern) => pattern.test(text)),
    )?.seedId ?? null
  );
}

function findTemplateSeedById(seedId: string): TemplateMatch | null {
  for (const category of ACTIVITIES) {
    const seed = (CATEGORY_TEMPLATES[category.id] ?? []).find(
      (candidate) => candidate.id === seedId,
    );

    if (seed) {
      return {
        category,
        score: Number.POSITIVE_INFINITY,
        seed,
      };
    }
  }

  return null;
}

function scoreSeedMatch(seed: TemplateSeed, tokenWeights: Map<string, number>) {
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
