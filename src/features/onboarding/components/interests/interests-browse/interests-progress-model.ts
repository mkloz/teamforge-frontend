import {
  MAX_INTERESTS,
  MIN_INTERESTS,
} from "@/features/onboarding/data/interests-data";

export function getInterestsProgressPercent(selectedCount: number) {
  return Math.min((selectedCount / MAX_INTERESTS) * 100, 100);
}

export function getInterestsProgressText({
  selectedCount,
  canContinue,
  isAtMax,
}: {
  selectedCount: number;
  canContinue: boolean;
  isAtMax: boolean;
}) {
  if (!canContinue) {
    return `Pick ${MIN_INTERESTS - selectedCount} more before review`;
  }

  if (isAtMax) {
    return "Full set - remove one to add another";
  }

  const ratio = selectedCount / MAX_INTERESTS;

  if (ratio >= 0.8) {
    return "Strong, specific profile";
  }

  if (ratio >= 0.5) {
    return "Good shape taking form";
  }

  return "Choose what feels true";
}
