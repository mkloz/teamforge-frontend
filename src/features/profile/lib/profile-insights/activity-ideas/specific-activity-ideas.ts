import type { ActivityIdeaCandidate, ActivityIdeaContext } from "../types";
import { normalizeText } from "../utils";
import { getActivityIdeaAnchorPool } from "./activity-idea-context";
import { createActivityIdea } from "./activity-idea-factory";

export function buildSpecificActivityIdeas(
  context: ActivityIdeaContext,
): ActivityIdeaCandidate[] {
  const candidates: ActivityIdeaCandidate[] = [];
  const hasAnchor = (pattern: RegExp) =>
    getActivityIdeaAnchorPool(context).some((interest) =>
      pattern.test(
        normalizeText([interest.name, interest.slug, ...interest.aliases]),
      ),
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
        eventDescription:
          "Meet for a short photo walk built around one shared prompt, then finish at a nearby cafe for anyone who wants to compare favourite shots. Keep the group to 3-5 people, choose a public route with an easy exit point, and make the prompt simple enough that phones are fine.",
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
        eventDescription:
          "Choose one table-friendly game with an easy first round, then rotate turns so everyone can join without needing to know the rules beforehand. Keep it to 4-6 people, pick a public spot with enough table space, and use the game as the first conversation anchor.",
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
        eventDescription:
          "Bring one rough idea, product prompt, or practical problem and give the group a simple structure: five minutes of context, quick reactions, then one useful next step. Keep it to 3-5 people so the conversation stays concrete rather than becoming a networking room.",
        scoreBonus: 5,
        title: "One-prompt builder circle",
      }),
    );
  }

  return candidates;
}
