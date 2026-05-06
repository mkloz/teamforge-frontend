import type { User } from "@/shared/schemas";
import type { OceanScores } from "../../profile-contract";
import {
  PORTRAIT_HYBRID_MARGIN,
  PORTRAIT_MEDIUM_MARGIN,
  PORTRAIT_STRONG_MARGIN,
} from "../portrait-thresholds";
import type {
  ActivityLane,
  ProfilePortraitCandidate,
  ProfilePortraitInsight,
} from "../types";

export function getCloseSecondCandidate(
  candidates: ProfilePortraitCandidate[],
) {
  const [leader, runnerUp] = candidates;

  if (!leader || !runnerUp || leader.score <= 0) {
    return null;
  }

  return (leader.score - runnerUp.score) / leader.score < PORTRAIT_HYBRID_MARGIN
    ? runnerUp
    : null;
}

export function getPortraitConfidence(
  user: User,
  oceanScores: OceanScores | null,
  lanes: ActivityLane[],
  candidates: ProfilePortraitCandidate[],
): ProfilePortraitInsight["confidence"] {
  const clearLaneCount = lanes.filter(
    (lane) => lane.confidence !== "soft",
  ).length;
  const strongLaneCount = lanes.filter(
    (lane) => lane.confidence === "strong",
  ).length;
  const signalCount = [
    Boolean(user.personalityType),
    Boolean(oceanScores),
    clearLaneCount >= 1,
    (user.interests?.length ?? 0) >= 6 && clearLaneCount >= 1,
  ].filter(Boolean).length;
  const leader = candidates[0]?.score ?? 0;
  const runnerUp = candidates[1]?.score ?? 0;
  const margin = leader > 0 ? (leader - runnerUp) / leader : 0;

  if (
    signalCount >= 3 &&
    margin >= PORTRAIT_STRONG_MARGIN &&
    (clearLaneCount >= 2 || strongLaneCount >= 1)
  ) {
    return "high";
  }

  if (
    signalCount >= 2 &&
    margin >= PORTRAIT_MEDIUM_MARGIN &&
    (clearLaneCount >= 1 || Boolean(oceanScores && user.personalityType))
  ) {
    return "medium";
  }

  return "early";
}
