import type { Interest } from "@/shared/schemas";

import type {
  ActivityIdeaContext,
  ActivityLane,
  SocialProfileModel,
} from "../types";

export function buildActivityIdeaContext(
  primaryLane: ActivityLane,
  lanes: ActivityLane[],
  socialProfile: SocialProfileModel,
): ActivityIdeaContext {
  const secondaryLane =
    lanes.find(
      (lane) =>
        lane.key !== primaryLane.key &&
        lane.key !== "general" &&
        lane.confidence !== "soft",
    ) ?? null;

  return {
    anchors: getLaneAnchorNames(primaryLane, 3),
    personality: socialProfile.context.personality,
    primaryLane,
    secondaryLane,
    socialPressure: getActivitySocialPressure(socialProfile),
    structure: getActivityStructure(socialProfile),
    traits: socialProfile.context.traits,
  };
}

export function getActivitySocialPressure(
  socialProfile: SocialProfileModel,
): ActivityIdeaContext["socialPressure"] {
  const { personality, traits } = socialProfile.context;

  if (
    personality.energy === "inward" ||
    traits?.moderateLow.has("extraversion")
  ) {
    return "easy";
  }

  if (
    personality.energy === "outward" ||
    traits?.moderateHigh.has("extraversion")
  ) {
    return "lively";
  }

  return "moderate";
}

export function getActivityStructure(
  socialProfile: SocialProfileModel,
): ActivityIdeaContext["structure"] {
  const { personality, traits } = socialProfile.context;

  if (
    personality.structure === "planned" ||
    traits?.moderateHigh.has("conscientiousness")
  ) {
    return "framed";
  }

  if (
    personality.structure === "open" ||
    traits?.moderateLow.has("conscientiousness")
  ) {
    return "flexible";
  }

  return "open";
}

export function getActivityIdeaAnchorPool(
  context: ActivityIdeaContext,
): Interest[] {
  if (context.secondaryLane?.confidence === "soft") {
    return context.primaryLane.interests;
  }

  return [
    ...context.primaryLane.interests,
    ...(context.secondaryLane?.interests ?? []),
  ];
}

function getLaneAnchorNames(lane: ActivityLane, limit: number) {
  return lane.evidence
    .filter((evidence) => evidence.role === "primary")
    .map((evidence) => evidence.interest.name.trim())
    .filter(Boolean)
    .slice(0, limit);
}
