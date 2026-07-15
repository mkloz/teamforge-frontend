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
    return `Choose ${MIN_INTERESTS - selectedCount} more to continue`;
  }

  if (isAtMax) {
    return "Interest limit reached. Remove one to add another.";
  }

  const ratio = selectedCount / MAX_INTERESTS;

  if (ratio >= 0.8) {
    return `${selectedCount} interests selected`;
  }

  if (ratio >= 0.5) {
    return `${selectedCount} interests selected. You can continue.`;
  }

  return "Choose activities and topics you would make time for.";
}
