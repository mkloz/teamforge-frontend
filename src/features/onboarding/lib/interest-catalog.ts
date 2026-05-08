import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";
import type { Interest } from "@/shared/schemas";
import {
  categoryColorById,
  categoryShortLabelById,
  DEFAULT_CATEGORY_COLOR,
  subcategoryIconById,
} from "../data/interest-ui-metadata";

export function getCategoryColorClass(categoryId: string) {
  return categoryColorById[categoryId] ?? DEFAULT_CATEGORY_COLOR;
}

export function getCategoryShortLabel(categoryId: string, fallback: string) {
  return categoryShortLabelById[categoryId] ?? fallback;
}

export function getSubcategoryIcon(subcategoryId: string): LucideIcon {
  return subcategoryIconById[subcategoryId] ?? Circle;
}

export function getSubcategories(category: Interest) {
  return category.children ?? [];
}

export function getLeafInterests(subcategory: Interest) {
  return subcategory.children ?? [];
}

export function buildLeafInterestMap(categories: Interest[]) {
  return categories.reduce<Record<string, Interest>>(
    (interestMap, category) => {
      for (const subcategory of getSubcategories(category)) {
        for (const interest of getLeafInterests(subcategory)) {
          interestMap[interest.id] = interest;
        }
      }

      return interestMap;
    },
    {},
  );
}

export function getCategoryLeafIds(category: Interest) {
  return getSubcategories(category).flatMap((subcategory) =>
    getLeafInterests(subcategory).map((interest) => interest.id),
  );
}
