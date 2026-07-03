import { PAIR_DYNAMICS } from "@/shared/lib/personality-profile/pair-dynamics";
import { TRAIT_COPY } from "@/shared/lib/personality-profile/trait-copy";
import type {
  SignalPair,
  TraitSignal,
} from "@/shared/lib/personality-profile/types";

export function buildSocialRead(
  primary: TraitSignal,
  secondary?: TraitSignal,
  selectedPair?: SignalPair | null,
) {
  const primaryRead = TRAIT_COPY[primary.trait][primary.direction].socialRead;

  if (!secondary) {
    return `Around other people, ${primaryRead}. You tend to feel most natural when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}.`;
  }

  const pairDynamic = selectedPair ? PAIR_DYNAMICS[selectedPair.key] : null;

  if (pairDynamic) {
    return `Around other people, ${primaryRead}. ${pairDynamic}`;
  }

  return `Around other people, ${primaryRead}. At the same time, ${TRAIT_COPY[secondary.trait][secondary.direction].socialRead}.`;
}
