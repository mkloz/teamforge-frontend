import type { User } from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

export function normalizeTrustScore(score: number): number {
  if (!Number.isFinite(score)) {
    return 0;
  }

  const normalizedScore = score > 0 && score <= 1 ? score * 100 : score;

  return clampScore(Math.round(normalizedScore));
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

  const openness = normalizeOceanScore(oceanO);
  const conscientiousness = normalizeOceanScore(oceanC);
  const extraversion = normalizeOceanScore(oceanE);
  const agreeableness = normalizeOceanScore(oceanA);
  const neuroticism = normalizeOceanScore(oceanN);

  if (
    openness === null ||
    conscientiousness === null ||
    extraversion === null ||
    agreeableness === null ||
    neuroticism === null
  ) {
    return null;
  }

  return {
    openness,
    conscientiousness,
    extraversion,
    agreeableness,
    neuroticism,
  };
}

function normalizeOceanScore(score: number): number | null {
  if (!Number.isFinite(score)) {
    return null;
  }

  return clampScore(score);
}

function clampScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}
