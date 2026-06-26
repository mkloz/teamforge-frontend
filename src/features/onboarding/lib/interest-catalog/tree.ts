import type { Interest } from "@/shared/schemas";

type LeafInterestMap = Record<string, Interest>;

export function getSubcategories(category: Interest) {
  return category.children ?? [];
}

export function getLeafInterests(subcategory: Interest) {
  return subcategory.children ?? [];
}

export function buildLeafInterestMap(categories: Interest[]) {
  return categories.reduce<LeafInterestMap>((interestMap, category) => {
    for (const subcategory of getSubcategories(category)) {
      for (const interest of getLeafInterests(subcategory)) {
        interestMap[interest.id] = interest;
      }
    }

    return interestMap;
  }, {});
}
