import type { DimensionScore, OceanScores } from "@/shared/types/psychometrics";
import { generateDetailedDescription } from "@/shared/lib/personality-profile";
import type { PersonalityEvaluation } from "./personality-evaluation";
import type { OceanVectorWithMeta } from "../utils/score-calculator";

const SOFT_BOUNDARY_THRESHOLD = 0.167;
const GROUP_READ_SENTENCE_COUNT = 2;

const SIXTEEN_PERSONALITIES_SLUGS: Record<
  PersonalityEvaluation["type"],
  string
> = {
  ENFJ: "protagonist",
  ENFP: "campaigner",
  ENTJ: "commander",
  ENTP: "debater",
  ESFJ: "consul",
  ESFP: "entertainer",
  ESTJ: "executive",
  ESTP: "entrepreneur",
  INFJ: "advocate",
  INFP: "mediator",
  INTJ: "architect",
  INTP: "logician",
  ISFJ: "defender",
  ISFP: "adventurer",
  ISTJ: "logistician",
  ISTP: "virtuoso",
};

export function getPersonalityResultViewModel(
  result: PersonalityEvaluation,
  vector: OceanVectorWithMeta,
) {
  const dimensionScores = getDimensionScoresFromVector(result, vector);
  const oceanScores = getOceanScoresFromVector(vector);
  const profile = generateDetailedDescription(oceanScores);

  return {
    dimensionScores,
    externalProfileUrl: getSixteenPersonalitiesUrl(result.type),
    groupRead: getCompactText(result.info.inGroups, GROUP_READ_SENTENCE_COUNT),
    oceanScores,
    profile,
    typeLabel: `${result.type}-${result.variant}`,
  };
}

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

export function getCompactText(value: string, maxSentences: number) {
  const sentences = value.match(/[^.!?]+[.!?]+/g) ?? [value];

  return sentences.slice(0, maxSentences).join(" ").trim();
}

export function getSixteenPersonalitiesUrl(
  type: PersonalityEvaluation["type"],
) {
  return `https://www.16personalities.com/${SIXTEEN_PERSONALITIES_SLUGS[type]}-personality`;
}
