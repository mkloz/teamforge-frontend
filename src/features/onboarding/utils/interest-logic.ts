import { fuzzyMatch } from "@/shared/lib/fuzzy";
import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import {
  CORRELATED_TAGS,
  MBTI_SUGGESTIONS,
} from "../data/interest-recommendations";
import {
  getCategoryLeafIds,
  getLeafInterests,
  getSubcategories,
} from "../lib/interest-catalog";

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
      return Boolean(interest) && !rejectedIds.has(interest.id);
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
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { tags: [], subcategories: [] };

  const results: InterestSearchResults = { tags: [], subcategories: [] };

  for (const category of categories) {
    for (const subcategory of getSubcategories(category)) {
      if (fuzzyMatch(subcategory.name, q)) {
        results.subcategories.push({ subcategory, category });
      }
      for (const tag of getLeafInterests(subcategory)) {
        const matchedAlias = tag.aliases.find((alias) => fuzzyMatch(alias, q));
        if (fuzzyMatch(tag.name, q) || matchedAlias) {
          results.tags.push({
            tag,
            category,
            matchedAlias,
          });
        }
      }
    }
  }
  return results;
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
  const uniqueSelectedIds = [...new Set(selectedIds)];

  if (uniqueSelectedIds.length < 2) return [];

  const selectedSet = new Set(uniqueSelectedIds);
  const candidates = new Map<string, number>();
  const subcategoryByLeafId = buildSubcategoryByLeafId(categories);

  // 1. Explicit correlations (weighted high)
  for (const id of uniqueSelectedIds) {
    const correlated = CORRELATED_TAGS[id] || [];
    for (const relatedId of correlated) {
      if (
        !selectedSet.has(relatedId) &&
        !suggestedIds.has(relatedId) &&
        !rejectedIds.has(relatedId)
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
        !selectedSet.has(sibling.id) &&
        !suggestedIds.has(sibling.id) &&
        !rejectedIds.has(sibling.id)
      ) {
        candidates.set(sibling.id, (candidates.get(sibling.id) || 0) + 1);
      }
    }
  }

  return Array.from(candidates.entries())
    .sort((a, b) => b[1] - a[1])
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
    const categoryLeafIds = new Set(getCategoryLeafIds(category));
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
    for (const subcategory of getSubcategories(category)) {
      for (const interest of getLeafInterests(subcategory)) {
        subcategoryByLeafId.set(interest.id, subcategory);
      }
    }
  }

  return subcategoryByLeafId;
}

function getKnownSelectedIds(selectedIds: string[], categories: Interest[]) {
  const knownIds = new Set(
    categories.flatMap((category) => getCategoryLeafIds(category)),
  );

  return [...new Set(selectedIds)].filter((id) => knownIds.has(id));
}
