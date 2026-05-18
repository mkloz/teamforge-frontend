import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import type { ForgeIdeaLaunch } from "@/features/forge/lib/forge-route";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import { buildTemplateFromSeed } from "@/features/forge/lib/forge-template-suggestions";
import type { PlanCategory } from "@/shared/schemas";

type ActivityCategory = (typeof ACTIVITIES)[number];

interface CandidateCategory {
  category: ActivityCategory;
  weight: number;
}

interface TemplateMatch {
  category: ActivityCategory;
  score: number;
  seed: TemplateSeed;
}

interface PreferredTemplateRule {
  patterns: RegExp[];
  seedId: string;
}

const MAX_SELECTED_ACTIVITY_LENGTH = 80;
const MAX_PLAN_NAME_LENGTH = 60;
const MAX_PLAN_DESCRIPTION_LENGTH = 500;
const MAX_GROUP_NAME_LENGTH = 120;
const MAX_GROUP_DESCRIPTION_LENGTH = 1000;

export function buildForgeIdeaTemplateId(idea: ForgeIdeaLaunch) {
  const slug = [
    idea.laneKey ?? "general",
    idea.secondaryLaneKey ?? "",
    idea.title,
    idea.detail,
    idea.eventDescription ?? "",
  ]
    .join("-")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

  return `idea:${slug || "profile-recommendation"}`;
}

export function buildForgeIdeaTemplate(
  idea: ForgeIdeaLaunch,
): ForgePlanTemplate {
  const title = idea.title.trim() || "Interest-led small group";
  const detail = idea.detail.trim();
  const eventDescription = idea.eventDescription?.trim() || detail;
  const baseTemplate = resolveExistingTemplate(idea);

  return {
    ...baseTemplate,
    selectedActivity: truncateText(
      baseTemplate?.selectedActivity ?? title,
      MAX_SELECTED_ACTIVITY_LENGTH,
    ),
    planName: truncateText(title, MAX_PLAN_NAME_LENGTH),
    planDescription: truncateText(
      eventDescription || baseTemplate?.planDescription || detail,
      MAX_PLAN_DESCRIPTION_LENGTH,
    ),
    planLocation: baseTemplate?.planLocation ?? "",
    planLocationLat: baseTemplate?.planLocationLat ?? null,
    planLocationLng: baseTemplate?.planLocationLng ?? null,
    locationType: baseTemplate?.locationType ?? "TBD",
    planCost: baseTemplate?.planCost ?? "FREE",
    planCostAmount: baseTemplate?.planCostAmount ?? "",
    planCostDetails: baseTemplate?.planCostDetails ?? "",
    forgeMode: baseTemplate?.forgeMode ?? "AUTO",
    fixedSize: baseTemplate?.fixedSize ?? null,
    visibility: baseTemplate?.visibility ?? "FRIENDS_ONLY",
    groupName: truncateText(
      baseTemplate?.groupName || title,
      MAX_GROUP_NAME_LENGTH,
    ),
    groupDescription: truncateText(
      eventDescription || baseTemplate?.groupDescription || detail,
      MAX_GROUP_DESCRIPTION_LENGTH,
    ),
    coverImage: baseTemplate?.coverImage ?? null,
    avatarImage: baseTemplate?.avatarImage ?? null,
  };
}

function resolveExistingTemplate(idea: ForgeIdeaLaunch) {
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
  const text = normalizeForMatching(
    `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`,
  );

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

function getCandidateCategories(idea: ForgeIdeaLaunch) {
  const scoreById = new Map<PlanCategory, number>();
  const primaryId = mapLaneToCategoryId(idea.laneKey);
  const secondaryId = mapLaneToCategoryId(idea.secondaryLaneKey);
  const text = `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`;

  if (primaryId) {
    addCategoryWeight(scoreById, primaryId, PRIMARY_LANE_CATEGORY_WEIGHT);
  }

  if (secondaryId) {
    addCategoryWeight(scoreById, secondaryId, SECONDARY_LANE_CATEGORY_WEIGHT);
  }

  if (/\b(?:route|walk|photo|city|local|map)\b/i.test(text)) {
    addCategoryWeight(scoreById, "TRAVEL", TEXT_CATEGORY_WEIGHT);
  }

  if (/\b(?:photo|gallery|art|creative|prompt)\b/i.test(text)) {
    addCategoryWeight(scoreById, "ARTS", TEXT_CATEGORY_WEIGHT);
  }

  if (/\b(?:coffee|cafe|table|brunch|food)\b/i.test(text)) {
    addCategoryWeight(scoreById, "FOOD", TEXT_CATEGORY_WEIGHT);
  }

  if (scoreById.size === 0) {
    addCategoryWeight(scoreById, "OTHER", FALLBACK_CATEGORY_WEIGHT);
  }

  return ACTIVITIES.map((category) => ({
    category,
    weight: scoreById.get(category.id) ?? 0,
  }))
    .filter((candidate) => candidate.weight > 0)
    .sort((left, right) => right.weight - left.weight);
}

function mapLaneToCategoryId(lane: ForgeIdeaLaunch["laneKey"]) {
  const categoryByLane: Partial<
    Record<NonNullable<ForgeIdeaLaunch["laneKey"]>, PlanCategory>
  > = {
    builder: "TECH",
    creative: "ARTS",
    food: "FOOD",
    general: "OTHER",
    learning: "LEARNING",
    outdoors: "OUTDOORS",
    play: "GAMING",
    social: "SOCIAL",
    wellness: "WELLNESS",
  };

  return lane ? categoryByLane[lane] : null;
}

function addCategoryWeight(
  scoreById: Map<PlanCategory, number>,
  id: PlanCategory,
  weight: number,
) {
  scoreById.set(id, Math.max(scoreById.get(id) ?? 0, weight));
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

function getIdeaTokenWeights(idea: ForgeIdeaLaunch) {
  const weights = new Map<string, number>();

  addWeightedTokens(weights, idea.title, TITLE_TOKEN_WEIGHT);
  addWeightedTokens(weights, idea.detail, DETAIL_TOKEN_WEIGHT);
  addWeightedTokens(
    weights,
    idea.eventDescription ?? "",
    EVENT_DESCRIPTION_TOKEN_WEIGHT,
  );

  return weights;
}

function addWeightedTokens(
  weights: Map<string, number>,
  value: string,
  weight: number,
) {
  for (const token of getTextTokens(value)) {
    weights.set(token, Math.max(weights.get(token) ?? 0, weight));
  }
}

function getSeedTokens(seed: TemplateSeed) {
  return {
    body: new Set(
      getTextTokens(
        `${seed.description} ${seed.groupName} ${seed.groupDescription}`,
      ),
    ),
    hints: new Set(getTextTokens((seed.interestHints ?? []).join(" "))),
    title: new Set(getTextTokens(seed.title)),
  };
}

function getTextTokens(value: string) {
  return normalizeForMatching(value)
    .split(/[^a-z0-9]+/)
    .map((token) => normalizeToken(token))
    .filter((token) => token.length >= 3 && !TEMPLATE_STOP_WORDS.has(token));
}

function normalizeForMatching(value: string) {
  return value.toLowerCase().replace(/café/g, "cafe");
}

function normalizeToken(token: string) {
  if (token === "photowalk") {
    return "photo";
  }

  if (token.length > 5 && token.endsWith("ing")) {
    return token.slice(0, -3);
  }

  if (token.length > 4 && token.endsWith("s")) {
    return token.slice(0, -1);
  }

  return token;
}

function truncateText(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  return value.slice(0, maxLength).trimEnd();
}

const TEMPLATE_MATCH_THRESHOLD = 5;
const PRIMARY_LANE_CATEGORY_WEIGHT = 3;
const SECONDARY_LANE_CATEGORY_WEIGHT = 1.8;
const TEXT_CATEGORY_WEIGHT = 1.15;
const FALLBACK_CATEGORY_WEIGHT = 0.6;
const TITLE_TOKEN_WEIGHT = 2.4;
const DETAIL_TOKEN_WEIGHT = 1.35;
const EVENT_DESCRIPTION_TOKEN_WEIGHT = 0.55;
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
const TEMPLATE_STOP_WORDS = new Set([
  "and",
  "clear",
  "easy",
  "first",
  "for",
  "group",
  "into",
  "meet",
  "one",
  "people",
  "public",
  "simple",
  "small",
  "the",
  "this",
  "with",
]);
