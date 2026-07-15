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
    return `People who say yes before every detail is fixed.${planPhrase}`;
  }

  if (style.posture === "connector" || style.posture === "host") {
    return `Warm groups where the activity eases people in.${planPhrase}`;
  }

  if (style.posture === "coordinator") {
    return `People who prefer a clear plan and next step.${planPhrase}`;
  }

  if (style.posture === "specialist" || style.posture === "builder") {
    return `Smaller groups built around a real shared focus.${planPhrase}`;
  }

  if (style.posture === "curator") {
    return `People who care about the setting as well as the activity.${planPhrase}`;
  }

  if (pressure === "easy") {
    return `Low-pressure groups where the activity starts the talk.${planPhrase}`;
  }

  if (structure === "framed") {
    return `A clear plan with room for the group to feel natural.${planPhrase}`;
  }

  return `A concrete first activity that makes joining easy.${planPhrase}`;
}

export function buildGroupFitAvoid(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
) {
  const style = getGroupFitStyle(key);

  if (socialProfile.context.tensions.length > 0) {
    return "Reading one cue too literally; keep the first plan simple.";
  }

  if (socialProfile.secondaryCandidate) {
    return "Groups that only fit one side of the profile.";
  }

  if (style.posture === "starter") {
    return "Plans that stay abstract before anyone meets.";
  }

  if (style.posture === "connector" || style.posture === "host") {
    return "Formats that expect people to connect immediately.";
  }

  if (style.posture === "coordinator") {
    return "Vague plans where nobody knows what starts first.";
  }

  if (style.posture === "specialist" || style.posture === "builder") {
    return "Broad mixers without a concrete topic or task.";
  }

  if (style.posture === "curator") {
    return "Generic plans that could belong to anyone.";
  }

  return "First groups that feel too broad to join easily.";
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

export function buildPortraitGroupDynamics(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
) {
  const [tension] = socialProfile.context.tensions;

  if (tension) {
    return `${tension.value} Group dynamics will be easier to assess after a shared activity.`;
  }

  const notes: Record<PortraitKey, string> = {
    activeCatalyst:
      "Works best with people who are willing to start before every detail is settled.",
    cafeConnector:
      "Works best with people who appreciate simple, considered plans.",
    calmAnchor: "Works best when the group lets the activity set the pace.",
    creativeInstigator:
      "Works best with people who enjoy plans with a point of view or a small surprise.",
    curiousSpecialist:
      "Works best with people who enjoy following an interesting thread rather than filling silence.",
    focusedBuilder:
      "Works best with people who bring rough ideas and enjoy making them concrete.",
    flexibleParticipant:
      "Works best when the group has a clear starting point and room for different contributions.",
    ideaFirstExplorer:
      "Works best with people who enjoy options but can still choose one and start.",
    playfulScout:
      "Works best with people who warm up through the activity instead of long introductions.",
    practicalOrganizer:
      "Works best with people who appreciate clear plans without making them rigid.",
    quietSpecialist:
      "Best in smaller groups where the activity gives people something real to talk about.",
    restlessInstigator:
      "Works best with one or two steady people who can turn energy into a plan.",
    socialGameHost:
      "Works best with people who prefer doing something together over trying to impress each other.",
    steadyHost:
      "Works best in groups that need a warm start and enough structure to keep moving.",
    tasteMaker:
      "Works best with people who care about the setting and details of a plan.",
    warmConnector:
      "Works best in groups that value a warm start without relying on one person to lead it.",
  };

  return notes[key];
}

function buildOpeningIdeaSentence(openingIdea: ActivityIdea | null) {
  return openingIdea ? ` Start with ${openingIdea.title.toLowerCase()}.` : "";
}
