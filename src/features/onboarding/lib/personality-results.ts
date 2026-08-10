import { generateDetailedDescription } from "@/shared/lib/personality-profile";
import type { PublicPersonalityProfile } from "@/shared/schemas/public-personality-profile";
import type { DimensionScore } from "@/shared/types/psychometrics";

export const PERSONALITY_INTERSECTION_DISTANCE_FROM_MIDPOINT = 8;
const GROUP_READ_SENTENCE_COUNT = 2;

export function getPersonalityResultViewModel(
  profile: PublicPersonalityProfile,
) {
  const resultProfile = generateDetailedDescription(profile.ocean);

  return {
    dimensionScores: getDimensionScores(profile),
    groupRead: getCompactText(
      resultProfile.inGroups,
      GROUP_READ_SENTENCE_COUNT,
    ),
    oceanScores: profile.ocean,
    profile: resultProfile,
  };
}

function getDimensionScores(
  profile: PublicPersonalityProfile,
): DimensionScore[] {
  const { ocean, personalityType } = profile;

  return [
    buildDimensionScore("EI", 100 - ocean.extraversion, personalityType[0]),
    buildDimensionScore("SN", ocean.openness, personalityType[1]),
    buildDimensionScore("TF", ocean.agreeableness, personalityType[2]),
    buildDimensionScore(
      "JP",
      100 - ocean.conscientiousness,
      personalityType[3],
    ),
  ];
}

function buildDimensionScore(
  dimension: DimensionScore["dimension"],
  score: number,
  letter: string,
): DimensionScore {
  return {
    dimension,
    score,
    letter,
    isBorderline: isPersonalityScoreInIntersectionRange(score),
  };
}

export function isPersonalityScoreInIntersectionRange(score: number) {
  return (
    Math.abs(score - 50) <= PERSONALITY_INTERSECTION_DISTANCE_FROM_MIDPOINT
  );
}

function getCompactText(value: string, maxSentences: number) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];

  return sentences.slice(0, maxSentences).join(" ").trim();
}
