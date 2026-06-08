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

export function evaluatePersonalityVector(
  vector: OceanVector,
): PersonalityEvaluation {
  const ei: "E" | "I" = vector.E > 0 ? "E" : "I";
  const sn: "S" | "N" = vector.O > 0 ? "N" : "S";
  const tf: "T" | "F" = vector.A > 0 ? "F" : "T";
  const jp: "J" | "P" = vector.C > 0 ? "J" : "P";
  const variant: "A" | "T" = vector.N <= 0 ? "A" : "T";

  const type: PersonalityType = `${ei}${sn}${tf}${jp}`;
  const info = PERSONALITY_INFO_BY_TYPE[type] ?? PERSONALITY_INFO_BY_TYPE.INFP;

  return { type, variant, info };
}
