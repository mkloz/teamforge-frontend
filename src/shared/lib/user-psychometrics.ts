import type { User } from "@/shared/schemas";
import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

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

type UserOceanScoreField = keyof Pick<
  User,
  "oceanO" | "oceanC" | "oceanE" | "oceanA" | "oceanN"
>;

const OCEAN_USER_SCORE_FIELDS = [
  ["openness", "oceanO"],
  ["conscientiousness", "oceanC"],
  ["extraversion", "oceanE"],
  ["agreeableness", "oceanA"],
  ["neuroticism", "oceanN"],
] as const satisfies ReadonlyArray<
  readonly [OceanTraitKey, UserOceanScoreField]
>;

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

export function normalizeDisplayScore(score: number): number {
  if (score > 0 && score <= 1) {
    return Math.round(score * 100);
  }

  return Math.round(score);
}

export function getUserOceanScores(
  user: User,
  options: GetUserOceanScoresOptions = {},
): OceanScores | null {
  const inputScale = options.inputScale ?? "percent";
  const scores = {
    openness: getUserOceanScore({ inputScale, rawScore: user.oceanO }),
    conscientiousness: getUserOceanScore({
      inputScale,
      rawScore: user.oceanC,
    }),
    extraversion: getUserOceanScore({ inputScale, rawScore: user.oceanE }),
    agreeableness: getUserOceanScore({ inputScale, rawScore: user.oceanA }),
    neuroticism: getUserOceanScore({ inputScale, rawScore: user.oceanN }),
  };

  return hasCompleteOceanScores(scores) ? scores : null;
}

function normalizeOceanScore(
  score: number,
  inputScale: OceanScoreInputScale,
): number | null {
  return normalizePercentScore(score, { inputScale });
}

function getUserOceanScore({
  inputScale,
  rawScore,
}: {
  inputScale: OceanScoreInputScale;
  rawScore: User[UserOceanScoreField];
}) {
  return rawScore === null || rawScore === undefined
    ? null
    : normalizeOceanScore(rawScore, inputScale);
}

function hasCompleteOceanScores(
  scores: Record<OceanTraitKey, number | null>,
): scores is OceanScores {
  return OCEAN_USER_SCORE_FIELDS.every(([trait]) => scores[trait] !== null);
}

function clampScore(score: number) {
  return Math.min(Math.max(score, 0), 100);
}
