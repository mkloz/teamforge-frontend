import type { PersonalityType } from "@/shared/schemas/enums";

export type MBTIType = PersonalityType;
export type {
  DimensionScore,
  OceanScores,
  OceanTraitKey,
  OceanTraitMeta,
} from "@/shared/types/psychometrics";

export type CognitiveFunctionCode =
  | "Ne"
  | "Ni"
  | "Se"
  | "Si"
  | "Te"
  | "Ti"
  | "Fe"
  | "Fi";

export interface CognitiveFunction {
  code: CognitiveFunctionCode;
  name: string;
  shortName: string;
  description: string;
  role: "dominant" | "auxiliary" | "tertiary" | "inferior";
}
