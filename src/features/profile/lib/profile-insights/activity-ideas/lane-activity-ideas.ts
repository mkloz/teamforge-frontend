import type {
  ActivityIdeaCandidate,
  ActivityIdeaContext,
  LaneKey,
} from "../types";
import { createActivityIdea } from "./activity-idea-factory";
import { formatActivityIdeaList } from "./activity-idea-formatters";

export function buildPrimaryLaneActivityIdea(
  context: ActivityIdeaContext,
): ActivityIdeaCandidate {
  const titles: Record<LaneKey, string> = {
    builder: "Idea session around one rough prompt",
    creative: "Small creative prompt session",
    food: "Low-key cafe table for 3-5 people",
    general: "Interest-led small group",
    learning: "Topic-first mini group",
    outdoors: "Small outdoor loop with a fallback stop",
    play: "Games table with an easy first round",
    social: "Casual group table with one shared hook",
    wellness: "Steady repeatable plan with an easy pace",
  };

  return createActivityIdea(context, {
    detail: buildPrimaryActivityDetail(context),
    scoreBonus: 3,
    title: titles[context.primaryLane.key],
  });
}

export function buildSecondaryActivityIdeas(
  context: ActivityIdeaContext,
): ActivityIdeaCandidate[] {
  const { primaryLane, secondaryLane } = context;

  if (!secondaryLane || secondaryLane.confidence === "soft") {
    return [];
  }

  const pairKey = `${primaryLane.key}:${secondaryLane.key}`;
  const pairTitles: Partial<Record<string, string>> = {
    "builder:creative": "Make-and-compare idea session",
    "builder:food": "Coffee-and-build prompt circle",
    "creative:builder": "Creative idea swap with one rough concept",
    "creative:food": "Cafe stop with a taste prompt",
    "creative:outdoors": "Photo route with one shared prompt",
    "food:creative": "Cafe table with a small taste prompt",
    "food:learning": "Cafe chat around one shared question",
    "learning:food": "Topic chat with a coffee landing",
    "learning:outdoors": "Walk-and-topic route",
    "outdoors:creative": "Route-first meetup with a photo prompt",
    "outdoors:food": "Outdoor session with a relaxed coffee finish",
    "outdoors:play": "Outdoor mini-challenge with easy stakes",
    "play:food": "Games table with a casual landing",
    "play:outdoors": "Low-stakes outdoor game",
    "social:food": "Casual table built around a simple ritual",
    "wellness:food": "Easy-paced walk with a public stop",
  };
  const title = pairTitles[pairKey];

  if (!title) {
    return [];
  }

  return [
    createActivityIdea(context, {
      detail: `This combines ${primaryLane.label.toLowerCase()} with ${secondaryLane.label.toLowerCase()}, so the group has both a reason to meet and a softer way in.`,
      scoreBonus: 4,
      title,
    }),
  ];
}

function buildPrimaryActivityDetail(context: ActivityIdeaContext) {
  const { anchors, primaryLane, secondaryLane } = context;
  const anchorPhrase =
    anchors.length > 0 ? ` anchored by ${formatActivityIdeaList(anchors)}` : "";
  const lanePhrase = secondaryLane
    ? `${primaryLane.label.toLowerCase()} with a ${secondaryLane.label.toLowerCase()} pull`
    : primaryLane.label.toLowerCase();

  if (primaryLane.confidence === "soft") {
    return `An early read from ${lanePhrase}${anchorPhrase}. Keep it simple until stronger interests confirm the direction.`;
  }

  return `Built from ${lanePhrase}${anchorPhrase}. ${getPlanPressureNote(context)}`;
}

function getPlanPressureNote(context: ActivityIdeaContext) {
  if (context.socialPressure === "easy") {
    return "Keep the first version small and activity-led.";
  }

  if (context.structure === "framed") {
    return "A clear start and fallback will help it become real.";
  }

  if (context.structure === "flexible") {
    return "Leave enough room for the group to choose the second move.";
  }

  return "Simple enough to join, concrete enough to avoid a plain meet-up.";
}
