import type { OceanScores } from "@/features/profile/lib/profile-contract";
import type {
  ActivityLane,
  ActivityLaneConfidence,
  LaneKey,
  PersonalityProfile,
  PortraitKey,
  SocialProfileModel,
  TraitProfile,
} from "@/features/profile/lib/profile-insights/types";
import type { Interest } from "@/shared/schemas";
import { createInterest, createUser } from "./user";

const DEFAULT_PORTRAIT_KEY: PortraitKey = "focusedBuilder";

export function createProfileInterest(
  id: string,
  name: string,
  overrides: Partial<Interest> = {},
): Interest {
  return createInterest(name, [], {
    id,
    slug: id,
    ...overrides,
  });
}

export function createActivityLane(
  overrides: Partial<ActivityLane> = {},
): ActivityLane {
  const interest =
    overrides.interests?.[0] ??
    createProfileInterest("coding", "Coding", {
      aliases: ["software"],
    });
  const key = overrides.key ?? "builder";
  const evidence = overrides.evidence ?? [
    {
      interest,
      reason: "direct",
      role: "primary",
      score: 8,
    },
  ];

  return {
    confidence: overrides.confidence ?? "clear",
    description: "A lane for testing.",
    evidence,
    interests: overrides.interests ?? evidence.map((item) => item.interest),
    key,
    label: overrides.label ?? "Builder energy",
    primaryEvidenceCount:
      overrides.primaryEvidenceCount ??
      evidence.filter((item) => item.role === "primary").length,
    score:
      overrides.score ??
      evidence.reduce((total, item) => total + item.score, 0),
    supportingEvidenceCount:
      overrides.supportingEvidenceCount ??
      evidence.filter((item) => item.role === "supporting").length,
    ...overrides,
  };
}

export function createTraitProfile(
  scores: OceanScores = {
    agreeableness: 70,
    conscientiousness: 72,
    extraversion: 55,
    neuroticism: 35,
    openness: 82,
  },
): TraitProfile {
  return {
    dominant: {
      key: "openness",
      label: "Openness",
      value: scores.openness,
    },
    high: new Set(["openness"]),
    low: new Set(["neuroticism"]),
    moderateHigh: new Set(["conscientiousness", "agreeableness"]),
    moderateLow: new Set(),
    scores,
  };
}

export function createPersonalityProfile(
  overrides: Partial<PersonalityProfile> = {},
): PersonalityProfile {
  return {
    attention: "possibility",
    decision: "logic",
    energy: "inward",
    structure: "planned",
    type: "INTJ",
    ...overrides,
  };
}

export function createSocialProfileModel(
  overrides: Partial<SocialProfileModel> = {},
  contextOverrides: Partial<SocialProfileModel["context"]> = {},
): SocialProfileModel {
  const lanes = contextOverrides.lanes ?? [
    createActivityLane({
      confidence: "strong",
      primaryEvidenceCount: 3,
      score: 24,
    }),
    createActivityLane({
      confidence: "clear",
      key: "learning",
      label: "Curious thread",
    }),
  ];
  const context = {
    firstName: "Test",
    lanes,
    personality: createPersonalityProfile(),
    tensions: [],
    traits: createTraitProfile(),
    user: createUser({ age: 24 }),
    ...contextOverrides,
  };
  const candidates = overrides.candidates ?? [
    {
      key: DEFAULT_PORTRAIT_KEY,
      score: 18,
      share: 0.72,
      title: "Focused Builder",
    },
  ];

  return {
    candidates,
    confidence: "high",
    context,
    primaryKey: candidates[0]?.key ?? DEFAULT_PORTRAIT_KEY,
    secondaryCandidate: null,
    ...overrides,
  };
}

export function createLaneForSignal(
  key: LaneKey,
  confidence: ActivityLaneConfidence,
  interests: Interest[],
): ActivityLane {
  return createActivityLane({
    confidence,
    evidence: interests.map((interest, index) => ({
      interest,
      reason: "direct",
      role: "primary",
      score: 8 - index,
    })),
    interests,
    key,
    label: key,
    primaryEvidenceCount: interests.length,
    score: interests.length * 8,
    supportingEvidenceCount: 0,
  });
}
