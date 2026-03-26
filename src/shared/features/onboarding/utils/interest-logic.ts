import { fuzzyMatch } from "@/shared/lib/fuzzy";
import {
  CORRELATED_TAGS,
  INTEREST_CATEGORIES,
  LEAF_TAG_BY_ID,
  MBTI_SUGGESTIONS,
} from "../data/interests-data";
import type { LeafTag, MbtiType, SearchResults } from "../data/interests-types";

/**
 * Calculates MBTI-based suggestions based on the user's personality type.
 */
export function getMbtiSuggestions(
  mbtiType: MbtiType | null,
  selectedIds: Set<string>,
  rejectedIds: Set<string>,
): LeafTag[] {
  if (!mbtiType) return [];
  const suggestions = MBTI_SUGGESTIONS[mbtiType] || [];

  return suggestions
    .map((id) => LEAF_TAG_BY_ID[id])
    .filter((t): t is LeafTag => !!t && !rejectedIds.has(t.id))
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
export function getSearchResults(query: string): SearchResults {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return { tags: [], subcategories: [] };

  const results: SearchResults = { tags: [], subcategories: [] };

  for (const cat of INTEREST_CATEGORIES) {
    for (const sub of cat.subcategories) {
      if (fuzzyMatch(sub.label, q)) {
        results.subcategories.push({ sub, categoryLabel: cat.label });
      }
      for (const tag of sub.tags) {
        const matchedAlias = tag.aliases?.find((a) => fuzzyMatch(a, q));
        if (fuzzyMatch(tag.label, q) || matchedAlias) {
          results.tags.push({
            tag,
            categoryLabel: cat.label,
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
): LeafTag[] {
  if (selectedIds.length < 2) return [];

  const selectedSet = new Set(selectedIds);
  const candidates = new Map<string, number>();

  // 1. Explicit correlations (weighted high)
  for (const id of selectedIds) {
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
  for (const id of selectedIds) {
    const leaf = LEAF_TAG_BY_ID[id];
    if (!leaf) continue;

    // Find the subcategory this leaf belongs to
    // Optimisation: We could precompute this map if INTEREST_CATEGORIES is huge
    const category = INTEREST_CATEGORIES.find((c) =>
      c.subcategories.some((s) => s.tags.some((t) => t.id === id)),
    );
    if (!category) continue;
    const sub = category.subcategories.find((s) =>
      s.tags.some((t) => t.id === id),
    );
    if (!sub) continue;

    for (const sibling of sub.tags) {
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
    .map(([id]) => LEAF_TAG_BY_ID[id])
    .filter((t): t is LeafTag => !!t);
}

/**
 * Checks if the user's choices are overly weighted in one category.
 */
export function getShouldShowBalanceNudge(selectedIds: string[]): boolean {
  const selectedCount = selectedIds.length;
  if (selectedCount < 10) return false;

  for (const cat of INTEREST_CATEGORIES) {
    const catIds = new Set(
      cat.subcategories.flatMap((s) => s.tags.map((t) => t.id)),
    );
    const countInCat = selectedIds.filter((id) => catIds.has(id)).length;
    if (countInCat / selectedCount > 0.7) return true;
  }
  return false;
}
