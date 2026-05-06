import { getExtendedTraitInfo, OCEAN_TRAITS } from "@/shared/lib/ocean-traits";
import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

export function getOceanChartData(scores: OceanScores) {
  return OCEAN_TRAITS.map((trait) => ({
    trait: trait.label,
    key: trait.key,
    value: scores[trait.key],
    fullMark: 100,
  }));
}

export function getOceanTraitByLabel(label: string) {
  return OCEAN_TRAITS.find((trait) => trait.label === label) ?? null;
}

export function getOceanTraitDetails(
  selectedTrait: OceanTraitKey | null,
  scores: OceanScores,
) {
  return selectedTrait
    ? getExtendedTraitInfo(selectedTrait, scores[selectedTrait])
    : null;
}
