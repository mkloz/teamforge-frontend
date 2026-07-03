import {
  FALLBACK_TITLES,
  PAIR_TITLES,
} from "@/shared/lib/personality-profile/title-data";
import type {
  SignalPair,
  TraitSignal,
} from "@/shared/lib/personality-profile/types";

export function getProfileTitle(
  primary: TraitSignal,
  selectedPair: SignalPair | null,
) {
  if (!selectedPair) {
    return FALLBACK_TITLES[primary.trait][primary.direction];
  }

  const pairedTitle = PAIR_TITLES[selectedPair.key];

  return pairedTitle ?? FALLBACK_TITLES[primary.trait][primary.direction];
}
