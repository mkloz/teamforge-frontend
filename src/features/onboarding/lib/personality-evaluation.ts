import type { PersonalityType } from "@/shared/schemas/enums";
import {
  PERSONALITY_INFO_BY_TYPE,
  type PersonalityInfo,
} from "../data/personality-metadata";
import type { OceanVector } from "../utils/score-calculator";

export interface PersonalityEvaluation {
  type: PersonalityType;
  variant: "A" | "T";
  info: PersonalityInfo;
}

const PERSONALITY_LETTER_RULES = [
  {
    positiveLetter: "E",
    negativeLetter: "I",
    getScore: (vector: OceanVector) => vector.E,
  },
  {
    positiveLetter: "N",
    negativeLetter: "S",
    getScore: (vector: OceanVector) => vector.O,
  },
  {
    positiveLetter: "F",
    negativeLetter: "T",
    getScore: (vector: OceanVector) => vector.A,
  },
  {
    positiveLetter: "J",
    negativeLetter: "P",
    getScore: (vector: OceanVector) => vector.C,
  },
] as const;

const PERSONALITY_TYPES = new Set<string>([
  "ENFJ",
  "ENFP",
  "ENTJ",
  "ENTP",
  "ESFJ",
  "ESFP",
  "ESTJ",
  "ESTP",
  "INFJ",
  "INFP",
  "INTJ",
  "INTP",
  "ISFJ",
  "ISFP",
  "ISTJ",
  "ISTP",
]);

export function evaluatePersonalityVector(
  vector: OceanVector,
): PersonalityEvaluation {
  const type = getPersonalityType(vector);
  const variant = getPersonalityVariant(vector);
  const info = PERSONALITY_INFO_BY_TYPE[type] ?? PERSONALITY_INFO_BY_TYPE.INFP;

  return { type, variant, info };
}

function getPersonalityType(vector: OceanVector): PersonalityType {
  const type = PERSONALITY_LETTER_RULES.map((rule) =>
    getPersonalityLetter(rule, vector),
  ).join("");

  return isPersonalityType(type) ? type : "INFP";
}

function getPersonalityLetter(
  rule: (typeof PERSONALITY_LETTER_RULES)[number],
  vector: OceanVector,
) {
  return rule.getScore(vector) > 0 ? rule.positiveLetter : rule.negativeLetter;
}

function getPersonalityVariant(
  vector: OceanVector,
): PersonalityEvaluation["variant"] {
  return vector.N <= 0 ? "A" : "T";
}

function isPersonalityType(value: string): value is PersonalityType {
  return PERSONALITY_TYPES.has(value);
}
