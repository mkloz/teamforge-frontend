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
  const clearLaneCount = lanes.filter(
    (lane) => lane.confidence !== "soft",
  ).length;
  const strongLaneCount = lanes.filter(
    (lane) => lane.confidence === "strong",
  ).length;
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
        "Enough evidence points in the same direction for a confident first group.",
      label: "High",
      score,
      strength: "ready",
    };
  }

  if (score >= 10 && clearLaneCount >= 1) {
    return {
      detail: secondaryCandidate
        ? "The profile is matchable, but the read is blended. Use a plan that leaves room for both patterns."
        : "The profile is matchable. A concrete first plan will matter more than extra questions.",
      label: "Good",
      score,
      strength: "good",
    };
  }

  if (score >= 10) {
    return {
      detail:
        "There is useful profile depth, but the activity evidence is still soft. Keep the first match conservative.",
      label: "Early",
      score,
      strength: "quiet",
    };
  }

  return {
    detail:
      "Useful starting detail, but TeamForge should keep the first match conservative until the profile has more depth.",
    label: "Early",
    score,
    strength: "quiet",
  };
}

function isUsableAge(age: SocialProfileModel["context"]["user"]["age"]) {
  return typeof age === "number" && Number.isFinite(age);
}
