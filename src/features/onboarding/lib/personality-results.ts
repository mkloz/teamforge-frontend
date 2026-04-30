import type { DimensionScore, OceanScores } from "@/shared/types/psychometrics";
import type { PersonalityEvaluation } from "./personality-evaluation";
import type { OceanVectorWithMeta } from "../utils/score-calculator";

const SOFT_BOUNDARY_THRESHOLD = 0.167;

export function getDimensionScoresFromVector(
  result: PersonalityEvaluation,
  vector: OceanVectorWithMeta,
): DimensionScore[] {
  return [
    {
      dimension: "EI",
      score: Math.round(((1 - vector.E) / 2) * 100),
      letter: result.type[0],
      isBorderline: Math.abs(vector.E) < SOFT_BOUNDARY_THRESHOLD,
    },
    {
      dimension: "SN",
      score: Math.round(((vector.O + 1) / 2) * 100),
      letter: result.type[1],
      isBorderline: Math.abs(vector.O) < SOFT_BOUNDARY_THRESHOLD,
    },
    {
      dimension: "TF",
      score: Math.round(((vector.A + 1) / 2) * 100),
      letter: result.type[2],
      isBorderline: Math.abs(vector.A) < SOFT_BOUNDARY_THRESHOLD,
    },
    {
      dimension: "JP",
      score: Math.round(((1 - vector.C) / 2) * 100),
      letter: result.type[3],
      isBorderline: Math.abs(vector.C) < SOFT_BOUNDARY_THRESHOLD,
    },
  ];
}

export function getOceanScoresFromVector(
  vector: OceanVectorWithMeta,
): OceanScores {
  return {
    openness: Math.round(((vector.O + 1) / 2) * 100),
    conscientiousness: Math.round(((vector.C + 1) / 2) * 100),
    extraversion: Math.round(((vector.E + 1) / 2) * 100),
    agreeableness: Math.round(((vector.A + 1) / 2) * 100),
    neuroticism: Math.round(((vector.N + 1) / 2) * 100),
  };
}
