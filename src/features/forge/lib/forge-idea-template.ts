import { ACTIVITIES } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import { resolvePlanCategory } from "@/features/forge/lib/forge-activity-builders/activity-option-resolution";
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

interface TextCategoryRule {
  id: PlanCategory;
  pattern: RegExp;
}

interface TokenNormalizationRule {
  minLength: number;
  normalize: (token: string) => string;
  suffix: string;
}

interface IdeaTemplateText {
  detail: string;
  eventDescription: string;
  title: string;
}

type ResolvedForgeTemplate = ForgePlanTemplate | null;

type ActivityTemplateSection = Pick<ForgePlanTemplate, "selectedActivity">;

type PlanTemplateSection = Pick<
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
type PlanCopyTemplateSection = Pick<
  PlanTemplateSection,
  "planName" | "planDescription"
>;
type PlanLocationTemplateSection = Pick<
  PlanTemplateSection,
  "planLocation" | "planLocationLat" | "planLocationLng" | "locationType"
>;
type PlanCostTemplateSection = Pick<
  PlanTemplateSection,
  "planCost" | "planCostAmount" | "planCostDetails"
>;

type GroupSettingsTemplateSection = Pick<
  ForgePlanTemplate,
  "forgeMode" | "fixedSize" | "visibility"
>;

type GroupCopyTemplateSection = Pick<
  ForgePlanTemplate,
  "groupName" | "groupDescription"
>;

type TemplateImagesSection = Pick<
  ForgePlanTemplate,
  "coverImage" | "avatarImage"
>;

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
  const text = getIdeaTemplateText(idea);
  const baseTemplate = resolveExistingTemplate(idea);

  return {
    ...baseTemplate,
    ...buildActivityTemplateSection(text, baseTemplate),
    ...buildPlanTemplateSection(text, baseTemplate),
    ...buildGroupSettingsTemplateSection(baseTemplate),
    ...buildGroupCopyTemplateSection(text, baseTemplate),
    ...buildTemplateImagesSection(baseTemplate),
  };
}

function getIdeaTemplateText(idea: ForgeIdeaLaunch): IdeaTemplateText {
  const title = idea.title.trim() || "Interest-led small group";
  const detail = idea.detail.trim();

  return {
    detail,
    eventDescription: idea.eventDescription?.trim() || detail,
    title,
  };
}

function buildActivityTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): ActivityTemplateSection {
  return {
    selectedActivity: truncateText(
      baseTemplate?.selectedActivity ?? text.title,
      MAX_SELECTED_ACTIVITY_LENGTH,
    ),
  };
}

function buildPlanTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): PlanTemplateSection {
  return {
    ...buildPlanCopyTemplateSection(text, baseTemplate),
    ...buildPlanLocationTemplateSection(baseTemplate),
    ...buildPlanCostTemplateSection(baseTemplate),
  };
}

function buildPlanCopyTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): PlanCopyTemplateSection {
  return {
    planName: truncateText(text.title, MAX_PLAN_NAME_LENGTH),
    planDescription: truncateText(
      text.eventDescription || baseTemplate?.planDescription || text.detail,
      MAX_PLAN_DESCRIPTION_LENGTH,
    ),
  };
}

function buildPlanLocationTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): PlanLocationTemplateSection {
  return {
    planLocation: baseTemplate?.planLocation ?? "",
    planLocationLat: baseTemplate?.planLocationLat ?? null,
    planLocationLng: baseTemplate?.planLocationLng ?? null,
    locationType: baseTemplate?.locationType ?? "TBD",
  };
}

function buildPlanCostTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): PlanCostTemplateSection {
  return {
    planCost: baseTemplate?.planCost ?? "FREE",
    planCostAmount: baseTemplate?.planCostAmount ?? "",
    planCostDetails: baseTemplate?.planCostDetails ?? "",
  };
}

function buildGroupSettingsTemplateSection(
  baseTemplate: ResolvedForgeTemplate,
): GroupSettingsTemplateSection {
  return {
    forgeMode: baseTemplate?.forgeMode ?? "AUTO",
    fixedSize: baseTemplate?.fixedSize ?? null,
    visibility: baseTemplate?.visibility ?? "FRIENDS_ONLY",
  };
}

function buildGroupCopyTemplateSection(
  text: IdeaTemplateText,
  baseTemplate: ResolvedForgeTemplate,
): GroupCopyTemplateSection {
  return {
    groupName: truncateText(
      baseTemplate?.groupName || text.title,
      MAX_GROUP_NAME_LENGTH,
    ),
    groupDescription: truncateText(
      text.eventDescription || baseTemplate?.groupDescription || text.detail,
      MAX_GROUP_DESCRIPTION_LENGTH,
    ),
  };
}

function buildTemplateImagesSection(
  baseTemplate: ResolvedForgeTemplate,
): TemplateImagesSection {
  return {
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

function getCandidateCategories(idea: ForgeIdeaLaunch) {
  const scoreById = new Map<PlanCategory, number>();
  const primaryId = mapLaneToCategoryId(idea.laneKey);
  const secondaryId = mapLaneToCategoryId(idea.secondaryLaneKey);
  const text = getIdeaSearchText(idea);
  const resolvedCategoryId = resolvePlanCategory(text);
  const resolvedTitleCategoryId = resolvePlanCategory(idea.title);

  if (primaryId) {
    addCategoryWeight(scoreById, primaryId, PRIMARY_LANE_CATEGORY_WEIGHT);
  }

  if (secondaryId) {
    addCategoryWeight(scoreById, secondaryId, SECONDARY_LANE_CATEGORY_WEIGHT);
  }

  addResolvedCategoryWeight(
    scoreById,
    resolvedCategoryId,
    RESOLVED_ACTIVITY_CATEGORY_WEIGHT,
  );
  addResolvedCategoryWeight(
    scoreById,
    resolvedTitleCategoryId,
    RESOLVED_TITLE_CATEGORY_WEIGHT,
  );
  addTextCategoryWeights(scoreById, text);

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
  return lane ? CATEGORY_ID_BY_LANE[lane] : null;
}

function getIdeaSearchText(idea: ForgeIdeaLaunch) {
  return `${idea.title} ${idea.detail} ${idea.eventDescription ?? ""}`;
}

function addTextCategoryWeights(
  scoreById: Map<PlanCategory, number>,
  text: string,
) {
  for (const rule of TEXT_CATEGORY_RULES) {
    if (rule.pattern.test(text)) {
      addCategoryWeight(scoreById, rule.id, TEXT_CATEGORY_WEIGHT);
    }
  }
}

function addResolvedCategoryWeight(
  scoreById: Map<PlanCategory, number>,
  id: PlanCategory,
  weight: number,
) {
  if (id === "OTHER") {
    return;
  }

  addCategoryWeight(scoreById, id, weight);
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
    .filter(
      (token) =>
        (token.length >= 3 || MEANINGFUL_SHORT_TEMPLATE_TOKENS.has(token)) &&
        !TEMPLATE_STOP_WORDS.has(token),
    );
}

function normalizeForMatching(value: string) {
  return value
    .normalize("NFKD")
    .replaceAll(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replaceAll("&", " and ");
}

function normalizeToken(token: string) {
  return (
    TOKEN_NORMALIZATION_OVERRIDES.get(token) ??
    normalizeTokenSuffix(token) ??
    token
  );
}

function normalizeTokenSuffix(token: string) {
  const rule = TOKEN_SUFFIX_NORMALIZATION_RULES.find((candidate) =>
    matchesTokenNormalizationRule(token, candidate),
  );

  return rule?.normalize(token) ?? null;
}

function matchesTokenNormalizationRule(
  token: string,
  rule: TokenNormalizationRule,
) {
  return token.length >= rule.minLength && token.endsWith(rule.suffix);
}

function removeTrailingDoubleConsonant(value: string) {
  const lastCharacter = value.at(-1);
  const previousCharacter = value.at(-2);

  if (
    lastCharacter &&
    lastCharacter === previousCharacter &&
    !/[aeiou]/.test(lastCharacter)
  ) {
    return value.slice(0, -1);
  }

  return value;
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
const RESOLVED_ACTIVITY_CATEGORY_WEIGHT = 2.35;
const RESOLVED_TITLE_CATEGORY_WEIGHT = 2.15;
const TEXT_CATEGORY_WEIGHT = 1.15;
const FALLBACK_CATEGORY_WEIGHT = 0.6;
const TITLE_TOKEN_WEIGHT = 2.4;
const DETAIL_TOKEN_WEIGHT = 1.35;
const EVENT_DESCRIPTION_TOKEN_WEIGHT = 0.55;
const TOKEN_NORMALIZATION_OVERRIDES = new Map([
  ["photowalk", "photo"],
  ["movies", "movie"],
]);
const TOKEN_SUFFIX_NORMALIZATION_RULES: readonly TokenNormalizationRule[] = [
  {
    minLength: 6,
    normalize: (token) => `${token.slice(0, -3)}y`,
    suffix: "ies",
  },
  {
    minLength: 6,
    normalize: (token) => removeTrailingDoubleConsonant(token.slice(0, -3)),
    suffix: "ing",
  },
  {
    minLength: 5,
    normalize: (token) => removeTrailingDoubleConsonant(token.slice(0, -2)),
    suffix: "ed",
  },
  {
    minLength: 5,
    normalize: (token) => token.slice(0, -1),
    suffix: "s",
  },
];
const MEANINGFUL_SHORT_TEMPLATE_TOKENS = new Set([
  "2d",
  "3d",
  "ai",
  "ar",
  "dj",
  "ui",
  "ux",
  "vr",
]);
const CATEGORY_ID_BY_LANE: Partial<
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
const TEXT_CATEGORY_RULES: readonly TextCategoryRule[] = [
  {
    id: "TRAVEL",
    pattern: /\b(?:route|walk|photo|city|local|map)\b/i,
  },
  {
    id: "ARTS",
    pattern: /\b(?:photo|gallery|art|creative|prompt)\b/i,
  },
  {
    id: "FOOD",
    pattern: /\b(?:coffee|cafe|table|brunch|food)\b/i,
  },
];
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
