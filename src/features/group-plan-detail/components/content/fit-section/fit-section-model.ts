import type { GroupPlanFitSignal } from "@/features/group-plan-detail/lib/group-plan-detail-contract";

const STRENGTH_ORDER: Record<GroupPlanFitSignal["strength"], number> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
};

export function sortFitSignalsByStrength(signals: GroupPlanFitSignal[]) {
  return [...signals].sort(byStrength);
}

export function getFitVerdict(percent: number | null) {
  if (percent === null) return "Fit still settling";
  if (percent >= 75) return "Strong practical fit";
  if (percent >= 60) return "Useful overlap";
  if (percent >= 45) return "Some shared ground";
  return "Worth a closer look";
}

function byStrength(a: GroupPlanFitSignal, b: GroupPlanFitSignal) {
  return STRENGTH_ORDER[a.strength] - STRENGTH_ORDER[b.strength];
}
