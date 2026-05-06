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
      lead = `${firstName} reads like someone who needs the plan to leave the group chat. The ${lanePhrase}${secondLanePhrase} point to a person who warms up through motion: pick a route, try the place, make the first small decision, then let people get comfortable while something is already happening.`;
      break;
    case "creativeInstigator":
      lead = `${firstName} comes across as someone with taste and a bit of mischief in the best sense. The ${lanePhrase}${secondLanePhrase} suggest company alone is not the whole draw; the plan needs a point of view, even if it starts casually.`;
      break;
    case "tasteMaker":
      lead = `${firstName} reads like the person who notices what makes a plan feel chosen. The ${lanePhrase}${secondLanePhrase} suggest a good eye for atmosphere, details, and small choices that keep a meet-up from feeling generic.`;
      break;
    case "socialGameHost":
      lead = `${firstName} feels strongest in plans where the activity gives everyone permission to relax. The ${lanePhrase}${secondLanePhrase} point toward someone who can make a first meet feel less loaded by giving people something simple to do together.`;
      break;
    case "cafeConnector":
      lead = `${firstName} reads as someone who can make a low-key plan feel warmer than it looks on paper. The ${lanePhrase}${secondLanePhrase} suggest they are well suited to first meets where the setting is simple, public, and easy to settle into.`;
      break;
    case "curiousSpecialist":
      lead = `${firstName} comes across as the person with the topic people did not expect to enjoy. The ${lanePhrase}${secondLanePhrase} suggest a profile that gets better when the group has something concrete to compare, learn, or pick apart.`;
      break;
    case "calmAnchor":
      lead = `${firstName} reads like someone who notices the pace of the room. The ${lanePhrase}${secondLanePhrase} suggest they are better in plans that leave people room to arrive properly instead of forcing instant chemistry.`;
      break;
    case "restlessInstigator":
      lead = `${firstName} reads like someone who gets restless when a plan stays abstract for too long. There is a bias toward doing the thing, trying the route, choosing the table, taking the photo, starting somewhere. The ${lanePhrase}${secondLanePhrase} make that feel less like random energy and more like a habit: give the group a real first move, then let the social part catch up.`;
      break;
    case "ideaFirstExplorer":
      lead = `${firstName} comes across as idea-first: quick to notice a more interesting version of the plan, and usually happier when there is room to improvise. The ${lanePhrase}${secondLanePhrase} point to someone who wants the meet-up to have a shape, a hook, something worth talking about after.`;
      break;
    case "quietSpecialist":
      lead = `${firstName} reads like the person with the detail that makes a quiet room better. The ${lanePhrase}${secondLanePhrase} suggest a profile that gets stronger when the group has something concrete to notice, make, learn, or compare.`;
      break;
    case "steadyHost":
      lead = `${firstName} gives off the profile of someone who can make a small group feel held together. The ${lanePhrase}${secondLanePhrase} add warmth to that structure: not over-planned, not vague either, just enough direction for people to relax into the plan.`;
      break;
    case "warmConnector":
      lead = `${firstName} reads as the kind of person who helps the first few minutes feel less stiff. The ${lanePhrase}${secondLanePhrase} give that warmth somewhere to go, so the group can ease into a shared activity instead of circling around small talk.`;
      break;
    case "focusedBuilder":
      lead = `${firstName} has a builder streak: less interested in vague networking, more interested in making an idea concrete. The ${lanePhrase}${secondLanePhrase} suggest conversations that work best when people bring taste, curiosity, or a rough problem to shape together.`;
      break;
    case "playfulScout":
      lead = `${firstName} feels like the person who can make a first meet less heavy. The ${lanePhrase}${secondLanePhrase} point toward low-pressure plans where people can warm up through the activity before the conversation has to carry everything.`;
      break;
    case "practicalOrganizer":
      lead = `${firstName} reads as someone who helps a plan become real. The ${lanePhrase}${secondLanePhrase} matter because they give the structure a human reason: something to do, somewhere to go, and fewer loose ends for the group to trip over.`;
      break;
    case "flexibleParticipant":
      lead = `${firstName} has a flexible profile: not locked into one obvious social role, but with enough interest detail to find the right thread. The ${lanePhrase}${secondLanePhrase} should lead the first match more than a heavy personality label.`;
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
