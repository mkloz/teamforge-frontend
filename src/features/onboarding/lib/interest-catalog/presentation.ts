import type { LucideIcon } from "lucide-react";
import { Circle } from "lucide-react";
import {
  categoryColorById,
  categoryShortLabelById,
  DEFAULT_CATEGORY_COLOR,
  subcategoryIconById,
} from "@/features/onboarding/data/interest-ui-metadata";

export function getCategoryColorClass(categoryId: string) {
  return categoryColorById[categoryId] ?? DEFAULT_CATEGORY_COLOR;
}

export function getCategoryShortLabel(categoryId: string, fallback: string) {
  return categoryShortLabelById[categoryId] ?? fallback;
}

export function getSubcategoryIcon(subcategoryId: string): LucideIcon {
  return subcategoryIconById[subcategoryId] ?? Circle;
}
