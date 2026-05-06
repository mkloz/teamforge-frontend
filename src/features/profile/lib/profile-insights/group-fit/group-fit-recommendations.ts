import {
  getActivitySocialPressure,
  getActivityStructure,
} from "../activity-ideas";
import type {
  ActivityIdea,
  ActivityLane,
  PortraitKey,
  SocialProfileModel,
} from "../types";
import { getGroupFitStyle } from "./group-fit-style";

export function buildGroupFitBestWith(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
  openingIdea: ActivityIdea | null,
) {
  const style = getGroupFitStyle(key);
  const pressure = getActivitySocialPressure(socialProfile);
  const structure = getActivityStructure(socialProfile);
  const planPhrase = buildOpeningIdeaSentence(openingIdea);

  if (style.posture === "starter") {
    return `People who will say yes to a first move before the plan is over-polished.${planPhrase}`;
  }

  if (style.posture === "connector" || style.posture === "host") {
    return `Warm, activity-led groups where nobody has to perform socially right away.${planPhrase}`;
  }

  if (style.posture === "coordinator") {
    return `People who appreciate a plan that has shape: time, place, fallback, and one simple next step.${planPhrase}`;
  }

  if (style.posture === "specialist" || style.posture === "builder") {
    return `Smaller groups built around a real topic, object, route, or shared problem.${planPhrase}`;
  }

  if (style.posture === "curator") {
    return `People who care about the feel of the plan: place, route, taste, and small details.${planPhrase}`;
  }

  if (pressure === "easy") {
    return `Low-pressure groups where the activity creates the first conversation.${planPhrase}`;
  }

  if (structure === "framed") {
    return `A clear plan that still leaves enough room for the group to feel natural.${planPhrase}`;
  }

  return `A group where the first activity is concrete enough to make joining easy.${planPhrase}`;
}

export function buildGroupFitAvoid(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
) {
  const style = getGroupFitStyle(key);

  if (socialProfile.context.tensions.length > 0) {
    return "Reading the headline type too literally; the first plan should stay simple enough to let the mixed cue resolve naturally.";
  }

  if (socialProfile.secondaryCandidate) {
    return "A group that only fits one side of the profile; the first plan should leave a little room for the secondary side.";
  }

  if (style.posture === "starter") {
    return "Plans that stay abstract or require a long pre-meet discussion.";
  }

  if (style.posture === "connector" || style.posture === "host") {
    return "Formats that depend on instant chemistry or heavy introductions.";
  }

  if (style.posture === "coordinator") {
    return "Vague open-ended plans where nobody knows what happens first.";
  }

  if (style.posture === "specialist" || style.posture === "builder") {
    return "Broad social mixers; the group needs a concrete topic or task.";
  }

  if (style.posture === "curator") {
    return "Generic venues or plans that could belong to anyone.";
  }

  return "A first group that is too broad; the activity should still do real matching work.";
}

export function buildGroupFitOpeningMove(
  openingIdea: ActivityIdea | null,
  topLane: ActivityLane | null,
) {
  if (openingIdea) {
    return `${openingIdea.title}. ${openingIdea.detail}`;
  }

  if (topLane) {
    return `Start with a ${topLane.label.toLowerCase()} plan that is small enough to join without overthinking.`;
  }

  return "Start with a simple interest-led group while more profile detail builds.";
}

export function buildPortraitChemistry(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
) {
  const [tension] = socialProfile.context.tensions;

  if (tension) {
    return `${tension.value} Chemistry will be easier to read once the first activity gives people something real to do.`;
  }

  const notes: Record<PortraitKey, string> = {
    activeCatalyst:
      "Chemistry is strongest with people who are willing to start doing before every detail is settled.",
    cafeConnector:
      "Chemistry is strongest with people who appreciate simple plans that still feel considered.",
    calmAnchor:
      "Chemistry works when the group does not rush it and can let the activity set the pace.",
    creativeInstigator:
      "Chemistry is strongest with people who enjoy a plan having taste, angle, or a small surprise.",
    curiousSpecialist:
      "Chemistry works with people who like following an interesting thread rather than filling silence.",
    focusedBuilder:
      "Chemistry is strongest with people who bring rough ideas and enjoy making them more concrete.",
    flexibleParticipant:
      "Chemistry works when the group has a clear starting point and enough room for different people to contribute.",
    ideaFirstExplorer:
      "Chemistry is strongest with people who like options, but can still choose one and start.",
    playfulScout:
      "Chemistry works with people who warm up through the activity instead of heavy introductions.",
    practicalOrganizer:
      "Chemistry is strongest with people who appreciate clear plans but do not make them stiff.",
    quietSpecialist:
      "Best in smaller groups where the activity gives people something real to talk about.",
    restlessInstigator:
      "Chemistry is strongest with one or two steady people nearby so the energy turns into an actual plan.",
    socialGameHost:
      "Chemistry works with people who are happier doing something together than trying to impress each other.",
    steadyHost:
      "Chemistry is strongest in groups that need warmth at the start and enough structure to avoid awkward drift.",
    tasteMaker:
      "Chemistry works with people who care about the feel of the plan beyond the category name.",
    warmConnector:
      "Chemistry is strongest in groups that need warmth without making one person carry the whole mood.",
  };

  return notes[key];
}

function buildOpeningIdeaSentence(openingIdea: ActivityIdea | null) {
  return openingIdea ? ` Start with ${openingIdea.title.toLowerCase()}.` : "";
}
