import type { User } from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

export function normalizeTrustScore(score: number): number {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

export function getUserOceanScores(user: User): OceanScores | null {
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

  return {
    openness: oceanO,
    conscientiousness: oceanC,
    extraversion: oceanE,
    agreeableness: oceanA,
    neuroticism: oceanN,
  };
}
