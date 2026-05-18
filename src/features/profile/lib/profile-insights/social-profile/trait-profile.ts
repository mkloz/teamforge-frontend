import type { OceanScores, OceanTraitKey } from "../../profile-contract";
import type { TraitProfile } from "../types";

export function buildTraitProfile(scores: OceanScores): TraitProfile {
  const normalizedScores = normalizeOceanScores(scores);
  const entries = getOceanScoreEntries(normalizedScores);
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
    scores: normalizedScores,
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

function normalizeOceanScores(scores: OceanScores): OceanScores {
  return {
    agreeableness: normalizeOceanScore(scores.agreeableness),
    conscientiousness: normalizeOceanScore(scores.conscientiousness),
    extraversion: normalizeOceanScore(scores.extraversion),
    neuroticism: normalizeOceanScore(scores.neuroticism),
    openness: normalizeOceanScore(scores.openness),
  };
}

function normalizeOceanScore(score: number) {
  if (!Number.isFinite(score)) {
    return NEUTRAL_OCEAN_SCORE;
  }

  return Math.min(Math.max(score, MIN_OCEAN_SCORE), MAX_OCEAN_SCORE);
}

const MIN_OCEAN_SCORE = 0;
const MAX_OCEAN_SCORE = 100;
const NEUTRAL_OCEAN_SCORE = 50;
