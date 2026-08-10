import type { ActivityOption } from "@/features/plan-creation/constants/plan-creation.constants";
import { FALLBACK_CATEGORY } from "@/features/plan-creation/data/plan-template-fit-signals";
import { CATEGORY_TEMPLATES } from "@/features/plan-creation/data/plan-template-seeds";
import {
  findActivityOption,
  getActivitySemanticTerms,
} from "@/features/plan-creation/lib/group-formation-activity-builders/activity-option-resolution";

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
