import type { User } from "@/shared/schemas";
import type {
  DimensionScore,
  OceanScores,
  UserProfile,
} from "../types/profile.types";

/**
 * Determines the MBTI letter from a score (0-100)
 * 0-50 = first letter, 51-100 = second letter
 */
export function getLetterFromScore(dimension: string, score: number): string {
  const pairs: Record<string, [string, string]> = {
    EI: ["E", "I"],
    SN: ["S", "N"],
    TF: ["T", "F"],
    JP: ["J", "P"],
  };
  const [first, second] = pairs[dimension];
  return score <= 50 ? first : second;
}

/**
 * Checks if a score is borderline (between 45 and 55)
 */
export function isBorderline(score: number): boolean {
  return score >= 45 && score <= 55;
}

/**
 * Creates an array of DimensionScore objects from individual scores
 */
export function createDimensionScores(
  ei: number,
  sn: number,
  tf: number,
  jp: number,
): DimensionScore[] {
  return [
    {
      dimension: "EI",
      score: ei,
      letter: getLetterFromScore("EI", ei),
      isBorderline: isBorderline(ei),
    },
    {
      dimension: "SN",
      score: sn,
      letter: getLetterFromScore("SN", sn),
      isBorderline: isBorderline(sn),
    },
    {
      dimension: "TF",
      score: tf,
      letter: getLetterFromScore("TF", tf),
      isBorderline: isBorderline(tf),
    },
    {
      dimension: "JP",
      score: jp,
      letter: getLetterFromScore("JP", jp),
      isBorderline: isBorderline(jp),
    },
  ];
}

/**
 * Transforms a raw User object from the schema into a rich UserProfile
 * projection with derived psychometric scores and UI-ready fields.
 */
export function inflateUserProfile(user: User): UserProfile {
  const oceanScores: OceanScores = {
    openness: user.oceanO ?? 50,
    conscientiousness: user.oceanC ?? 50,
    extraversion: user.oceanE ?? 50,
    agreeableness: user.oceanA ?? 50,
    neuroticism: user.oceanN ?? 50,
  };

  return {
    ...user,
    oceanScores,
    dimensionScores: createDimensionScores(
      user.oceanE ?? 50,
      user.oceanO ?? 50,
      user.oceanA ?? 50,
      user.oceanC ?? 50,
    ),
    archetype: user.personalityType ? "The Explorer" : "The Adaptive Ally", // Simplified for now
    interests: user.interests ?? [],
  };
}
