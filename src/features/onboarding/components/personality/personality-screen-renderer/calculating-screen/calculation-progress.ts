import { OCEAN_DIMENSION_LABELS } from "@/features/onboarding/data/personality-metadata";
import {
  type OceanVectorWithMeta,
  toDisplayPercent,
} from "@/features/onboarding/utils/score-calculator";

const CALCULATION_DIMENSIONS = ["O", "C", "E", "A", "N"] as const;

export const CALCULATION_MESSAGES = [
  "Scoring your responses...",
  "Comparing answers across five traits...",
  "Checking where your scores sit...",
  "Preparing your results...",
] as const;

export function getCalculationProgressRows(vector: OceanVectorWithMeta) {
  return CALCULATION_DIMENSIONS.map((dimension) => ({
    dimension,
    label: OCEAN_DIMENSION_LABELS[dimension].label,
    value: toDisplayPercent(vector, dimension),
  }));
}
