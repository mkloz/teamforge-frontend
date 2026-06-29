import type { DimensionScore } from "@/features/profile/lib/profile-contract";
import { getArchetype } from "@/features/profile/public/profile-archetypes";
import { getUserOceanScores } from "@/shared/lib/user-psychometrics";
import type { User } from "@/shared/schemas";

type DimensionKey = "EI" | "SN" | "TF" | "JP";

interface DimensionScoreConfig {
  dimension: DimensionKey;
  score: number;
}

const DIMENSION_LETTER_PAIRS: Record<DimensionKey, [string, string]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

/**
 * Determines the MBTI letter from a score (0-100)
 * 0-50 = first letter, 51-100 = second letter
 */
function getLetterFromScore(dimension: DimensionKey, score: number): string {
  const [first, second] = DIMENSION_LETTER_PAIRS[dimension];

  return score <= 50 ? first : second;
}

/**
 * Checks if a score is borderline (between 45 and 55)
 */
function isBorderline(score: number): boolean {
  return score >= 45 && score <= 55;
}

/**
 * Creates an array of DimensionScore objects from individual scores
 */
function createDimensionScores(
  ei: number,
  sn: number,
  tf: number,
  jp: number,
): DimensionScore[] {
  const dimensionScores: DimensionScoreConfig[] = [
    { dimension: "EI", score: ei },
    { dimension: "SN", score: sn },
    { dimension: "TF", score: tf },
    { dimension: "JP", score: jp },
  ];

  return dimensionScores.map(createDimensionScore);
}

function createDimensionScore({
  dimension,
  score,
}: DimensionScoreConfig): DimensionScore {
  return {
    dimension,
    score,
    letter: getLetterFromScore(dimension, score),
    isBorderline: isBorderline(score),
  };
}

export function getUserDimensionScores(user: User): DimensionScore[] | null {
  const oceanScores = getUserOceanScores(user);

  if (!oceanScores) {
    return null;
  }

  return createDimensionScores(
    100 - oceanScores.extraversion,
    oceanScores.openness,
    oceanScores.agreeableness,
    100 - oceanScores.conscientiousness,
  );
}

export function getUserArchetype(user: User): string {
  return user.personalityType
    ? getArchetype(user.personalityType)
    : "Still Taking Shape";
}
