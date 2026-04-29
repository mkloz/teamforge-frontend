import type { Interest } from "@/shared/schemas";
import { Circle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { INTEREST_CATEGORIES } from "../data/interests-data";

const DEFAULT_CATEGORY_COLOR = "bg-slate-muted/30";

const categoryColorById = Object.fromEntries(
  INTEREST_CATEGORIES.map((category) => [category.id, category.color]),
);

const subcategoryIconById = Object.fromEntries(
  INTEREST_CATEGORIES.flatMap((category) =>
    category.subcategories.map((subcategory) => [
      subcategory.id,
      subcategory.icon,
    ]),
  ),
) as Record<string, LucideIcon>;

const categoryShortLabelById: Record<string, string> = {
  careers: "Career",
  lifestyle: "Lifestyle",
  entertainment: "Entertainment",
  sports_outdoors: "Sports & Outdoors",
  hobbies_creating: "Hobbies",
};

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
  return Object.fromEntries(
    categories.flatMap((category) =>
      getSubcategories(category).flatMap((subcategory) =>
        getLeafInterests(subcategory).map((interest) => [
          interest.id,
          interest,
        ]),
      ),
    ),
  ) as Record<string, Interest>;
}

export function getCategoryLeafIds(category: Interest) {
  return getSubcategories(category).flatMap((subcategory) =>
    getLeafInterests(subcategory).map((interest) => interest.id),
  );
}
