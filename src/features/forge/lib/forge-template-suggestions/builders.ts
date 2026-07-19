import type { ActivityOption } from "@/features/forge/constants/forge.constants";
import type { TemplateSeed } from "@/features/forge/data/forge-template-seed-types";
import type { ForgePlanTemplate } from "@/features/forge/lib/forge-template";
import type { User } from "@/shared/schemas";

import {
  MIN_PERSONAL_FIT_SCORE,
  PERSONAL_FIT_TOP_SCORE_RATIO,
} from "./constants";
import {
  resolvePersistedTemplateCoverImage,
  resolveTemplateCoverPreviewImage,
} from "./cover-images";
import {
  buildPersonalizedCategoryFits,
  getActivityIntentScore,
  getActivityIntentSignals,
  getPersonalScore,
  hasPersonalizationSignals,
} from "./scoring";
import { getCategory, getCategorySeeds } from "./selectors";
import type { RankedTemplate, SuggestedTemplate } from "./types";

function getSuggestionBadge(
  item: RankedTemplate,
  index: number,
  topScore: number,
  hasPersonalSignals: boolean,
) {
  if (
    hasPersonalSignals &&
    item.score >= MIN_PERSONAL_FIT_SCORE &&
    item.score >= topScore * PERSONAL_FIT_TOP_SCORE_RATIO
  ) {
    return "Based on your profile";
  }

  if (index < 2) {
    return "Recommended";
  }

  return "Flexible";
}

export function buildCategoryFitHighlights(user: User | undefined) {
  return buildPersonalizedCategoryFits(user);
}

export function buildTemplateFromSeed(
  category: ActivityOption,
  seed: TemplateSeed,
  user: User | undefined,
): ForgePlanTemplate {
  return {
    selectedActivity: category.label,
    planName: seed.title,
    planDescription: seed.description,
    planLocation: "",
    planLocationLat: null,
    planLocationLng: null,
    locationType: seed.locationType ?? "TBD",
    planCost: "FREE",
    planCostAmount: "",
    planCostDetails: "",
    forgeMode: "AUTO",
    fixedSize: null,
    recommendedMinimumGroupSize: seed.recommendedMinimumGroupSize,
    recommendedMaximumGroupSize: seed.recommendedMaximumGroupSize,
    visibility: seed.visibility ?? "FRIENDS_ONLY",
    groupName: user?.city ? `${seed.groupName} - ${user.city}` : seed.groupName,
    groupDescription: seed.groupDescription,
    coverImage: resolvePersistedTemplateCoverImage(category, seed),
    avatarImage: null,
  };
}

export function buildTemplateSuggestions(
  selectedActivity: string | null,
  user: User | undefined,
): SuggestedTemplate[] {
  const category = getCategory(selectedActivity);
  const seeds = getCategorySeeds(category.id);
  const hasPersonalSignals = hasPersonalizationSignals(user);
  const activityIntentSignals = getActivityIntentSignals(
    selectedActivity,
    category,
  );
  const rankedSeeds = seeds
    .map<RankedTemplate>((seed, originalIndex) => ({
      originalIndex,
      score:
        getPersonalScore(seed, category, user) +
        getActivityIntentScore(seed, category, activityIntentSignals),
      seed,
      template: buildTemplateFromSeed(category, seed, user),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.originalIndex - right.originalIndex;
    });
  const topScore = rankedSeeds[0]?.score ?? 0;

  return rankedSeeds.map((item, index) => {
    const seed = item.seed;

    return {
      id: `${category.id}-${seed.id}`,
      categoryId: category.id,
      categoryLabel: category.label,
      coverImage: resolveTemplateCoverPreviewImage(seed),
      title: seed.title,
      description: seed.description,
      badge: getSuggestionBadge(item, index, topScore, hasPersonalSignals),
      score: item.score,
      template: item.template,
    };
  });
}
