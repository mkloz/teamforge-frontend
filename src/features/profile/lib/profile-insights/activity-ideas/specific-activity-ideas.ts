import type { ActivityIdeaCandidate, ActivityIdeaContext } from "../types";
import { getActivityIdeaAnchorPool } from "./activity-idea-context";
import { createActivityIdea } from "./activity-idea-factory";

export function buildSpecificActivityIdeas(
  context: ActivityIdeaContext,
): ActivityIdeaCandidate[] {
  const candidates: ActivityIdeaCandidate[] = [];
  const hasAnchor = (pattern: RegExp) =>
    getActivityIdeaAnchorPool(context).some((interest) =>
      pattern.test(interest.name.toLowerCase()),
    );

  if (
    context.primaryLane.confidence !== "soft" &&
    hasAnchor(/\bphoto|photograph/) &&
    hasAnchor(/\bcoffee|cafe/)
  ) {
    candidates.push(
      createActivityIdea(context, {
        detail:
          "It gives the group something to notice first, then a simple place to land.",
        scoreBonus: 7,
        title: "Photo walk with a coffee stop",
      }),
    );
  }

  if (
    hasAnchor(/\bboard games?\b|\bchess\b|\bvideo games?\b/) &&
    context.primaryLane.key === "play"
  ) {
    candidates.push(
      createActivityIdea(context, {
        detail:
          "The activity does the first-minute work, which keeps the social pressure low.",
        scoreBonus: 5,
        title: "Low-pressure games table for 4-6 people",
      }),
    );
  }

  if (
    hasAnchor(/\bstartup|product|founder|entrepreneur|prototype/) &&
    context.primaryLane.key === "builder"
  ) {
    candidates.push(
      createActivityIdea(context, {
        detail:
          "A single prompt keeps the conversation concrete without turning it into networking.",
        scoreBonus: 5,
        title: "One-prompt builder circle",
      }),
    );
  }

  return candidates;
}
