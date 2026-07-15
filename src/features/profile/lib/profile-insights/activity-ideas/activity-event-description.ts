import type { ActivityIdeaContext, LaneKey } from "../types";
import { formatActivityIdeaList } from "./activity-idea-formatters";

export function buildActivityEventDescription(
  context: ActivityIdeaContext,
  title: string,
) {
  return compactSentences([
    getPrimaryEventSentence(context.primaryLane.key),
    getSecondaryEventSentence(context.secondaryLane?.key ?? null, title),
    `Keep it to ${getGroupSizePhrase(context)} so everyone has room to take part.`,
    getAnchorSentence(context.anchors),
    getStructureSentence(context),
  ]);
}

function getPrimaryEventSentence(key: LaneKey) {
  const sentences: Record<LaneKey, string> = {
    builder:
      "Bring one rough prompt or practical question and use it to turn the first conversation into something concrete.",
    creative:
      "Meet around one small creative prompt that gives people something to notice, make, compare, or choose.",
    food: "Meet at a simple public table where the place makes arriving easy and the plan can stay low-pressure.",
    general:
      "Start with one shared interest prompt and keep the first version simple enough to arrange quickly.",
    learning:
      "Pick one topic, object, article, or question for the group to explore together without turning it into a class.",
    outdoors:
      "Meet for a short, walkable route with a clear start point and a nearby public stop as the fallback.",
    play: "Choose one easy first round so people can warm up through the activity before conversation has to carry everything.",
    social:
      "Give the meetup one shared hook so the people are still the point, but nobody has to arrive with instant small talk.",
    wellness:
      "Use a steady, repeatable pace where the group can show up without needing a big performance moment.",
  };

  return sentences[key];
}

function getSecondaryEventSentence(key: LaneKey | null, title: string) {
  if (title.toLowerCase().includes("photo")) {
    return "Use one photo prompt, such as a color, texture, or small detail, so the route has a clear first task.";
  }

  if (!key) {
    return null;
  }

  const sentences: Partial<Record<LaneKey, string>> = {
    builder:
      "Add one practical output at the end: a shortlist, sketch, decision, or next small experiment.",
    creative:
      "Add one light creative constraint so the meetup has a point of view without becoming a workshop.",
    food: "End with an optional cafe or snack stop so the group has a softer second move.",
    learning:
      "Bring one question to compare notes on, then let the group decide which tangent is worth following.",
    outdoors:
      "Keep the movement gentle and local, with an easy exit if the group wants to wrap early.",
    play: "Use low stakes and rotating turns so beginners can take part.",
    social:
      "Add one shared choice, such as everyone picking the next stop or offering a recommendation.",
    wellness:
      "Keep the pace calm and predictable so the plan feels easy to repeat if the group clicks.",
  };

  return sentences[key] ?? null;
}

function getGroupSizePhrase(context: ActivityIdeaContext) {
  if (context.socialPressure === "easy") {
    return "3-5 people";
  }

  if (context.socialPressure === "lively") {
    return "4-6 people";
  }

  return "3-6 people";
}

function getAnchorSentence(anchors: string[]) {
  if (anchors.length === 0) {
    return null;
  }

  return `Use ${formatActivityIdeaList(anchors)} as inspiration, but keep the plan welcoming for people who only share the broader vibe.`;
}

function getStructureSentence(context: ActivityIdeaContext) {
  if (context.structure === "framed") {
    return "Set one clear start time, one expected duration, and one fallback option so the plan does not drift.";
  }

  if (context.structure === "flexible") {
    return "Leave the second half open so the group can choose whether to continue, switch setting, or wrap naturally.";
  }

  return "Keep the setup concrete, but avoid over-planning the first meetup before the group has a feel for each other.";
}

function compactSentences(sentences: Array<string | null>) {
  return sentences.filter(Boolean).join(" ").replace(/\s+/g, " ").trim();
}
