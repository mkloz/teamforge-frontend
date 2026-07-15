import { getLaneConfidenceCounts } from "../lane-confidence";
import type { MatchingSignalStrength, SocialProfileModel } from "../types";
import { clamp } from "../utils";
import {
  countUniqueLaneInterests,
  getPersonalitySignalScore,
  getPortraitConfidenceScore,
} from "./signal-metrics";

export function getMatchingReadiness(socialProfile: SocialProfileModel): {
  detail: string;
  label: string;
  score: number;
  strength: MatchingSignalStrength;
} {
  const { confidence, context, secondaryCandidate } = socialProfile;
  const lanes = context.lanes;
  const { clearLaneCount, strongLaneCount } = getLaneConfidenceCounts(lanes);
  const signalCount =
    Math.min(countUniqueLaneInterests(lanes), 10) * 0.9 +
    clearLaneCount * 2 +
    strongLaneCount * 1.5 +
    getPersonalitySignalScore(context) +
    (isUsableAge(context.user.age) ? 1 : 0) +
    getPortraitConfidenceScore(confidence) -
    context.tensions.length * 0.75 -
    (secondaryCandidate ? 0.5 : 0);
  const score = Math.round(clamp(signalCount, 0, 20));

  if (score >= 15 && confidence === "high" && clearLaneCount >= 2) {
    return {
      detail:
        "The profile has several interests and personality details to guide a first group.",
      label: "High",
      score,
      strength: "ready",
    };
  }

  if (score >= 10 && clearLaneCount >= 1) {
    return {
      detail: secondaryCandidate
        ? "The profile has enough detail for a first group, but it points in more than one direction. Choose an activity that works with both."
        : "The profile has enough detail for a first group. The activity will matter more than adding more answers.",
      label: "Good",
      score,
      strength: "good",
    };
  }

  if (score >= 10) {
    return {
      detail:
        "The profile has useful detail, but its activity preferences are still broad. Start with a simple first plan.",
      label: "Early",
      score,
      strength: "quiet",
    };
  }

  return {
    detail:
      "The profile has some useful detail. Add more interests or personality answers before using it to shape a specific group.",
    label: "Early",
    score,
    strength: "quiet",
  };
}

function isUsableAge(age: SocialProfileModel["context"]["user"]["age"]) {
  return typeof age === "number" && Number.isFinite(age);
}
