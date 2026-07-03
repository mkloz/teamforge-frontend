import {
  STRONG_SIGNAL_THRESHOLD,
  TERTIARY_SIGNAL_THRESHOLD,
} from "@/shared/lib/personality-profile/constants";
import { PAIR_DYNAMICS } from "@/shared/lib/personality-profile/pair-dynamics";
import { getPairKey } from "@/shared/lib/personality-profile/signal-utils";
import { TRAIT_COPY } from "@/shared/lib/personality-profile/trait-copy";
import type { TraitSignal } from "@/shared/lib/personality-profile/types";

export function buildSummary(
  primary: TraitSignal,
  secondary?: TraitSignal,
  tertiary?: TraitSignal,
) {
  const sentences = [
    TRAIT_COPY[primary.trait][primary.direction].summary,
    getSecondarySummarySentence(primary, secondary),
    getSummaryClosingSentence({ primary, secondary, tertiary }),
  ].filter(isSummarySentence);

  return sentences.join(" ");
}

function getSecondarySummarySentence(
  primary: TraitSignal,
  secondary?: TraitSignal,
) {
  if (!secondary) {
    return null;
  }

  return (
    PAIR_DYNAMICS[getPairKey(primary, secondary)] ??
    TRAIT_COPY[secondary.trait][secondary.direction].summary
  );
}

function getSummaryClosingSentence({
  primary,
  secondary,
  tertiary,
}: {
  primary: TraitSignal;
  secondary?: TraitSignal;
  tertiary?: TraitSignal;
}) {
  return shouldUseTertiaryModifier(tertiary)
    ? getModifierSentence(tertiary)
    : getBalanceSentence(primary, secondary);
}

function shouldUseTertiaryModifier(
  tertiary?: TraitSignal,
): tertiary is TraitSignal {
  return Boolean(tertiary && tertiary.strength >= TERTIARY_SIGNAL_THRESHOLD);
}

function isSummarySentence(sentence: string | null): sentence is string {
  return Boolean(sentence);
}

function getModifierSentence(signal: TraitSignal) {
  const copy = TRAIT_COPY[signal.trait][signal.direction];

  return signal.strength >= STRONG_SIGNAL_THRESHOLD
    ? `Another clear part of the pattern is this: ${copy.mostYourself}.`
    : `A quieter part of the pattern is this: ${copy.mostYourself}.`;
}

function getBalanceSentence(primary: TraitSignal, secondary?: TraitSignal) {
  if (!secondary) {
    return `You tend to feel most like yourself when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}.`;
  }

  return `The mix is most visible when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}, while ${TRAIT_COPY[secondary.trait][secondary.direction].mostYourself}.`;
}
