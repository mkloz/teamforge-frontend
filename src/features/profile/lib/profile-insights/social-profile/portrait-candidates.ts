import type { OceanTraitKey } from "../../profile-contract";
import { buildPortraitTitle } from "../portrait";
import type {
  LaneKey,
  PortraitCandidate,
  PortraitContext,
  PortraitKey,
  ProfilePortraitCandidate,
} from "../types";
import { clamp, roundScore, scoreBool } from "../utils";

export function resolvePortraitCandidates(
  context: PortraitContext,
): ProfilePortraitCandidate[] {
  const { lanes, personality, traits } = context;
  const topLane = lanes[0]?.key ?? null;
  const hasLane = (key: LaneKey) => lanes.some((lane) => lane.key === key);
  const lanePull = (key: LaneKey, weight: number) =>
    scoreLane(context, key, weight);
  const traitHigh = (key: OceanTraitKey, weight: number) =>
    scoreTrait(context, key, "high", weight);
  const traitLow = (key: OceanTraitKey, weight: number) =>
    scoreTrait(context, key, "low", weight);
  const isOpen =
    traits?.moderateHigh.has("openness") ||
    personality.attention === "possibility";
  const isSocial =
    traits?.moderateHigh.has("extraversion") ||
    personality.energy === "outward";
  const isReserved =
    traits?.moderateLow.has("extraversion") || personality.energy === "inward";
  const isOrganized =
    traits?.moderateHigh.has("conscientiousness") ||
    personality.structure === "planned";
  const isWarm =
    traits?.moderateHigh.has("agreeableness") ||
    personality.decision === "people";
  const isOpenEnded = personality.structure === "open";

  const candidates: PortraitCandidate[] = [
    {
      key: "activeCatalyst",
      score:
        lanePull("outdoors", 4) +
        traitHigh("openness", 2) +
        traitHigh("extraversion", 1.5) +
        scoreBool(personality.structure === "open", 1.5) +
        lanePull("food", 0.75),
    },
    {
      key: "creativeInstigator",
      score:
        lanePull("creative", 4) +
        traitHigh("openness", 2.5) +
        scoreBool(personality.attention === "possibility", 1.5) +
        scoreBool(personality.structure === "open", 1) +
        lanePull("builder", 0.8),
    },
    {
      key: "tasteMaker",
      score:
        lanePull("creative", 3) +
        lanePull("food", 1.5) +
        traitHigh("openness", 1.5) +
        traitLow("extraversion", 0.75) +
        scoreBool(personality.decision === "people", 0.75),
    },
    {
      key: "socialGameHost",
      score:
        lanePull("play", 4) +
        traitHigh("extraversion", 2) +
        traitHigh("agreeableness", 1.25) +
        scoreBool(personality.energy === "outward", 1) +
        lanePull("food", 0.5),
    },
    {
      key: "cafeConnector",
      score:
        lanePull("food", 4) +
        traitHigh("agreeableness", 2) +
        traitHigh("extraversion", 1) +
        scoreBool(personality.decision === "people", 1.25) +
        lanePull("creative", 0.75),
    },
    {
      key: "curiousSpecialist",
      score:
        lanePull("learning", 4) +
        traitHigh("openness", 2) +
        traitLow("extraversion", 1.5) +
        scoreBool(personality.attention === "possibility", 1) +
        lanePull("builder", 0.75),
    },
    {
      key: "calmAnchor",
      score:
        traitHigh("agreeableness", 2.25) +
        traitLow("extraversion", 1.75) +
        traitHigh("conscientiousness", 1.25) +
        lanePull("wellness", 2) +
        scoreBool(personality.structure === "planned", 0.75),
    },
    {
      key: "restlessInstigator",
      score:
        scoreBool(isOpen, 2) +
        scoreBool(isSocial, 1.25) +
        scoreBool(isOpenEnded, 2) +
        lanePull("outdoors", 1.75) +
        lanePull("creative", 1) +
        lanePull("play", 1) -
        traitHigh("conscientiousness", 0.75),
    },
    {
      key: "ideaFirstExplorer",
      score:
        traitHigh("openness", 3) +
        scoreBool(isSocial, 1) +
        scoreBool(isOpenEnded, 1) +
        lanePull("creative", 2) +
        lanePull("learning", 1) +
        scoreBool(topLane === "outdoors", 1),
    },
    {
      key: "quietSpecialist",
      score:
        scoreBool(isReserved, 3) +
        scoreBool(isOpen, 2) +
        scoreBool(hasLane("creative"), 2) +
        scoreBool(hasLane("learning"), 2) +
        scoreBool(hasLane("builder"), 1),
    },
    {
      key: "steadyHost",
      score:
        scoreBool(isOrganized, 3) +
        scoreBool(isWarm, 2) +
        scoreBool(isSocial, 1) +
        scoreBool(hasLane("food"), 1) +
        scoreBool(hasLane("social"), 1),
    },
    {
      key: "warmConnector",
      score:
        scoreBool(isWarm, 3) +
        scoreBool(isSocial, 2) +
        scoreBool(hasLane("social"), 2) +
        scoreBool(hasLane("food"), 1) +
        scoreBool(hasLane("play"), 1),
    },
    {
      key: "focusedBuilder",
      score:
        lanePull("builder", 4) +
        scoreBool(isOrganized, 1.25) +
        scoreBool(personality.decision === "logic", 1) +
        traitHigh("openness", 1),
    },
    {
      key: "playfulScout",
      score:
        scoreBool(hasLane("play"), 3) +
        scoreBool(hasLane("outdoors"), 2) +
        scoreBool(isSocial, 2) +
        scoreBool(isOpenEnded, 1),
    },
    {
      key: "practicalOrganizer",
      score:
        traitHigh("conscientiousness", 3) +
        scoreBool(personality.attention === "practical", 2) +
        scoreBool(personality.structure === "planned", 2) +
        lanePull("wellness", 1),
    },
    {
      key: "flexibleParticipant",
      score: 1,
    },
  ];

  const rankedCandidates = candidates.sort((left, right) => {
    const scoreDelta = right.score - left.score;

    if (scoreDelta !== 0) {
      return scoreDelta;
    }

    return getPortraitPriority(left.key) - getPortraitPriority(right.key);
  });
  const totalScore = rankedCandidates.reduce(
    (total, candidate) => total + Math.max(candidate.score, 0),
    0,
  );

  return rankedCandidates.slice(0, 3).map((candidate) => ({
    key: candidate.key,
    score: roundScore(candidate.score),
    share:
      totalScore > 0
        ? roundScore(Math.max(candidate.score, 0) / totalScore)
        : 0,
    title: buildPortraitTitle(candidate.key, context),
  }));
}

function scoreTrait(
  context: PortraitContext,
  key: OceanTraitKey,
  direction: "high" | "low",
  weight: number,
) {
  if (!context.traits) {
    return 0;
  }

  const rawScore = context.traits.scores[key];
  const signedDistance = direction === "high" ? rawScore - 50 : 50 - rawScore;

  return clamp(signedDistance / 25, -0.8, 1.2) * weight;
}

function scoreLane(context: PortraitContext, key: LaneKey, weight: number) {
  const laneIndex = context.lanes.findIndex((lane) => lane.key === key);

  if (laneIndex === -1) {
    return 0;
  }

  const lane = context.lanes[laneIndex];
  const rankMultiplier = laneIndex === 0 ? 1 : laneIndex === 1 ? 0.72 : 0.5;
  const interestDepth = clamp(
    0.72 +
      lane.primaryEvidenceCount * 0.14 +
      lane.supportingEvidenceCount * 0.06,
    0.72,
    1.25,
  );
  const matchStrength = clamp(lane.score / 14, 0.65, 1.2);

  return weight * rankMultiplier * interestDepth * matchStrength;
}

function getPortraitPriority(key: PortraitKey): number {
  const priority: PortraitKey[] = [
    "activeCatalyst",
    "creativeInstigator",
    "tasteMaker",
    "socialGameHost",
    "cafeConnector",
    "curiousSpecialist",
    "restlessInstigator",
    "ideaFirstExplorer",
    "focusedBuilder",
    "quietSpecialist",
    "calmAnchor",
    "steadyHost",
    "warmConnector",
    "playfulScout",
    "practicalOrganizer",
    "flexibleParticipant",
  ];

  return priority.indexOf(key);
}
