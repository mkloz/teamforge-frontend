import { FALLBACK_STRENGTHS } from "@/shared/lib/personality-profile/balanced-profile";
import { MAX_PROFILE_STRENGTHS } from "@/shared/lib/personality-profile/constants";
import { TRAIT_COPY } from "@/shared/lib/personality-profile/trait-copy";
import type { TraitSignal } from "@/shared/lib/personality-profile/types";

export function buildStrengths(signals: TraitSignal[]) {
  const strengths: string[] = [];

  addOneStrengthPerSignal(signals, strengths);
  fillRemainingStrengths(signals, strengths);
  fillFallbackStrengths(strengths);

  return strengths.slice(0, MAX_PROFILE_STRENGTHS);
}

function addOneStrengthPerSignal(signals: TraitSignal[], strengths: string[]) {
  for (const signal of signals.slice(0, MAX_PROFILE_STRENGTHS)) {
    const candidates = TRAIT_COPY[signal.trait][signal.direction].strengths;
    const firstUnused = candidates.find(
      (strength) => !strengths.includes(strength),
    );

    if (firstUnused) {
      strengths.push(firstUnused);
    }
  }
}

function fillRemainingStrengths(signals: TraitSignal[], strengths: string[]) {
  for (const signal of signals) {
    addUnusedStrengths(
      TRAIT_COPY[signal.trait][signal.direction].strengths,
      strengths,
    );

    if (hasEnoughProfileStrengths(strengths)) {
      return;
    }
  }
}

function addUnusedStrengths(candidates: string[], strengths: string[]) {
  for (const strength of candidates) {
    if (!strengths.includes(strength)) {
      strengths.push(strength);
    }
  }
}

function fillFallbackStrengths(strengths: string[]) {
  for (const strength of FALLBACK_STRENGTHS) {
    if (!strengths.includes(strength)) {
      strengths.push(strength);
    }

    if (hasEnoughProfileStrengths(strengths)) {
      return;
    }
  }
}

function hasEnoughProfileStrengths(strengths: string[]) {
  return strengths.length === MAX_PROFILE_STRENGTHS;
}
