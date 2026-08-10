import { ACTIVITIES } from "@/features/plan-creation/constants/plan-creation.constants";
import { resolvePlanCategory } from "@/features/plan-creation/lib/group-formation-activity-builders/activity-option-resolution";
import type { PlanIdeaLaunch } from "@/shared/navigation/plan-creation-navigation";
import type { PlanCategory } from "@/shared/schemas";

import { getIdeaSearchText } from "./idea-text";
import type { TextCategoryRule } from "./types";

const PRIMARY_LANE_CATEGORY_WEIGHT = 3;
const SECONDARY_LANE_CATEGORY_WEIGHT = 1.8;
const RESOLVED_ACTIVITY_CATEGORY_WEIGHT = 2.35;
const RESOLVED_TITLE_CATEGORY_WEIGHT = 2.15;
const TEXT_CATEGORY_WEIGHT = 1.15;
const FALLBACK_CATEGORY_WEIGHT = 0.6;
const CATEGORY_ID_BY_LANE: Partial<
  Record<NonNullable<PlanIdeaLaunch["laneKey"]>, PlanCategory>
> = {
  builder: "TECH",
  creative: "ARTS",
  food: "FOOD",
  general: "OTHER",
  learning: "LEARNING",
  outdoors: "OUTDOORS",
  play: "GAMING",
  social: "SOCIAL",
  wellness: "WELLNESS",
};
const TEXT_CATEGORY_RULES: readonly TextCategoryRule[] = [
  {
    id: "TRAVEL",
    pattern: /\b(?:route|walk|photo|city|local|map)\b/i,
  },
  {
    id: "ARTS",
    pattern: /\b(?:photo|gallery|art|creative|prompt)\b/i,
  },
  {
    id: "FOOD",
    pattern: /\b(?:coffee|cafe|table|brunch|food)\b/i,
  },
];

export function getCandidateCategories(idea: PlanIdeaLaunch) {
  const scoreById = new Map<PlanCategory, number>();
  const primaryId = mapLaneToCategoryId(idea.laneKey);
  const secondaryId = mapLaneToCategoryId(idea.secondaryLaneKey);
  const text = getIdeaSearchText(idea);
  const resolvedCategoryId = resolvePlanCategory(text);
  const resolvedTitleCategoryId = resolvePlanCategory(idea.title);

  if (primaryId) {
    addCategoryWeight(scoreById, primaryId, PRIMARY_LANE_CATEGORY_WEIGHT);
  }

  if (secondaryId) {
    addCategoryWeight(scoreById, secondaryId, SECONDARY_LANE_CATEGORY_WEIGHT);
  }

  addResolvedCategoryWeight(
    scoreById,
    resolvedCategoryId,
    RESOLVED_ACTIVITY_CATEGORY_WEIGHT,
  );
  addResolvedCategoryWeight(
    scoreById,
    resolvedTitleCategoryId,
    RESOLVED_TITLE_CATEGORY_WEIGHT,
  );
  addTextCategoryWeights(scoreById, text);

  if (scoreById.size === 0) {
    addCategoryWeight(scoreById, "OTHER", FALLBACK_CATEGORY_WEIGHT);
  }

  return ACTIVITIES.map((category) => ({
    category,
    weight: scoreById.get(category.id) ?? 0,
  }))
    .filter((candidate) => candidate.weight > 0)
    .sort((left, right) => right.weight - left.weight);
}

function mapLaneToCategoryId(lane: PlanIdeaLaunch["laneKey"]) {
  return lane ? CATEGORY_ID_BY_LANE[lane] : null;
}

function addTextCategoryWeights(
  scoreById: Map<PlanCategory, number>,
  text: string,
) {
  for (const rule of TEXT_CATEGORY_RULES) {
    if (rule.pattern.test(text)) {
      addCategoryWeight(scoreById, rule.id, TEXT_CATEGORY_WEIGHT);
    }
  }
}

function addResolvedCategoryWeight(
  scoreById: Map<PlanCategory, number>,
  id: PlanCategory,
  weight: number,
) {
  if (id === "OTHER") {
    return;
  }

  addCategoryWeight(scoreById, id, weight);
}

function addCategoryWeight(
  scoreById: Map<PlanCategory, number>,
  id: PlanCategory,
  weight: number,
) {
  scoreById.set(id, Math.max(scoreById.get(id) ?? 0, weight));
}
