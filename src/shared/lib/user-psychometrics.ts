import type { User } from "@/shared/schemas";
import type { OceanScores } from "@/shared/types/psychometrics";

export type PercentScoreInputScale = "auto" | "fraction" | "percent";
export type OceanScoreInputScale = Exclude<PercentScoreInputScale, "auto">;

export interface NormalizePercentScoreOptions {
  inputScale?: PercentScoreInputScale;
  round?: boolean;
}

export interface GetUserOceanScoresOptions {
  inputScale?: OceanScoreInputScale;
}

export interface NormalizeTrustScoreOptions {
  inputScale?: PercentScoreInputScale;
}

export function normalizePercentScore(
  score: number,
  options: NormalizePercentScoreOptions = {},
): number | null {
  if (!Number.isFinite(score)) {
    return null;
  }

  const { inputScale = "percent", round = false } = options;
  const scaledScore =
    inputScale === "fraction" ||
    (inputScale === "auto" && score > 0 && score <= 1)
      ? score * 100
      : score;
  const normalizedScore = clampScore(scaledScore);

  return round ? Math.round(normalizedScore) : normalizedScore;
}

export function normalizeTrustScore(
  score: number,
  options: NormalizeTrustScoreOptions = {},
): number {
  const normalizedScore = normalizePercentScore(score, {
    inputScale: options.inputScale ?? "auto",
    round: true,
  });

  return normalizedScore ?? 0;
}

export function getUserOceanScores(
  user: User,
  options: GetUserOceanScoresOptions = {},
): OceanScores | null {
  const { oceanO, oceanC, oceanE, oceanA, oceanN } = user;
  const inputScale = options.inputScale ?? "percent";

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

  const openness = normalizeOceanScore(oceanO, inputScale);
  const conscientiousness = normalizeOceanScore(oceanC, inputScale);
  const extraversion = normalizeOceanScore(oceanE, inputScale);
  const agreeableness = normalizeOceanScore(oceanA, inputScale);
  const neuroticism = normalizeOceanScore(oceanN, inputScale);

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

function normalizeOceanScore(
  score: number,
  inputScale: OceanScoreInputScale,
): number | null {
  return normalizePercentScore(score, { inputScale });
}

function clampScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}
