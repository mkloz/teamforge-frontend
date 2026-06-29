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

type TagSearchResult = InterestSearchResults["tags"][number] & SearchMatch;
type SubcategorySearchResult = InterestSearchResults["subcategories"][number] &
  SearchMatch;

interface SearchResultAccumulator {
  subcategories: SubcategorySearchResult[];
  tags: TagSearchResult[];
}

interface SuggestionCandidateContext {
  leafById: Record<string, Interest>;
  rejectedIds: Set<string>;
  selectedIds: Set<string>;
  suggestedIds: Set<string>;
}

type SuggestionCandidate = [id: string, score: number];
type ActiveLeafInterestVisitor = (
  interest: Interest,
  subcategory: Interest,
  category: Interest,
) => void;

const EXPLICIT_CORRELATION_WEIGHT = 3;
const SUBCATEGORY_SIBLING_WEIGHT = 1;
const MAX_CORRELATED_SUGGESTIONS = 15;

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

  const results = createSearchResultAccumulator();

  for (const category of categories) {
    appendSearchResults(results, getCategorySearchResults(category, q));
  }

  return {
    subcategories: rankSearchResults(results.subcategories).map(
      ({ score: _score, ...result }) => result,
    ),
    tags: rankSearchResults(results.tags).map(
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
  const subcategoryByLeafId = buildSubcategoryByLeafId(categories);
  const catalogOrderByLeafId = buildCatalogOrderByLeafId(categories);
  const candidateContext: SuggestionCandidateContext = {
    leafById,
    selectedIds: selectedSet,
    rejectedIds,
    suggestedIds,
  };
  const candidates = buildCorrelatedSuggestionCandidates(
    uniqueSelectedIds,
    subcategoryByLeafId,
    candidateContext,
  );

  return rankCorrelatedSuggestionCandidates(candidates, {
    catalogOrderByLeafId,
    leafById,
  });
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

function createSearchResultAccumulator(): SearchResultAccumulator {
  return { subcategories: [], tags: [] };
}

function appendSearchResults(
  target: SearchResultAccumulator,
  source: SearchResultAccumulator,
) {
  target.subcategories.push(...source.subcategories);
  target.tags.push(...source.tags);
}

function getCategorySearchResults(
  category: Interest,
  query: string,
): SearchResultAccumulator {
  const results = createSearchResultAccumulator();

  for (const subcategory of getActiveSubcategories(category)) {
    appendSubcategorySearchResults(results, category, subcategory, query);
  }

  return results;
}

function appendSubcategorySearchResults(
  results: SearchResultAccumulator,
  category: Interest,
  subcategory: Interest,
  query: string,
) {
  const subcategoryResult = getSubcategorySearchResult(
    category,
    subcategory,
    query,
  );

  if (subcategoryResult) {
    results.subcategories.push(subcategoryResult);
  }

  results.tags.push(...getTagSearchResults(category, subcategory, query));
}

function getSubcategorySearchResult(
  category: Interest,
  subcategory: Interest,
  query: string,
): SubcategorySearchResult | null {
  const subcategoryMatch = getInterestSearchMatch(subcategory, query);

  if (!subcategoryMatch) {
    return null;
  }

  return {
    category,
    subcategory,
    score: subcategoryMatch.score,
  };
}

function getTagSearchResults(
  category: Interest,
  subcategory: Interest,
  query: string,
) {
  return getLeafInterests(subcategory)
    .map((tag) => getTagSearchResult(category, tag, query))
    .filter((result): result is TagSearchResult => Boolean(result));
}

function getTagSearchResult(
  category: Interest,
  tag: Interest,
  query: string,
): TagSearchResult | null {
  const tagMatch = getInterestSearchMatch(tag, query);

  if (!tagMatch) {
    return null;
  }

  return {
    category,
    matchedAlias: tagMatch.matchedAlias,
    score: tagMatch.score,
    tag,
  };
}

function getActiveSubcategories(category: Interest) {
  if (!category.isActive) {
    return [];
  }

  return getSubcategories(category).filter(
    (subcategory) => subcategory.isActive,
  );
}

function buildCorrelatedSuggestionCandidates(
  selectedIds: string[],
  subcategoryByLeafId: Map<string, Interest>,
  context: SuggestionCandidateContext,
) {
  const candidates = new Map<string, number>();

  addExplicitCorrelationCandidates(candidates, selectedIds, context);
  addSubcategorySiblingCandidates(
    candidates,
    selectedIds,
    subcategoryByLeafId,
    context,
  );

  return candidates;
}

function addExplicitCorrelationCandidates(
  candidates: Map<string, number>,
  selectedIds: string[],
  context: SuggestionCandidateContext,
) {
  for (const id of selectedIds) {
    for (const relatedId of CORRELATED_TAGS[id] || []) {
      addSuggestionCandidateScore(
        candidates,
        relatedId,
        EXPLICIT_CORRELATION_WEIGHT,
        context,
      );
    }
  }
}

function addSubcategorySiblingCandidates(
  candidates: Map<string, number>,
  selectedIds: string[],
  subcategoryByLeafId: Map<string, Interest>,
  context: SuggestionCandidateContext,
) {
  for (const id of selectedIds) {
    const subcategory = subcategoryByLeafId.get(id);

    if (!subcategory) {
      continue;
    }

    for (const sibling of getLeafInterests(subcategory)) {
      if (sibling.id === id) {
        continue;
      }

      addSuggestionCandidateScore(
        candidates,
        sibling.id,
        SUBCATEGORY_SIBLING_WEIGHT,
        context,
      );
    }
  }
}

function addSuggestionCandidateScore(
  candidates: Map<string, number>,
  id: string,
  score: number,
  context: SuggestionCandidateContext,
) {
  if (
    !canSuggestInterest(
      id,
      context.leafById,
      context.selectedIds,
      context.rejectedIds,
      context.suggestedIds,
    )
  ) {
    return;
  }

  candidates.set(id, (candidates.get(id) || 0) + score);
}

function rankCorrelatedSuggestionCandidates(
  candidates: Map<string, number>,
  options: {
    catalogOrderByLeafId: Map<string, number>;
    leafById: Record<string, Interest>;
  },
) {
  return Array.from(candidates.entries())
    .sort((a, b) =>
      compareSuggestionCandidates(a, b, options.catalogOrderByLeafId),
    )
    .slice(0, MAX_CORRELATED_SUGGESTIONS)
    .map(([id]) => options.leafById[id])
    .filter((interest): interest is Interest => Boolean(interest));
}

function compareSuggestionCandidates(
  a: SuggestionCandidate,
  b: SuggestionCandidate,
  catalogOrderByLeafId: Map<string, number>,
) {
  const scoreDelta = b[1] - a[1];

  if (scoreDelta !== 0) {
    return scoreDelta;
  }

  return (
    getCatalogOrder(a[0], catalogOrderByLeafId) -
    getCatalogOrder(b[0], catalogOrderByLeafId)
  );
}

function buildSubcategoryByLeafId(categories: Interest[]) {
  const subcategoryByLeafId = new Map<string, Interest>();

  forEachActiveLeafInterest(categories, (interest, subcategory) => {
    subcategoryByLeafId.set(interest.id, subcategory);
  });

  return subcategoryByLeafId;
}

function buildCatalogOrderByLeafId(categories: Interest[]) {
  const catalogOrderByLeafId = new Map<string, number>();
  let order = 0;

  forEachActiveLeafInterest(categories, (interest) => {
    catalogOrderByLeafId.set(interest.id, order);
    order++;
  });

  return catalogOrderByLeafId;
}

function forEachActiveLeafInterest(
  categories: Interest[],
  visit: ActiveLeafInterestVisitor,
) {
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

        visit(interest, subcategory, category);
      }
    }
  }
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
