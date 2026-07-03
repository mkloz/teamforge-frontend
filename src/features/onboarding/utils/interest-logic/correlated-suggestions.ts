import { CORRELATED_TAGS } from "@/features/onboarding/data/interest-recommendations";
import { getLeafInterests } from "@/features/onboarding/lib/interest-catalog";
import {
  buildCatalogOrderByLeafId,
  buildSubcategoryByLeafId,
  getKnownActiveSelectedIds,
} from "@/features/onboarding/utils/interest-logic/catalog-helpers";
import type { Interest } from "@/shared/schemas";

interface SuggestionCandidateContext {
  leafById: Record<string, Interest>;
  rejectedIds: Set<string>;
  selectedIds: Set<string>;
  suggestedIds: Set<string>;
}

type SuggestionCandidate = [id: string, score: number];

const EXPLICIT_CORRELATION_WEIGHT = 3;
const SUBCATEGORY_SIBLING_WEIGHT = 1;
const MAX_CORRELATED_SUGGESTIONS = 15;

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
