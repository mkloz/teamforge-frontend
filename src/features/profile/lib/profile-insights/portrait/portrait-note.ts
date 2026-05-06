import {
  PORTRAIT_HYBRID_MARGIN,
  PORTRAIT_STRONG_MARGIN,
} from "../portrait-thresholds";
import type {
  PortraitContext,
  ProfilePortraitCandidate,
  SocialProfileModel,
} from "../types";

export function buildPortraitNote(
  context: PortraitContext,
  candidates: ProfilePortraitCandidate[],
): string {
  const pieces: string[] = [];
  const leader = candidates[0];
  const runnerUp = candidates[1];
  const isCloseRead =
    leader && runnerUp
      ? (leader.score - runnerUp.score) / leader.score < PORTRAIT_HYBRID_MARGIN
      : false;

  if (context.personality.type) {
    pieces.push(context.personality.type);
  }

  if (context.traits) {
    pieces.push(`${context.traits.dominant.label}-led personality scores`);
  }

  if (context.lanes.length > 0) {
    pieces.push(
      `${context.lanes.length} interest lane${context.lanes.length === 1 ? "" : "s"}`,
    );
  }

  if (typeof context.user.age === "number") {
    pieces.push(`${context.user.age} yrs`);
  }

  const basis =
    pieces.length > 0
      ? `Based on ${pieces.join(", ")}.`
      : "Add personality results and a few interests to make this portrait sharper.";

  if (isCloseRead && runnerUp) {
    return `${basis} The top cues are close, so this should read as a blend rather than a hard label.`;
  }

  return basis;
}

export function buildPortraitConfidenceNote(socialProfile: SocialProfileModel) {
  const { candidates, confidence, context, secondaryCandidate } = socialProfile;
  const leader = candidates[0];
  const runnerUp = candidates[1];
  const margin =
    leader && runnerUp && leader.score > 0
      ? (leader.score - runnerUp.score) / leader.score
      : 1;

  if (secondaryCandidate) {
    return "Two patterns are close. Treat this as a blended read, not a hard type.";
  }

  if (confidence === "early") {
    return "Useful, but still light. More interests or personality data would sharpen it.";
  }

  if (context.tensions.length > 0) {
    return "Good profile depth, with one mixed personality cue.";
  }

  if (confidence === "high" && margin >= PORTRAIT_STRONG_MARGIN) {
    return "The strongest cues point in the same direction.";
  }

  return "Good profile depth, but not enough separation for a hard label.";
}
