import type { OceanVector } from "./score-calculator";
import {
  TYPE_DESCRIPTIONS,
  type PersonalityTypeInfo,
} from "../data/type-descriptions";

export interface PersonalityResult {
  type: string; // e.g. "ENTJ"
  variant: "A" | "T"; // Assertive / Turbulent
  info: PersonalityTypeInfo;
}

/**
 * Maps Big Five OCEAN vector → 4-letter type + A/T variant.
 *
 * McCrae & Costa correlations used:
 *   E/I  ←  Energy (E)          > 0 → E,  ≤ 0 → I
 *   S/N  ←  Openness (O)        > 0 → N,  ≤ 0 → S
 *   T/F  ←  Warmth (A)          > 0 → F,  ≤ 0 → T
 *   J/P  ←  Organization (C)    > 0 → J,  ≤ 0 → P
 *   A/T  ←  Neuroticism (N)     ≤ 0 → A (assertive/stable), > 0 → T (turbulent)
 */
export function vectorToType(vector: OceanVector): PersonalityResult {
  const ei = vector.E > 0 ? "E" : "I";
  const sn = vector.O > 0 ? "N" : "S";
  const tf = vector.A > 0 ? "F" : "T";
  const jp = vector.C > 0 ? "J" : "P";
  const variant: "A" | "T" = vector.N <= 0 ? "A" : "T";

  const type = `${ei}${sn}${tf}${jp}`;
  const info = TYPE_DESCRIPTIONS[type] ?? TYPE_DESCRIPTIONS["INFP"];

  return { type, variant, info };
}
