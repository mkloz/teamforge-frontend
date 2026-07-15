import type {
  ActivityLane,
  PortraitContext,
  PortraitKey,
  ProfilePortraitCandidate,
} from "../types";
import {
  describeLaneForPortrait,
  getPortraitBlendPhrase,
} from "./lane-portrait-language";

export function buildPortraitLead(
  key: PortraitKey,
  context: PortraitContext,
  secondaryCandidate: ProfilePortraitCandidate | null,
): string {
  const { firstName } = context;
  const lane = context.lanes[0];
  const secondLane = context.lanes[1];
  const lanePhrase = describePrimaryLanePull(lane);
  const secondLanePhrase = describeSecondaryLanePull(secondLane);

  let lead: string;

  switch (key) {
    case "activeCatalyst":
      lead = `${firstName} seems to prefer plans that move beyond the group chat. The ${lanePhrase}${secondLanePhrase} suggest an activity-led plan: choose a route, place, or small first task so conversation can develop while the group is doing something.`;
      break;
    case "creativeInstigator":
      lead = `${firstName} may prefer plans with a clear theme or idea. The ${lanePhrase}${secondLanePhrase} suggest choosing something specific enough to discuss while leaving room for the group to improvise.`;
      break;
    case "tasteMaker":
      lead = `${firstName} seems to notice what makes a plan feel considered. The ${lanePhrase}${secondLanePhrase} suggest attention to atmosphere, details, and choices that make a meetup feel specific.`;
      break;
    case "socialGameHost":
      lead = `${firstName} may prefer plans where a shared activity reduces early social pressure. The ${lanePhrase}${secondLanePhrase} suggest activity-led first meetings that give everyone a simple shared task.`;
      break;
    case "cafeConnector":
      lead = `${firstName} may prefer simple, low-pressure plans. The ${lanePhrase}${secondLanePhrase} suggest a public setting where people can settle in and talk without a complicated schedule.`;
      break;
    case "curiousSpecialist":
      lead = `${firstName} may enjoy plans built around a specific topic. The ${lanePhrase}${secondLanePhrase} suggest giving the group something concrete to compare, learn, or discuss.`;
      break;
    case "calmAnchor":
      lead = `${firstName} may prefer a calmer pace. The ${lanePhrase}${secondLanePhrase} suggest plans that give people time to settle in without expecting immediate conversation.`;
      break;
    case "restlessInstigator":
      lead = `${firstName} seems to prefer a concrete first step. The ${lanePhrase}${secondLanePhrase} suggest choosing a route, table, photo prompt, or other small task, then letting conversation develop around it.`;
      break;
    case "ideaFirstExplorer":
      lead = `${firstName} may prefer plans with room for new ideas. The ${lanePhrase}${secondLanePhrase} suggest starting with a clear activity while leaving some details open for the group to decide.`;
      break;
    case "quietSpecialist":
      lead = `${firstName} may prefer smaller plans with something specific to discuss. The ${lanePhrase}${secondLanePhrase} suggest something concrete to notice, make, learn, or compare.`;
      break;
    case "steadyHost":
      lead = `${firstName} may prefer small groups with a clear structure. The ${lanePhrase}${secondLanePhrase} suggest setting enough detail for people to know what to expect without planning every moment.`;
      break;
    case "warmConnector":
      lead = `${firstName} may help first meetings feel more comfortable. The ${lanePhrase}${secondLanePhrase} suggest beginning with a shared activity so conversation has a clear starting point.`;
      break;
    case "focusedBuilder":
      lead = `${firstName} may prefer making or solving something together. The ${lanePhrase}${secondLanePhrase} suggest a plan where people can bring an idea, question, or practical task to work through.`;
      break;
    case "playfulScout":
      lead = `${firstName} may prefer low-pressure first meetings. The ${lanePhrase}${secondLanePhrase} suggest an activity that gives conversation a clear starting point.`;
      break;
    case "practicalOrganizer":
      lead = `${firstName} may prefer plans with clear details. The ${lanePhrase}${secondLanePhrase} suggest deciding what to do, where to meet, and what the group needs before the activity starts.`;
      break;
    case "flexibleParticipant":
      lead = `${firstName} has a flexible profile without one obvious social role. The ${lanePhrase}${secondLanePhrase} should guide the first group more than a broad personality label.`;
      break;
  }

  if (!secondaryCandidate) {
    return lead;
  }

  return `${lead} ${buildBlendReadSentence(secondaryCandidate)}`;
}

function describePrimaryLanePull(lane: ActivityLane | undefined) {
  return lane
    ? describeLaneForPortrait(lane)
    : "the interests already on the profile";
}

function describeSecondaryLanePull(lane: ActivityLane | undefined) {
  if (!lane) {
    return "";
  }

  const lanePhrase = describeLaneForPortrait(lane);

  if (lane.confidence === "soft") {
    return `, with a lighter hint of ${lanePhrase}`;
  }

  return `, with a second pull toward ${lanePhrase}`;
}

function buildBlendReadSentence(candidate: ProfilePortraitCandidate) {
  return `This is a blended read: ${getPortraitBlendPhrase(candidate.key)} also shows up strongly.`;
}
