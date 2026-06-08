import type { Interest } from "@/shared/schemas";
import type { PersonalityType } from "@/shared/schemas/enums";
import { personalityTypeSchema } from "@/shared/schemas/enums";
import { MBTI_SUGGESTIONS } from "../data/interest-recommendations";
import { getSubcategories } from "./interest-catalog";

export function createInitialCollapsedCategories(categories: Interest[]) {
  return new Set(categories.map((category) => category.id));
}

export function toggleCollapsedCategory(
  current: Set<string>,
  categoryId: string,
) {
  const next = new Set(current);

  if (next.has(categoryId)) {
    next.delete(categoryId);
  } else {
    next.add(categoryId);
  }

  return next;
}

export function expandCategoryOnly(categories: Interest[], categoryId: string) {
  const next = new Set(categories.map((category) => category.id));
  next.delete(categoryId);
  return next;
}

export function toggleExpandedSubcategory(
  categories: Interest[],
  current: Set<string>,
  subcategoryId: string,
) {
  const next = new Set(current);

  if (next.has(subcategoryId)) {
    next.delete(subcategoryId);
    return next;
  }

  const category = categories.find((item) =>
    getSubcategories(item).some(
      (subcategory) => subcategory.id === subcategoryId,
    ),
  );

  if (category) {
    for (const subcategory of getSubcategories(category)) {
      next.delete(subcategory.id);
    }
  }

  next.add(subcategoryId);
  return next;
}

export function readMbtiFromSearch(search: string): PersonalityType | null {
  const params = new URLSearchParams(search);
  const value = params.get("mbti");

  if (value && value in MBTI_SUGGESTIONS) {
    const parsed = personalityTypeSchema.safeParse(value);

    return parsed.success ? parsed.data : null;
  }

  return null;
}
