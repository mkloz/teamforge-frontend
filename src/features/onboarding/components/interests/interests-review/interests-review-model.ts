import {
  getLeafInterests,
  getSubcategories,
} from "@/features/onboarding/lib/interest-catalog";
import type { Interest } from "@/shared/schemas";

export interface InterestReviewGroup {
  category: Interest;
  tagIds: string[];
}

export function getInterestReviewGroups({
  categories,
  leafById,
  selectedIds,
}: {
  categories: Interest[];
  leafById: Record<string, Interest>;
  selectedIds: Set<string>;
}): InterestReviewGroup[] {
  return categories
    .map((category) => ({
      category,
      tagIds: getSelectedCategoryTagIds(category, leafById, selectedIds),
    }))
    .filter((group) => group.tagIds.length > 0);
}

export function getInterestShapeSummary(
  groups: InterestReviewGroup[],
  selectedCount: number,
) {
  const topCategories = [...groups]
    .sort((left, right) => right.tagIds.length - left.tagIds.length)
    .slice(0, 3)
    .map((group) => group.category.name.toLowerCase());
  const categoryPhrase = formatCategoryPhrase(topCategories);

  if (topCategories.length === 1) {
    return `Your ${selectedCount} picks have a strong ${categoryPhrase} thread. Add or remove anything that no longer feels like something you would actually choose.`;
  }

  return `Your ${selectedCount} picks lean toward ${categoryPhrase}. It feels specific without locking you into one narrow version of yourself.`;
}

function getSelectedCategoryTagIds(
  category: Interest,
  leafById: Record<string, Interest>,
  selectedIds: Set<string>,
) {
  const categoryTagIds = new Set(
    getSubcategories(category).flatMap((subcategory) =>
      getLeafInterests(subcategory).map((interest) => interest.id),
    ),
  );

  return Array.from(selectedIds).filter(
    (id) => leafById[id] && categoryTagIds.has(id),
  );
}

function formatCategoryPhrase(categories: string[]) {
  if (categories.length <= 1) {
    return categories[0] ?? "interest";
  }

  if (categories.length === 2) {
    return `${categories[0]} and ${categories[1]}`;
  }

  return `${categories[0]}, ${categories[1]}, and ${categories[2]}`;
}
