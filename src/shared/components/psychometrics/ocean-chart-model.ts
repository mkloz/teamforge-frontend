import { getExtendedTraitInfo, OCEAN_TRAITS } from "@/shared/lib/ocean-traits";
import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

interface TickPositionInput {
  x: number | string;
  y: number | string;
  cx: number | string;
  cy: number | string;
}

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

export function getPushedOutTickPosition({ x, y, cx, cy }: TickPositionInput) {
  const numX = Number(x);
  const numY = Number(y);
  const numCx = Number(cx);
  const numCy = Number(cy);

  const dx = numX - numCx;
  const dy = numY - numCy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const pushOutOffset = 18;

  if (distance <= 0) {
    return { x: numX, y: numY };
  }

  return {
    x: numCx + (dx / distance) * (distance + pushOutOffset),
    y: numCy + (dy / distance) * (distance + pushOutOffset),
  };
}
