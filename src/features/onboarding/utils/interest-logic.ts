import { getFuzzyMatchScore, normalizeSearchText } from "@/shared/lib/fuzzy";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import {
  CORRELATED_TAGS,
  MBTI_SUGGESTIONS,
} from "../data/interest-recommendations";
import { getLeafInterests, getSubcategories } from "../lib/interest-catalog";

export interface InterestSearchResults {
  tags: Array<{
    category: Interest;
    matchedAlias?: string;
    tag: Interest;
  }>;
  subcategories: Array<{
    category: Interest;
    subcategory: Interest;
  }>;
}

interface SearchMatch {
  matchedAlias?: string;
  score: number;
}

/**
 * Calculates MBTI-based suggestions based on the user's personality type.
 */
export function getMbtiSuggestions(
  personalityType: PersonalityType | null,
  leafById: Record<string, Interest>,
  selectedIds: Set<string>,
  rejectedIds: Set<string>,
): Interest[] {
  if (!personalityType) return [];
  const suggestions = MBTI_SUGGESTIONS[personalityType] || [];

  return suggestions
    .map((id) => leafById[id])
    .filter((interest): interest is Interest => {
      return (
        Boolean(interest) && interest.isActive && !rejectedIds.has(interest.id)
      );
    })
    .sort((a, b) => {
      const aSelected = selectedIds.has(a.id);
      const bSelected = selectedIds.has(b.id);
      if (aSelected === bSelected) return 0;
      return aSelected ? 1 : -1;
    });
}

/**
 * Performs fuzzy search across categories, subcategories, and tags.
 */
export function getSearchResults(
  query: string,
  categories: Interest[],
): InterestSearchResults {
  const q = normalizeSearchText(query);
  if (q.length < 2) return { tags: [], subcategories: [] };

  const tagResults: Array<InterestSearchResults["tags"][number] & SearchMatch> =
    [];
  const subcategoryResults: Array<
    InterestSearchResults["subcategories"][number] & SearchMatch
  > = [];

  for (const category of categories) {
    if (!category.isActive) {
      continue;
    }

    for (const subcategory of getSubcategories(category)) {
      if (!subcategory.isActive) {
        continue;
      }

      const subcategoryMatch = getInterestSearchMatch(subcategory, q);

      if (subcategoryMatch) {
        subcategoryResults.push({
          subcategory,
          category,
          score: subcategoryMatch.score,
        });
      }

      for (const tag of getLeafInterests(subcategory)) {
        const tagMatch = getInterestSearchMatch(tag, q);

        if (tagMatch) {
          tagResults.push({
            tag,
            category,
            matchedAlias: tagMatch.matchedAlias,
            score: tagMatch.score,
          });
        }
      }
    }
  }

  return {
    subcategories: rankSearchResults(subcategoryResults).map(
      ({ score: _score, ...result }) => result,
    ),
    tags: rankSearchResults(tagResults).map(
      ({ score: _score, ...result }) => result,
    ),
  };
}

/**
 * Calculates "You Might Also Like" suggestions based on selected interests.
 */
export function getCorrelatedSuggestions(
  selectedIds: string[],
  rejectedIds: Set<string>,
  suggestedIds: Set<string>,
  leafById: Record<string, Interest>,
  categories: Interest[],
): Interest[] {
  const uniqueSelectedIds = getKnownActiveSelectedIds(selectedIds, leafById);

  if (uniqueSelectedIds.length < 2) return [];

  const selectedSet = new Set(uniqueSelectedIds);
  const candidates = new Map<string, number>();
  const subcategoryByLeafId = buildSubcategoryByLeafId(categories);
  const catalogOrderByLeafId = buildCatalogOrderByLeafId(categories);

  // 1. Explicit correlations (weighted high)
  for (const id of uniqueSelectedIds) {
    const correlated = CORRELATED_TAGS[id] || [];
    for (const relatedId of correlated) {
      if (
        canSuggestInterest(
          relatedId,
          leafById,
          selectedSet,
          rejectedIds,
          suggestedIds,
        )
      ) {
        candidates.set(relatedId, (candidates.get(relatedId) || 0) + 3);
      }
    }
  }

  // 2. Implicit subcategory siblings (weighted low)
  for (const id of uniqueSelectedIds) {
    const subcategory = subcategoryByLeafId.get(id);
    if (!subcategory) continue;

    for (const sibling of getLeafInterests(subcategory)) {
      if (
        sibling.id !== id &&
        canSuggestInterest(
          sibling.id,
          leafById,
          selectedSet,
          rejectedIds,
          suggestedIds,
        )
      ) {
        candidates.set(sibling.id, (candidates.get(sibling.id) || 0) + 1);
      }
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => {
      const scoreDelta = b[1] - a[1];

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      return (
        getCatalogOrder(a[0], catalogOrderByLeafId) -
        getCatalogOrder(b[0], catalogOrderByLeafId)
      );
    })
    .slice(0, 15)
    .map(([id]) => leafById[id])
    .filter((interest): interest is Interest => Boolean(interest));
}

/**
 * Checks if the user's choices are overly weighted in one category.
 */
export function getShouldShowBalanceNudge(
  selectedIds: string[],
  categories: Interest[],
): boolean {
  const knownSelectedIds = getKnownSelectedIds(selectedIds, categories);
  const selectedCount = knownSelectedIds.length;

  if (selectedCount < 10) return false;

  for (const category of categories) {
    const categoryLeafIds = new Set(getActiveCategoryLeafIds(category));
    const countInCat = knownSelectedIds.filter((id) =>
      categoryLeafIds.has(id),
    ).length;
    if (countInCat / selectedCount > 0.7) return true;
  }
  return false;
}

function buildSubcategoryByLeafId(categories: Interest[]) {
  const subcategoryByLeafId = new Map<string, Interest>();

  for (const category of categories) {
    if (!category.isActive) {
      continue;
    }

    for (const subcategory of getSubcategories(category)) {
      if (!subcategory.isActive) {
        continue;
      }

      for (const interest of getLeafInterests(subcategory)) {
        if (!interest.isActive) {
          continue;
        }

        subcategoryByLeafId.set(interest.id, subcategory);
      }
    }
  }

  return subcategoryByLeafId;
}

function buildCatalogOrderByLeafId(categories: Interest[]) {
  const catalogOrderByLeafId = new Map<string, number>();
  let order = 0;

  for (const category of categories) {
    if (!category.isActive) {
      continue;
    }

    for (const subcategory of getSubcategories(category)) {
      if (!subcategory.isActive) {
        continue;
      }

      for (const interest of getLeafInterests(subcategory)) {
        if (!interest.isActive) {
          continue;
        }

        catalogOrderByLeafId.set(interest.id, order);
        order++;
      }
    }
  }

  return catalogOrderByLeafId;
}

function getKnownSelectedIds(selectedIds: string[], categories: Interest[]) {
  const knownIds = new Set(
    categories.flatMap((category) => getActiveCategoryLeafIds(category)),
  );

  return [...new Set(selectedIds)].filter((id) => knownIds.has(id));
}

function getActiveCategoryLeafIds(category: Interest) {
  if (!category.isActive) {
    return [];
  }

  return getSubcategories(category)
    .filter((subcategory) => subcategory.isActive)
    .flatMap((subcategory) =>
      getLeafInterests(subcategory)
        .filter((interest) => interest.isActive)
        .map((interest) => interest.id),
    );
}

function getKnownActiveSelectedIds(
  selectedIds: string[],
  leafById: Record<string, Interest>,
) {
  return [...new Set(selectedIds)].filter((id) => leafById[id]?.isActive);
}

function canSuggestInterest(
  id: string,
  leafById: Record<string, Interest>,
  selectedIds: Set<string>,
  rejectedIds: Set<string>,
  suggestedIds: Set<string>,
) {
  const interest = leafById[id];

  return (
    Boolean(interest) &&
    interest.isActive &&
    !selectedIds.has(id) &&
    !suggestedIds.has(id) &&
    !rejectedIds.has(id)
  );
}

function getCatalogOrder(
  id: string,
  catalogOrderByLeafId: Map<string, number>,
) {
  return catalogOrderByLeafId.get(id) ?? Number.MAX_SAFE_INTEGER;
}

function getInterestSearchMatch(
  interest: Interest,
  query: string,
): SearchMatch | null {
  if (!interest.isActive) {
    return null;
  }

  const ownScore = Math.max(
    getFuzzyMatchScore(interest.name, query),
    getFuzzyMatchScore(interest.slug, query),
  );
  const aliasMatches = interest.aliases
    .map((alias) => ({
      alias,
      score: getFuzzyMatchScore(alias, query) - 3,
    }))
    .filter((match) => match.score > 0)
    .sort((a, b) => b.score - a.score);
  const bestAlias = aliasMatches[0];
  const bestScore = Math.max(ownScore, bestAlias?.score ?? 0);

  if (bestScore <= 0) {
    return null;
  }

  return {
    matchedAlias:
      bestAlias && bestAlias.score >= ownScore ? bestAlias.alias : undefined,
    score: bestScore,
  };
}

function rankSearchResults<T extends SearchMatch>(results: T[]) {
  return results.sort((a, b) => b.score - a.score);
}
