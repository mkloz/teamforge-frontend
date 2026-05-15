import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import {
  ACTIVITY_BY_LABEL,
  CATEGORY_TRAITS,
  FALLBACK_CATEGORY,
  TRAIT_KEYWORDS,
} from "@/features/forge/data/forge-template-fit-signals";
import type {
  TemplateSeed,
  TemplateTrait,
} from "@/features/forge/data/forge-template-seed-types";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import { PLAN_COVER_PRESET_IDS } from "@/shared/lib/plan-cover";
import type { User } from "@/shared/schemas";

const MIN_PERSONAL_FIT_SCORE = 3.4;
const PERSONAL_FIT_TOP_SCORE_RATIO = 0.72;
const MIN_CATEGORY_CONFIDENCE_SCORE = 2.6;
const MIN_CATEGORY_STRONG_TEMPLATE_SCORE = 3.4;
const MIN_CATEGORY_SUPPORTING_TEMPLATE_SCORE = 2.2;

const MEANINGFUL_SHORT_TOKENS = new Set([
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

const STOP_WORDS = new Set([
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

export interface SuggestedTemplate {
  id: string;
  categoryId: string;
  categoryLabel: string;
  coverImage: string | null;
  title: string;
  description: string;
  badge: string;
  score: number;
  template: ForgePlanTemplate;
}

interface RankedTemplate {
  originalIndex: number;
  score: number;
  seed: TemplateSeed;
  template: ForgePlanTemplate;
}

interface CategoryFit {
  bestScore: number;
  categoryId: string;
  confidenceScore: number;
  coverageScore: number;
  directScore: number;
  topScore: number;
}

type WeightedTraits = Map<TemplateTrait, number>;
const TEMPLATE_TRAIT_VALUES: TemplateTrait[] = [
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

function hashPresetSeed(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function resolveTemplateCoverImage(
  category: ActivityOption,
  seed: TemplateSeed,
) {
  const normalizedSource = seed.coverImageSource?.trim();

  if (!normalizedSource) {
    return null;
  }

  const existingPreset = PLAN_COVER_PRESET_IDS.find(
    (presetId) => presetId === normalizedSource,
  );

  if (existingPreset) {
    return existingPreset;
  }

  const presetIndex =
    hashPresetSeed(`${category.id}:${seed.id}:${normalizedSource}`) %
    PLAN_COVER_PRESET_IDS.length;

  return PLAN_COVER_PRESET_IDS[presetIndex] ?? null;
}

function resolveTemplatePreviewCoverImage(seed: TemplateSeed) {
  const normalizedSource = seed.coverImageSource?.trim();

  if (!normalizedSource) {
    return null;
  }

  return normalizedSource;
}

function addWeightedTrait(
  traits: WeightedTraits,
  trait: TemplateTrait,
  weight: number,
) {
  traits.set(trait, Math.max(traits.get(trait) ?? 0, weight));
}

function getCategory(selectedActivity: string | null) {
  if (!selectedActivity) {
    return FALLBACK_CATEGORY;
  }

  const normalizedActivity = normalizeText(selectedActivity).trim();
  const idMatch = ACTIVITIES.find(
    (activity) => normalizeText(activity.id) === normalizedActivity,
  );

  if (idMatch) {
    return idMatch;
  }

  return (
    ACTIVITY_BY_LABEL.get(selectedActivity) ??
    ACTIVITIES.find(
      (activity) => normalizeText(activity.label) === normalizedActivity,
    ) ??
    FALLBACK_CATEGORY
  );
}

function normalizeText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .toLowerCase();
}

function normalizeToken(token: string) {
  const normalized = normalizeText(token).replace(/[^a-z0-9]/g, "");

  if (normalized.length > 5 && normalized.endsWith("ies")) {
    return `${normalized.slice(0, -3)}y`;
  }

  if (normalized.length > 5 && normalized.endsWith("ing")) {
    const stem = normalized.slice(0, -3);

    return stem.at(-1) === stem.at(-2) ? stem.slice(0, -1) : stem;
  }

  if (normalized.length > 4 && normalized.endsWith("ed")) {
    const stem = normalized.slice(0, -2);

    return stem.at(-1) === stem.at(-2) ? stem.slice(0, -1) : stem;
  }

  if (normalized.length > 4 && normalized.endsWith("s")) {
    return normalized.slice(0, -1);
  }

  return normalized;
}

function getTextTokens(value: string) {
  return normalizeText(value)
    .split(/[^a-z0-9]+/)
    .map(normalizeToken)
    .filter(
      (token) =>
        (token.length >= 3 || MEANINGFUL_SHORT_TOKENS.has(token)) &&
        !STOP_WORDS.has(token),
    );
}

function getNormalizedPhrase(value: string) {
  return getTextTokens(value).join(" ");
}

function getUserInterestSignals(user: User | undefined) {
  const phrases = new Set<string>();
  const tokens = new Set<string>();

  for (const interest of user?.interests ?? []) {
    const labels = [interest.name, interest.slug, ...(interest.aliases ?? [])];

    for (const label of labels) {
      const phrase = getNormalizedPhrase(label);

      if (phrase) {
        phrases.add(phrase);
      }

      for (const token of getTextTokens(label)) {
        tokens.add(token);
      }
    }
  }

  return { phrases, tokens };
}

function getCandidateText(seed: TemplateSeed, category: ActivityOption) {
  return [
    seed.title,
    seed.description,
    seed.groupName,
    seed.groupDescription,
    category.label,
    category.description,
    ...(seed.interestHints ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function getTemplateTraits(seed: TemplateSeed, category: ActivityOption) {
  const text = getCandidateText(seed, category);
  const candidatePhrase = ` ${getNormalizedPhrase(text)} `;
  const candidateTokens = new Set(getTextTokens(text));
  const traits: WeightedTraits = new Map();

  for (const trait of CATEGORY_TRAITS[category.id] ?? []) {
    addWeightedTrait(traits, trait, 0.35);
  }

  if ((seed.fixedSize ?? 5) <= 4) {
    addWeightedTrait(traits, "small-group", 1.1);
  }

  if (seed.locationType === "ONLINE") {
    addWeightedTrait(traits, "online", 1);
  }

  for (const trait of TEMPLATE_TRAIT_VALUES) {
    const keywords = TRAIT_KEYWORDS[trait];
    const matchCount = keywords.filter((keyword) => {
      const normalizedKeyword = getNormalizedPhrase(keyword);

      if (!normalizedKeyword) {
        return false;
      }

      if (normalizedKeyword.includes(" ")) {
        return candidatePhrase.includes(` ${normalizedKeyword} `);
      }

      return candidateTokens.has(normalizedKeyword);
    }).length;

    if (matchCount > 0) {
      addWeightedTrait(traits, trait, Math.min(1, 0.45 + matchCount * 0.18));
    }
  }

  return traits;
}

function getInterestMatches(
  seed: TemplateSeed,
  category: ActivityOption,
  user: User | undefined,
) {
  const interestSignals = getUserInterestSignals(user);
  const hintTokens = new Set(
    (seed.interestHints ?? []).flatMap((hint) => getTextTokens(hint)),
  );
  const candidateText = [
    category.label,
    category.description,
    seed.title,
    seed.description,
    ...(seed.interestHints ?? []),
  ].join(" ");
  const candidatePhrase = getNormalizedPhrase(candidateText);
  const candidateTokens = new Set(getTextTokens(candidateText));
  let score = 0;

  for (const phrase of interestSignals.phrases) {
    if (!phrase) {
      continue;
    }

    if (phrase.includes(" ")) {
      if (` ${candidatePhrase} `.includes(` ${phrase} `)) {
        score += 1.8;
      }

      continue;
    }

    if (candidateTokens.has(phrase)) {
      score += 1.15;
    }
  }

  for (const token of interestSignals.tokens) {
    if (!candidateTokens.has(token)) {
      continue;
    }

    score += hintTokens.has(token) ? 1.2 : 0.7;
  }

  return Math.min(score, 7);
}

function getPersonalityTraits(user: User | undefined) {
  const traits: WeightedTraits = new Map();
  const type = user?.personalityType;

  if (type) {
    const [energy, information, decision, structure] = type;

    if (energy === "E") {
      addWeightedTrait(traits, "social", 0.75);
      addWeightedTrait(traits, "outgoing", 0.65);
    } else {
      addWeightedTrait(traits, "small-group", 0.75);
      addWeightedTrait(traits, "calm", 0.65);
      addWeightedTrait(traits, "focused", 0.45);
    }

    if (information === "N") {
      addWeightedTrait(traits, "creative", 0.65);
      addWeightedTrait(traits, "exploratory", 0.55);
    } else {
      addWeightedTrait(traits, "practical", 0.65);
      addWeightedTrait(traits, "structured", 0.45);
    }

    if (decision === "F") {
      addWeightedTrait(traits, "helpful", 0.65);
      addWeightedTrait(traits, "social", 0.55);
    } else {
      addWeightedTrait(traits, "focused", 0.65);
      addWeightedTrait(traits, "practical", 0.55);
    }

    if (structure === "J") {
      addWeightedTrait(traits, "structured", 0.75);
      addWeightedTrait(traits, "focused", 0.55);
    } else {
      addWeightedTrait(traits, "exploratory", 0.75);
      addWeightedTrait(traits, "creative", 0.55);
    }
  }

  if (typeof user?.oceanO === "number") {
    if (user.oceanO >= 70) {
      addWeightedTrait(traits, "creative", 1);
      addWeightedTrait(traits, "exploratory", 0.9);
    } else if (user.oceanO <= 35) {
      addWeightedTrait(traits, "practical", 0.75);
      addWeightedTrait(traits, "structured", 0.55);
    }
  }

  if (typeof user?.oceanC === "number") {
    if (user.oceanC >= 70) {
      addWeightedTrait(traits, "structured", 1);
      addWeightedTrait(traits, "focused", 0.9);
      addWeightedTrait(traits, "practical", 0.65);
    } else if (user.oceanC <= 35) {
      addWeightedTrait(traits, "exploratory", 0.6);
      addWeightedTrait(traits, "creative", 0.45);
    }
  }

  if (typeof user?.oceanE === "number") {
    if (user.oceanE >= 65) {
      addWeightedTrait(traits, "social", 1);
      addWeightedTrait(traits, "outgoing", 0.9);
      addWeightedTrait(traits, "active", 0.45);
    } else if (user.oceanE <= 40) {
      addWeightedTrait(traits, "small-group", 1);
      addWeightedTrait(traits, "calm", 0.85);
      addWeightedTrait(traits, "focused", 0.5);
    }
  }

  if (typeof user?.oceanA === "number") {
    if (user.oceanA >= 70) {
      addWeightedTrait(traits, "helpful", 1);
      addWeightedTrait(traits, "social", 0.55);
      addWeightedTrait(traits, "calm", 0.35);
    } else if (user.oceanA <= 35) {
      addWeightedTrait(traits, "focused", 0.55);
      addWeightedTrait(traits, "practical", 0.45);
    }
  }

  if (typeof user?.oceanN === "number") {
    if (user.oceanN >= 65) {
      addWeightedTrait(traits, "calm", 0.95);
      addWeightedTrait(traits, "structured", 0.7);
      addWeightedTrait(traits, "small-group", 0.45);
    } else if (user.oceanN <= 35) {
      addWeightedTrait(traits, "active", 0.55);
      addWeightedTrait(traits, "outgoing", 0.45);
      addWeightedTrait(traits, "exploratory", 0.35);
    }
  }

  return traits;
}

function getTraitScore(
  seed: TemplateSeed,
  category: ActivityOption,
  user: User | undefined,
) {
  const templateTraits = getTemplateTraits(seed, category);
  const userTraits = getPersonalityTraits(user);
  let score = 0;

  for (const [trait, templateWeight] of templateTraits) {
    const userWeight = userTraits.get(trait);

    if (userWeight) {
      score +=
        templateWeight * userWeight * (trait === "small-group" ? 1.15 : 1);
    }
  }

  return Math.min(score, 5);
}

function getPersonalScore(
  seed: TemplateSeed,
  category: ActivityOption,
  user: User | undefined,
) {
  const interestScore = getInterestMatches(seed, category, user) * 1.65;
  const cityScore =
    user?.city &&
    (seed.locationType === "IN_PERSON" || seed.locationType === "TBD")
      ? 0.45
      : 0;
  const traitScore = getTraitScore(seed, category, user);
  const onlinePenalty =
    seed.locationType === "ONLINE" && user?.city && (user.oceanE ?? 50) >= 55
      ? -0.35
      : 0;

  return interestScore + cityScore + traitScore + onlinePenalty;
}

function getAverage(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function getMedian(sortedDescendingValues: number[]) {
  if (sortedDescendingValues.length === 0) {
    return 0;
  }

  const middle = Math.floor(sortedDescendingValues.length / 2);

  if (sortedDescendingValues.length % 2 === 1) {
    return sortedDescendingValues[middle] ?? 0;
  }

  return (
    ((sortedDescendingValues[middle - 1] ?? 0) +
      (sortedDescendingValues[middle] ?? 0)) /
    2
  );
}

function getCategoryDirectScore(
  category: ActivityOption,
  user: User | undefined,
) {
  const interestSignals = getUserInterestSignals(user);
  const categoryText = `${category.id} ${category.label} ${category.description}`;
  const categoryPhrase = ` ${getNormalizedPhrase(categoryText)} `;
  const categoryTokens = new Set(getTextTokens(categoryText));
  let score = 0;

  for (const phrase of interestSignals.phrases) {
    if (phrase.includes(" ")) {
      if (categoryPhrase.includes(` ${phrase} `)) {
        score += 1.8;
      }

      continue;
    }

    if (categoryTokens.has(phrase)) {
      score += 1.2;
    }
  }

  for (const token of interestSignals.tokens) {
    if (categoryTokens.has(token)) {
      score += 0.7;
    }
  }

  return Math.min(score, 4);
}

function buildCategoryFit(
  category: ActivityOption,
  user: User | undefined,
): CategoryFit {
  const scores = getCategorySeeds(category.id)
    .map((seed) => getPersonalScore(seed, category, user))
    .sort((left, right) => right - left);
  const bestScore = scores[0] ?? 0;
  const topScore = getAverage(scores.slice(0, 3));
  const averageScore = getAverage(scores);
  const medianScore = getMedian(scores);
  const strongTemplateCount = scores.filter(
    (score) => score >= MIN_CATEGORY_STRONG_TEMPLATE_SCORE,
  ).length;
  const supportingTemplateCount = scores.filter(
    (score) => score >= MIN_CATEGORY_SUPPORTING_TEMPLATE_SCORE,
  ).length;
  const coverageScore =
    (strongTemplateCount * 1.2 + supportingTemplateCount * 0.45) /
    Math.max(1, scores.length);
  const directScore = getCategoryDirectScore(category, user);
  const confidenceScore =
    topScore * 0.42 +
    averageScore * 0.22 +
    medianScore * 0.14 +
    bestScore * 0.08 +
    directScore * 0.45 +
    coverageScore * 1.5;

  return {
    bestScore,
    categoryId: category.id,
    confidenceScore,
    coverageScore,
    directScore,
    topScore,
  };
}

function hasEnoughCategoryEvidence(fit: CategoryFit) {
  return (
    fit.confidenceScore >= MIN_CATEGORY_CONFIDENCE_SCORE &&
    (fit.directScore > 0 ||
      fit.coverageScore >= 0.18 ||
      fit.topScore >= MIN_CATEGORY_STRONG_TEMPLATE_SCORE ||
      fit.bestScore >= MIN_PERSONAL_FIT_SCORE * 1.8)
  );
}

function getCategorySeeds(categoryId: string) {
  return CATEGORY_TEMPLATES[categoryId] ?? CATEGORY_TEMPLATES.OTHER;
}

function hasPersonalizationSignals(user: User | undefined) {
  return Boolean(
    user &&
      ((user.interests?.length ?? 0) > 0 ||
        user.personalityType ||
        typeof user.oceanO === "number" ||
        typeof user.oceanC === "number" ||
        typeof user.oceanE === "number" ||
        typeof user.oceanA === "number" ||
        typeof user.oceanN === "number"),
  );
}

export function buildCategoryFitHighlights(user: User | undefined) {
  if (!hasPersonalizationSignals(user)) {
    return [];
  }

  return ACTIVITIES.map((category) => buildCategoryFit(category, user))
    .filter(hasEnoughCategoryEvidence)
    .sort((left, right) => {
      if (right.confidenceScore !== left.confidenceScore) {
        return right.confidenceScore - left.confidenceScore;
      }

      if (right.topScore !== left.topScore) {
        return right.topScore - left.topScore;
      }

      return right.bestScore - left.bestScore;
    })
    .slice(0, 3);
}

function getSuggestionBadge(
  item: RankedTemplate,
  index: number,
  topScore: number,
  hasPersonalSignals: boolean,
) {
  if (
    hasPersonalSignals &&
    item.score >= MIN_PERSONAL_FIT_SCORE &&
    item.score >= topScore * PERSONAL_FIT_TOP_SCORE_RATIO
  ) {
    return "Personal fit";
  }

  if (index < 2) {
    return "Recommended";
  }

  return "Flexible";
}

function buildTemplate(
  category: ActivityOption,
  seed: TemplateSeed,
  user: User | undefined,
): ForgePlanTemplate {
  return {
    selectedActivity: category.label,
    planName: seed.title,
    planDescription: seed.description,
    planLocation: "",
    planLocationLat: null,
    planLocationLng: null,
    locationType: seed.locationType ?? "TBD",
    planCost: "FREE",
    planCostAmount: "",
    planCostDetails: "",
    forgeMode: "AUTO",
    fixedSize: seed.fixedSize ?? 5,
    visibility: seed.visibility ?? "FRIENDS_ONLY",
    groupName: user?.city ? `${seed.groupName} - ${user.city}` : seed.groupName,
    groupDescription: seed.groupDescription,
    coverImage: resolveTemplateCoverImage(category, seed),
    avatarImage: null,
  };
}

export function buildTemplateSuggestions(
  selectedActivity: string | null,
  user: User | undefined,
): SuggestedTemplate[] {
  const category = getCategory(selectedActivity);
  const seeds = getCategorySeeds(category.id);
  const hasPersonalSignals = hasPersonalizationSignals(user);
  const rankedSeeds = seeds
    .map<RankedTemplate>((seed, originalIndex) => ({
      originalIndex,
      score: getPersonalScore(seed, category, user),
      seed,
      template: buildTemplate(category, seed, user),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.originalIndex - right.originalIndex;
    });
  const topScore = rankedSeeds[0]?.score ?? 0;

  return rankedSeeds.map((item, index) => {
    const seed = item.seed;

    return {
      id: `${category.id}-${seed.id}`,
      categoryId: category.id,
      categoryLabel: category.label,
      coverImage: resolveTemplatePreviewCoverImage(seed),
      title: seed.title,
      description: seed.description,
      badge: getSuggestionBadge(item, index, topScore, hasPersonalSignals),
      score: item.score,
      template: item.template,
    };
  });
}
