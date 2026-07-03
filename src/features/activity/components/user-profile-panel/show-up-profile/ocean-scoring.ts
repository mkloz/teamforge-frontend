import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";
import type { UserProfilePanelParticipant } from "../types";
import type { RankedOceanSignal } from "./types";

export const TRAIT_KEYS: OceanTraitKey[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

export const TRAIT_TIEBREAK_RANK: Record<OceanTraitKey, number> = {
  agreeableness: 0,
  conscientiousness: 1,
  extraversion: 2,
  openness: 3,
  neuroticism: 4,
};

const BALANCED_SIGNAL_BAND = 8;
const STRONG_SIGNAL_DISTANCE = 25;
export const MAX_SIGNAL_COUNT = 3;

export function getParticipantOceanScores(
  participant: UserProfilePanelParticipant,
) {
  const entries = [
    ["openness", participant.oceanO],
    ["conscientiousness", participant.oceanC],
    ["extraversion", participant.oceanE],
    ["agreeableness", participant.oceanA],
    ["neuroticism", participant.oceanN],
  ] as const;
  const scores = entries
    .map(([trait, score]) => {
      const normalizedScore = normalizeScore(score);

      return normalizedScore === null
        ? null
        : {
            trait,
            score: normalizedScore,
          };
    })
    .filter(
      (item): item is { trait: OceanTraitKey; score: number } => item !== null,
    );

  if (scores.length === 0) {
    return null;
  }

  return Object.fromEntries(
    scores.map(({ score, trait }) => [trait, score]),
  ) as Partial<OceanScores>;
}

export function rankOceanSignal(
  key: OceanTraitKey,
  score: number,
): RankedOceanSignal {
  const distanceFromMiddle = Math.abs(score - 50);
  const direction =
    distanceFromMiddle <= BALANCED_SIGNAL_BAND
      ? "balanced"
      : score > 50
        ? "high"
        : "low";

  return {
    key,
    score,
    strength: distanceFromMiddle,
    direction,
    confidence: getOceanSignalConfidence(distanceFromMiddle),
  };
}

function getOceanSignalConfidence(distanceFromMiddle: number) {
  if (distanceFromMiddle <= BALANCED_SIGNAL_BAND) {
    return 0.64;
  }

  return Math.min(0.95, 0.68 + distanceFromMiddle / STRONG_SIGNAL_DISTANCE / 4);
}

function normalizeScore(score: number | null | undefined) {
  if (typeof score !== "number" || !Number.isFinite(score)) {
    return null;
  }

  const percent = score > 0 && score <= 1 ? score * 100 : score;

  return Math.max(0, Math.min(100, Math.round(percent)));
}
