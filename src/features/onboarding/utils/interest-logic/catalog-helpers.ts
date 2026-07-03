import {
  getLeafInterests,
  getSubcategories,
} from "@/features/onboarding/lib/interest-catalog";
import type { Interest } from "@/shared/schemas";

type ActiveLeafInterestVisitor = (
  interest: Interest,
  subcategory: Interest,
  category: Interest,
) => void;

export function getActiveSubcategories(category: Interest) {
  if (!category.isActive) {
    return [];
  }

  return getSubcategories(category).filter(
    (subcategory) => subcategory.isActive,
  );
}

export function buildSubcategoryByLeafId(categories: Interest[]) {
  const subcategoryByLeafId = new Map<string, Interest>();

  forEachActiveLeafInterest(categories, (interest, subcategory) => {
    subcategoryByLeafId.set(interest.id, subcategory);
  });

  return subcategoryByLeafId;
}

export function buildCatalogOrderByLeafId(categories: Interest[]) {
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

export function getKnownSelectedIds(
  selectedIds: string[],
  categories: Interest[],
) {
  const knownIds = new Set(
    categories.flatMap((category) => getActiveCategoryLeafIds(category)),
  );

  return [...new Set(selectedIds)].filter((id) => knownIds.has(id));
}

export function getActiveCategoryLeafIds(category: Interest) {
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

export function getKnownActiveSelectedIds(
  selectedIds: string[],
  leafById: Record<string, Interest>,
) {
  return [...new Set(selectedIds)].filter((id) => leafById[id]?.isActive);
}
