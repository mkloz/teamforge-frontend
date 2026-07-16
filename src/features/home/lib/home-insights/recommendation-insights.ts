import { normalizeDisplayScore } from "@/shared/lib/user-psychometrics";
import type { ExploreGroup } from "@/shared/schemas";

type RecommendationCompatibility = ExploreGroup["compatibility"];
type RecommendationFitSignal = {
  label: string;
  value: number;
};

const RECOMMENDATION_FIT_SIGNAL_CONFIG = [
  {
    getLabel: () => "shared interests",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.interestOverlap,
  },
  {
    getLabel: (group: ExploreGroup) =>
      group.plan?.locationMode === "ONLINE"
        ? "an online activity"
        : "the same city",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.cityAlignment,
  },
  {
    getLabel: () => "a similar age range",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.ageAlignment,
  },
  {
    getLabel: () => "someone you know",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.friendshipProximity,
  },
] as const;

export function getRecommendationFitLine(group: ExploreGroup) {
  const [first, second] = getTopRecommendationFitLabels(group);

  if (!first) {
    return "No shared details are shown yet.";
  }

  if (!second) {
    return `Shared detail: ${first}.`;
  }

  return `Shared details: ${first} and ${second}.`;
}

export const normalizeScore = normalizeDisplayScore;

function getTopRecommendationFitLabels(group: ExploreGroup) {
  const strongest = getSortedRecommendationFitSignals(group).filter(
    (signal) => normalizeScore(signal.value) > 0,
  );

  return [strongest[0]?.label, strongest[1]?.label] as const;
}

function getSortedRecommendationFitSignals(group: ExploreGroup) {
  return buildRecommendationFitSignals(group).sort(
    compareRecommendationFitSignals,
  );
}

function buildRecommendationFitSignals(
  group: ExploreGroup,
): RecommendationFitSignal[] {
  return RECOMMENDATION_FIT_SIGNAL_CONFIG.map((signal) => ({
    label: signal.getLabel(group),
    value: signal.getValue(group.compatibility),
  }));
}

function compareRecommendationFitSignals(
  left: RecommendationFitSignal,
  right: RecommendationFitSignal,
) {
  return normalizeScore(right.value) - normalizeScore(left.value);
}
