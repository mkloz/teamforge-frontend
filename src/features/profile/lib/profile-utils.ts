import { getArchetype } from "@/features/profile/lib/archetypes";
import type {
  DimensionScore,
  OceanScores,
} from "@/features/profile/lib/profile-contract";
import {
  getUserOceanScores as getSharedUserOceanScores,
  normalizeTrustScore as normalizeSharedTrustScore,
} from "@/shared/lib/user-psychometrics";
import type { User } from "@/shared/schemas";

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

export function normalizeTrustScore(score: number): number {
  return normalizeSharedTrustScore(score);
}

export function getUserOceanScores(user: User): OceanScores | null {
  return getSharedUserOceanScores(user);
}

export function getUserDimensionScores(user: User): DimensionScore[] | null {
  const { oceanO, oceanC, oceanE, oceanA, oceanN } = user;

  if (
    oceanO === null ||
    oceanO === undefined ||
    oceanC === null ||
    oceanC === undefined ||
    oceanE === null ||
    oceanE === undefined ||
    oceanA === null ||
    oceanA === undefined ||
    oceanN === null ||
    oceanN === undefined
  ) {
    return null;
  }

  return createDimensionScores(oceanE, oceanO, oceanA, oceanC);
}

export function getUserArchetype(user: User): string {
  return user.personalityType
    ? getArchetype(user.personalityType)
    : "Still Taking Shape";
}
