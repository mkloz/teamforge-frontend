import type { ActivityOption } from "@/features/forge/constants/forge.constants";
import { FALLBACK_CATEGORY } from "@/features/forge/data/forge-template-fit-signals";
import { CATEGORY_TEMPLATES } from "@/features/forge/data/forge-template-seeds";
import {
  findActivityOption,
  getActivitySemanticTerms,
} from "@/features/forge/lib/forge-activity-builders/activity-option-resolution";

export function getCategory(selectedActivity: string | null) {
  if (!selectedActivity) {
    return FALLBACK_CATEGORY;
  }

  return findActivityOption(selectedActivity) ?? FALLBACK_CATEGORY;
}

export function getCategorySeeds(categoryId: string) {
  return CATEGORY_TEMPLATES[categoryId] ?? CATEGORY_TEMPLATES.OTHER;
}

export function getCategoryBaseText(category: ActivityOption) {
  return [category.id, category.label, category.description].join(" ");
}

export function getCategorySearchText(category: ActivityOption) {
  return [
    getCategoryBaseText(category),
    ...getActivitySemanticTerms(category.id),
  ].join(" ");
}
