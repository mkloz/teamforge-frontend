import type { OceanScores, OceanTraitKey } from "../../profile-contract";
import type { TraitProfile } from "../types";

export function buildTraitProfile(scores: OceanScores): TraitProfile {
  const entries = getOceanScoreEntries(scores);
  const high = new Set<OceanTraitKey>();
  const low = new Set<OceanTraitKey>();
  const moderateHigh = new Set<OceanTraitKey>();
  const moderateLow = new Set<OceanTraitKey>();

  for (const [key, value] of entries) {
    if (value >= 68) {
      high.add(key);
    }

    if (value >= 58) {
      moderateHigh.add(key);
    }

    if (value <= 32) {
      low.add(key);
    }

    if (value <= 42) {
      moderateLow.add(key);
    }
  }

  const [dominantKey, dominantValue] = entries.sort(
    (left, right) => right[1] - left[1],
  )[0];

  return {
    dominant: {
      key: dominantKey,
      label: getTraitLabel(dominantKey),
      value: dominantValue,
    },
    high,
    low,
    moderateHigh,
    moderateLow,
    scores,
  };
}

function getOceanScoreEntries(
  scores: OceanScores,
): Array<[OceanTraitKey, number]> {
  return [
    ["agreeableness", scores.agreeableness],
    ["conscientiousness", scores.conscientiousness],
    ["extraversion", scores.extraversion],
    ["neuroticism", scores.neuroticism],
    ["openness", scores.openness],
  ];
}

function getTraitLabel(key: OceanTraitKey) {
  const labels: Record<OceanTraitKey, string> = {
    agreeableness: "warmth",
    conscientiousness: "organization",
    extraversion: "social energy",
    neuroticism: "sensitivity",
    openness: "curiosity",
  };

  return labels[key];
}
