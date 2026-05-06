import type {
  ActivityIdeaCandidate,
  ActivityIdeaContext,
  ActivityLaneConfidence,
} from "../types";

interface CreateActivityIdeaOptions {
  detail: string;
  scoreBonus: number;
  title: string;
}

export function createActivityIdea(
  context: ActivityIdeaContext,
  options: CreateActivityIdeaOptions,
): ActivityIdeaCandidate {
  const { primaryLane, secondaryLane } = context;

  return {
    confidence: getActivityIdeaConfidence(context),
    detail: options.detail,
    laneKey: primaryLane.key,
    score:
      primaryLane.score +
      (secondaryLane?.score ?? 0) * 0.38 +
      getActivityIdeaPersonalityBonus(context) +
      options.scoreBonus,
    secondaryLaneKey: secondaryLane?.key ?? null,
    title: options.title,
  };
}

function getActivityIdeaConfidence(
  context: ActivityIdeaContext,
): ActivityLaneConfidence {
  const { primaryLane, secondaryLane } = context;

  if (
    primaryLane.confidence === "strong" &&
    (!secondaryLane || secondaryLane.confidence !== "soft")
  ) {
    return "strong";
  }

  if (primaryLane.confidence !== "soft") {
    return "clear";
  }

  return "soft";
}

function getActivityIdeaPersonalityBonus(context: ActivityIdeaContext) {
  let bonus = 0;

  if (context.socialPressure === "easy" && context.primaryLane.key === "play") {
    bonus += 1.5;
  }

  if (
    context.structure === "framed" &&
    ["builder", "learning", "wellness"].includes(context.primaryLane.key)
  ) {
    bonus += 1.25;
  }

  if (
    context.structure === "flexible" &&
    ["creative", "outdoors", "social"].includes(context.primaryLane.key)
  ) {
    bonus += 1.25;
  }

  return bonus;
}
