import { normalizeDisplayScore } from "@/shared/lib/user-psychometrics";
import type { ExploreGroup } from "@/shared/schemas";

type RecommendationCompatibility = ExploreGroup["compatibility"];
type RecommendationFitSignal = {
  label: string;
  value: number;
};

const RECOMMENDATION_FIT_FALLBACK_LABELS = [
  "profile details",
  "activity interests",
] as const;

const RECOMMENDATION_FIT_SIGNAL_CONFIG = [
  {
    label: "shared interests",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.interestOverlap,
  },
  {
    label: "social style",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.personalityCompatibility,
  },
  {
    label: "location",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.cityAlignment,
  },
  {
    label: "age range",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.ageAlignment,
  },
  {
    label: "reliability",
    getValue: (compatibility: RecommendationCompatibility) =>
      compatibility.trustScore,
  },
] as const;

export function getRecommendationFitLine(group: ExploreGroup) {
  const compatibility = group.compatibility;
  const interestScore = normalizeScore(compatibility.interestOverlap);

  if (interestScore <= 0) {
    return "Close by and in your age range, but light on shared interests.";
  }

  const [first, second] = getTopRecommendationFitLabels(compatibility);

  return `Shared details: ${first} and ${second}.`;
}

export const normalizeScore = normalizeDisplayScore;

function getTopRecommendationFitLabels(
  compatibility: RecommendationCompatibility,
) {
  const strongest = getSortedRecommendationFitSignals(compatibility);

  return [
    getRecommendationFitLabel(strongest, 0),
    getRecommendationFitLabel(strongest, 1),
  ] as const;
}

function getRecommendationFitLabel(
  signals: RecommendationFitSignal[],
  index: 0 | 1,
) {
  const signal = signals[index];

  if (!signal) {
    return RECOMMENDATION_FIT_FALLBACK_LABELS[index];
  }

  return signal.label;
}

function getSortedRecommendationFitSignals(
  compatibility: RecommendationCompatibility,
) {
  return buildRecommendationFitSignals(compatibility).sort(
    compareRecommendationFitSignals,
  );
}

function buildRecommendationFitSignals(
  compatibility: RecommendationCompatibility,
): RecommendationFitSignal[] {
  return RECOMMENDATION_FIT_SIGNAL_CONFIG.map((signal) => ({
    label: signal.label,
    value: signal.getValue(compatibility),
  }));
}

function compareRecommendationFitSignals(
  left: RecommendationFitSignal,
  right: RecommendationFitSignal,
) {
  return normalizeScore(right.value) - normalizeScore(left.value);
}
