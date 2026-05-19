import { getFuzzyMatchScore, normalizeSearchText } from "@/shared/lib/fuzzy";
import type { User } from "@/shared/schemas";

import {
  findActivityOption,
  getActivitySemanticTerms,
} from "./activity-option-resolution";

const SELECTED_ACTIVITY_TERM_WEIGHT = 1;
const RESOLVED_ACTIVITY_TERM_WEIGHT = 0.88;
const SEMANTIC_ACTIVITY_TERM_WEIGHT = 0.82;
const ALIAS_MATCH_PENALTY = 3;

interface ScoredInterest {
  id: string;
  index: number;
  score: number;
}

interface WeightedActivityTerm {
  value: string;
  weight: number;
}

export function selectInterestIds(user: User, selectedActivity: string | null) {
  const interests = user.interests ?? [];
  const activeInterests = interests.filter((interest) => interest.isActive);

  if (activeInterests.length === 0) {
    return [];
  }

  const activityTerms = getActivitySearchTerms(selectedActivity);
  const matchingInterestIds = activeInterests
    .map((interest, index): ScoredInterest => {
      return {
        id: interest.id,
        index,
        score: getInterestActivityScore(interest, activityTerms),
      };
    })
    .filter((interest) => interest.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return left.index - right.index;
    })
    .map((interest) => interest.id);

  const sourceIds =
    matchingInterestIds.length > 0
      ? matchingInterestIds
      : activeInterests.map((interest) => interest.id);

  return dedupeInterestIds(sourceIds).slice(0, 10);
}

function dedupeInterestIds(ids: string[]) {
  return [...new Set(ids)];
}

function getActivitySearchTerms(selectedActivity: string | null) {
  const match = findActivityOption(selectedActivity);
  const terms: WeightedActivityTerm[] = [];

  addActivitySearchValue(
    terms,
    selectedActivity,
    SELECTED_ACTIVITY_TERM_WEIGHT,
  );
  addActivitySearchValue(terms, match?.label, RESOLVED_ACTIVITY_TERM_WEIGHT);
  addActivitySearchValue(
    terms,
    match?.description,
    RESOLVED_ACTIVITY_TERM_WEIGHT,
  );
  addActivitySearchValue(terms, match?.id, RESOLVED_ACTIVITY_TERM_WEIGHT);

  for (const term of getActivitySemanticTerms(match?.id)) {
    addActivitySearchValue(terms, term, SEMANTIC_ACTIVITY_TERM_WEIGHT);
  }

  return dedupeActivitySearchTerms(terms);
}

function getInterestActivityScore(
  interest: NonNullable<User["interests"]>[number],
  activityTerms: WeightedActivityTerm[],
) {
  if (activityTerms.length === 0) {
    return 0;
  }

  let bestScore = 0;

  for (const field of [interest.name, interest.slug]) {
    bestScore = Math.max(bestScore, getBestFieldScore(field, activityTerms));
  }

  for (const alias of interest.aliases) {
    bestScore = Math.max(
      bestScore,
      Math.max(
        getBestFieldScore(alias, activityTerms) - ALIAS_MATCH_PENALTY,
        0,
      ),
    );
  }

  return bestScore;
}

function getBestFieldScore(
  field: string,
  activityTerms: WeightedActivityTerm[],
) {
  let bestScore = 0;

  for (const term of activityTerms) {
    bestScore = Math.max(
      bestScore,
      getFuzzyMatchScore(field, term.value) * term.weight,
    );
  }

  return bestScore;
}

function addActivitySearchValue(
  terms: WeightedActivityTerm[],
  value: string | null | undefined,
  weight: number,
) {
  if (!value) {
    return;
  }

  const normalized = normalizeSearchText(value);

  if (!normalized) {
    return;
  }

  terms.push({ value: normalized, weight });

  for (const part of normalized.split(" ")) {
    if (part.length >= 3) {
      terms.push({ value: part, weight });
    }
  }
}

function dedupeActivitySearchTerms(terms: WeightedActivityTerm[]) {
  const weightByTerm = new Map<string, number>();

  for (const term of terms) {
    weightByTerm.set(
      term.value,
      Math.max(weightByTerm.get(term.value) ?? 0, term.weight),
    );
  }

  return [...weightByTerm].map(([value, weight]) => ({ value, weight }));
}
