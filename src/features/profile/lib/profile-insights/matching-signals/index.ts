import type { MatchingSignal, SocialProfileModel } from "../types";
import { buildActivitySignal } from "./activity-signal";
import { getMatchingReadiness } from "./matching-readiness";
import { buildPersonalitySignal } from "./personality-signal";
import { buildStageSignal } from "./stage-signal";

export function buildMatchingSignals(
  socialProfile: SocialProfileModel,
): MatchingSignal[] {
  const { context } = socialProfile;
  const { lanes, personality, traits, user } = context;
  const topLane = lanes[0] ?? null;
  const readiness = getMatchingReadiness(socialProfile);

  return [
    buildActivitySignal(lanes, topLane),
    buildPersonalitySignal(personality, traits, context.tensions),
    buildStageSignal(user),
    {
      detail: readiness.detail,
      label: "Profile detail",
      strength: readiness.strength,
      value: readiness.label,
    },
  ];
}
