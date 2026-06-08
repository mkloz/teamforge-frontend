import type { ExploreGroup } from "@/shared/schemas";

export function getRecommendationFitLine(group: ExploreGroup) {
  const compatibility = group.compatibility;
  const interestScore = normalizeScore(compatibility.interestOverlap);

  if (interestScore <= 0) {
    return "Close by and in your age range, but light on shared interests.";
  }

  const strongest = [
    {
      label: "shared interests",
      value: compatibility.interestOverlap,
    },
    {
      label: "personality fit",
      value: compatibility.personalityCompatibility,
    },
    {
      label: "city fit",
      value: compatibility.cityAlignment,
    },
    {
      label: "age fit",
      value: compatibility.ageAlignment,
    },
    {
      label: "trust signal",
      value: compatibility.trustScore,
    },
  ].sort((a, b) => normalizeScore(b.value) - normalizeScore(a.value));

  const first = strongest[0]?.label ?? "profile fit";
  const second = strongest[1]?.label ?? "activity fit";

  return `Strong on ${first} and ${second}.`;
}

export function getRecommendationBadge(group: ExploreGroup) {
  const score = normalizeScore(group.compatibility.total);

  if (score >= 75) {
    return `${score}% strong fit`;
  }

  if (score >= 60) {
    return `${score}% worth a look`;
  }

  return "light fit";
}

export function normalizeScore(value: number) {
  if (value > 0 && value <= 1) {
    return Math.round(value * 100);
  }

  return Math.round(value);
}
