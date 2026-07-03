import { getLeafInterests } from "@/features/onboarding/lib/interest-catalog";
import { getActiveSubcategories } from "@/features/onboarding/utils/interest-logic/catalog-helpers";
import { getFuzzyMatchScore, normalizeSearchText } from "@/shared/lib/fuzzy";
import type { Interest } from "@/shared/schemas";

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
