import {
  ACTIVITIES,
  type ActivityOption,
} from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import type { User } from "@/shared/schemas";

import {
  MIN_CATEGORY_CONFIDENCE_SCORE,
  MIN_CATEGORY_STRONG_TEMPLATE_SCORE,
  MIN_CATEGORY_SUPPORTING_TEMPLATE_SCORE,
  MIN_PERSONAL_FIT_SCORE,
  OCEAN_SCORE_KEYS,
} from "./constants";
import { getTraitScore, getUserInterestSignals } from "./personality-traits";
import {
  getCategoryBaseText,
  getCategorySearchText,
  getCategorySeeds,
} from "./selectors";
import {
  getExpandedTextTokens,
  getNormalizedPhrase,
  getTextTokens,
  normalizeText,
} from "./text";
import type { ActivityIntentSignals, CategoryFit } from "./types";

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
    getCategoryBaseText(category),
    seed.title,
    seed.description,
    ...(seed.interestHints ?? []),
  ].join(" ");
  const candidatePhrase = getNormalizedPhrase(candidateText);
  const candidateTokens = new Set(getTextTokens(candidateText));
  const score =
    getInterestPhraseMatchScore(
      interestSignals.phrases,
      candidatePhrase,
      candidateTokens,
    ) +
    getInterestTokenMatchScore(
      interestSignals.tokens,
      candidateTokens,
      hintTokens,
    );

  return Math.min(score, 7);
}

function getInterestPhraseMatchScore(
  phrases: Iterable<string>,
  candidatePhrase: string,
  candidateTokens: ReadonlySet<string>,
) {
  const paddedCandidatePhrase = ` ${candidatePhrase} `;
  let score = 0;

  for (const phrase of phrases) {
    if (!phrase) {
      continue;
    }

    if (phrase.includes(" ")) {
      if (paddedCandidatePhrase.includes(` ${phrase} `)) {
        score += 1.8;
      }

      continue;
    }

    if (candidateTokens.has(phrase)) {
      score += 1.15;
    }
  }

  return score;
}

function getInterestTokenMatchScore(
  tokens: Iterable<string>,
  candidateTokens: ReadonlySet<string>,
  hintTokens: ReadonlySet<string>,
) {
  let score = 0;

  for (const token of tokens) {
    if (!candidateTokens.has(token)) {
      continue;
    }

    score += hintTokens.has(token) ? 1.2 : 0.7;
  }

  return score;
}

export function getPersonalScore(
  seed: TemplateSeed,
  category: ActivityOption,
  user: User | undefined,
) {
  const interestScore = getInterestMatches(seed, category, user) * 1.65;
  const traitScore = getTraitScore(seed, category, user);

  return (
    interestScore +
    getCityFitScore(seed, user) +
    traitScore +
    getOnlineActivityPenalty(seed, user)
  );
}

function getCityFitScore(seed: TemplateSeed, user: User | undefined) {
  if (
    user?.city &&
    (seed.locationType === "IN_PERSON" || seed.locationType === "TBD")
  ) {
    return 0.45;
  }

  return 0;
}

function getOnlineActivityPenalty(seed: TemplateSeed, user: User | undefined) {
  return seed.locationType === "ONLINE" &&
    user?.city &&
    (user.oceanE ?? 50) >= 55
    ? -0.35
    : 0;
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
  const categoryText = getCategorySearchText(category);
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

export function getActivityIntentSignals(
  selectedActivity: string | null,
  category: ActivityOption,
): ActivityIntentSignals {
  if (
    !selectedActivity?.trim() ||
    isCanonicalCategoryText(selectedActivity, category)
  ) {
    return {
      tokens: new Set(),
    };
  }

  return {
    tokens: new Set(getExpandedTextTokens(selectedActivity)),
  };
}

function isCanonicalCategoryText(
  selectedActivity: string,
  category: ActivityOption,
) {
  const normalizedActivity = normalizeText(selectedActivity).trim();

  return (
    normalizedActivity === normalizeText(category.id).trim() ||
    normalizedActivity === normalizeText(category.label).trim()
  );
}

export function getActivityIntentScore(
  seed: TemplateSeed,
  category: ActivityOption,
  signals: ActivityIntentSignals,
) {
  if (signals.tokens.size === 0) {
    return 0;
  }

  const titleTokens = new Set(getTextTokens(seed.title));
  const hintTokens = new Set(
    (seed.interestHints ?? []).flatMap((hint) => getTextTokens(hint)),
  );
  const bodyTokens = new Set(
    getTextTokens(
      `${seed.description} ${seed.groupName} ${seed.groupDescription}`,
    ),
  );
  const categoryTokens = new Set(
    getTextTokens(getCategorySearchText(category)),
  );
  let score = 0;

  for (const token of signals.tokens) {
    if (titleTokens.has(token)) {
      score += 2.4;
      continue;
    }

    if (hintTokens.has(token)) {
      score += 1.75;
      continue;
    }

    if (bodyTokens.has(token)) {
      score += 0.95;
      continue;
    }

    if (categoryTokens.has(token)) {
      score += 0.35;
    }
  }

  return Math.min(score, 5);
}

export function hasPersonalizationSignals(user: User | undefined) {
  return Boolean(
    user &&
      (hasInterestSignals(user) ||
        user.personalityType ||
        hasOceanScoreSignals(user)),
  );
}

function hasInterestSignals(user: User) {
  return (user.interests?.length ?? 0) > 0;
}

function hasOceanScoreSignals(user: User) {
  return OCEAN_SCORE_KEYS.some((score) => typeof user[score] === "number");
}

export function buildPersonalizedCategoryFits(user: User | undefined) {
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
