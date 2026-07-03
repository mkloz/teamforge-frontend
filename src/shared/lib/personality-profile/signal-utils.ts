import {
  MAX_PAIR_SIGNAL_COUNT,
  SIGNAL_THRESHOLD,
  TRAITS,
} from "@/shared/lib/personality-profile/constants";
import { PAIR_TITLES } from "@/shared/lib/personality-profile/title-data";
import type {
  SignalPair,
  TraitDirection,
  TraitSignal,
} from "@/shared/lib/personality-profile/types";
import type { OceanScores } from "@/shared/types/psychometrics";

export function getRankedSignals(scores: OceanScores): TraitSignal[] {
  return TRAITS.map((trait) => {
    const score = scores[trait];
    const strength = Math.abs(score - 50);
    const direction: TraitDirection = score >= 50 ? "high" : "low";

    return { trait, direction, score, strength };
  })
    .filter((signal) => signal.strength >= SIGNAL_THRESHOLD)
    .sort((left, right) => right.strength - left.strength);
}

export function getBestPair(
  primary: TraitSignal,
  signals: TraitSignal[],
): SignalPair | null {
  const namedPairs = buildSignalPairs(signals.slice(0, MAX_PAIR_SIGNAL_COUNT))
    .filter((pair) => PAIR_TITLES[pair.key])
    .sort((left, right) => right.strength - left.strength);
  const primaryPair = namedPairs.find((pair) => pairIncludes(pair, primary));

  return primaryPair ?? namedPairs[0] ?? null;
}

export function getOtherSignal(pair: SignalPair, signal: TraitSignal) {
  return sameSignal(pair.first, signal) ? pair.second : pair.first;
}

export function getPairKey(first: TraitSignal, second: TraitSignal) {
  return [first, second]
    .map((signal) => `${signal.trait}:${signal.direction}`)
    .sort()
    .join("|");
}

export function getTertiarySignal(
  signals: TraitSignal[],
  excludedSignals: Array<TraitSignal | undefined>,
) {
  return signals.find(
    (signal) =>
      !excludedSignals.some(
        (excluded) =>
          excluded &&
          excluded.trait === signal.trait &&
          excluded.direction === signal.direction,
      ),
  );
}

function buildSignalPairs(signals: TraitSignal[]) {
  return signals.flatMap((first, left) =>
    signals.slice(left + 1).map((second) => buildSignalPair(first, second)),
  );
}

function buildSignalPair(first: TraitSignal, second: TraitSignal): SignalPair {
  return {
    first,
    second,
    key: getPairKey(first, second),
    strength: first.strength + second.strength,
  };
}

function pairIncludes(pair: SignalPair, signal: TraitSignal) {
  return sameSignal(pair.first, signal) || sameSignal(pair.second, signal);
}

function sameSignal(left: TraitSignal, right: TraitSignal) {
  return left.trait === right.trait && left.direction === right.direction;
}
