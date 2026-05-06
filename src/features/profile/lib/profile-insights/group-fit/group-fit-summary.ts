import { describeLaneForPortrait } from "../portrait";
import type {
  ActivityIdea,
  ActivityLane,
  ActivityLaneConfidence,
  PortraitKey,
  ProfilePortraitCandidate,
  SocialProfileModel,
} from "../types";
import { getGroupFitStyle } from "./group-fit-style";

export function buildPortraitGroupSummary(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
  closeSecond: ProfilePortraitCandidate | null,
) {
  const { context } = socialProfile;
  const lane = context.lanes[0];
  const secondLane = context.lanes.find(
    (item) => item.key !== lane?.key && item.confidence !== "soft",
  );
  const lanePhrase = lane
    ? ` through ${describeLaneForPortrait(lane)}${getLaneConfidencePhrase(lane)}`
    : "";
  const secondLanePhrase = buildGroupSecondaryLaneSentence(secondLane);
  const hybridPhrase = buildGroupBlendSentence(closeSecond);

  const summaries: Record<PortraitKey, string> = {
    activeCatalyst: `${context.firstName} fits groups that become less awkward once people are moving${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    cafeConnector: `${context.firstName} fits simple first meets where the setting does half the warming-up${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    calmAnchor: `${context.firstName} fits smaller groups where pace matters and nobody has to perform immediately${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    creativeInstigator: `${context.firstName} fits groups that want a plan with some taste, beyond the usual time-and-place setup${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    curiousSpecialist: `${context.firstName} fits groups with a topic, object, route, or question people can actually dig into${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    focusedBuilder: `${context.firstName} fits groups where ideas can turn into something concrete${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    flexibleParticipant: `${context.firstName} can fit several group shapes, so the first activity should carry the match${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    ideaFirstExplorer: `${context.firstName} fits groups that like a better version of the obvious plan${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    playfulScout: `${context.firstName} fits low-pressure groups where the activity makes joining feel easier${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    practicalOrganizer: `${context.firstName} fits groups that need enough structure to stop the plan from drifting${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    quietSpecialist: `${context.firstName} fits smaller groups where a concrete activity or topic can draw them out${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    restlessInstigator: `${context.firstName} fits groups that need someone to make the first move before the plan gets over-discussed${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    socialGameHost: `${context.firstName} fits groups where doing something together removes the pressure to be instantly interesting${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    steadyHost: `${context.firstName} fits groups that need a warm frame and enough clarity to relax${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    tasteMaker: `${context.firstName} fits groups where the small choices matter: place, route, feel, or what makes the plan seem chosen${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
    warmConnector: `${context.firstName} fits groups that need an easier first few minutes and a low-pressure way in${lanePhrase}.${secondLanePhrase}${hybridPhrase}`,
  };

  return summaries[key];
}

export function buildPortraitGroupSignals(
  key: PortraitKey,
  socialProfile: SocialProfileModel,
  topLane: ActivityLane | null,
  openingIdea: ActivityIdea | null,
) {
  const signals = new Set<string>();
  const style = getGroupFitStyle(key);

  if (topLane) {
    signals.add(
      `${topLane.label} is the lead lane: ${topLane.primaryEvidenceCount} core cue${topLane.primaryEvidenceCount === 1 ? "" : "s"}.`,
    );
  }

  if (openingIdea) {
    signals.add(`Best first move: ${openingIdea.title}.`);
  }

  if (style.posture === "starter") {
    signals.add(
      "Works best when the group can start before every detail is fixed.",
    );
  }

  if (style.posture === "connector" || style.posture === "host") {
    signals.add("The activity should carry the first few minutes.");
  }

  if (style.posture === "coordinator") {
    signals.add("Give the plan a clear time, place, and fallback.");
  }

  if (style.posture === "specialist" || style.posture === "builder") {
    signals.add(
      "A specific topic or shared problem matters more than mingling.",
    );
  }

  if (style.posture === "observer") {
    signals.add("Keep the first group small enough for pace to matter.");
  }

  if (style.posture === "curator") {
    signals.add("The setting should feel chosen, not interchangeable.");
  }

  if (socialProfile.context.tensions.length > 0) {
    signals.add("Mixed personality cue; keep the first plan simple.");
  } else {
    const dominantTrait = socialProfile.context.traits?.dominant;

    if (dominantTrait && dominantTrait.value >= 70) {
      signals.add(`Clear ${dominantTrait.label} cue.`);
    }
  }

  return [...signals].slice(0, 4);
}

function buildGroupSecondaryLaneSentence(lane: ActivityLane | undefined) {
  if (!lane) {
    return "";
  }

  return ` Keep the ${lane.label.toLowerCase()} cue available, but let the lead lane set the match.`;
}

function buildGroupBlendSentence(candidate: ProfilePortraitCandidate | null) {
  if (!candidate) {
    return "";
  }

  return ` The ${candidate.title.toLowerCase()} side is close enough that the first group should leave it room.`;
}

function getLaneConfidencePhrase(lane: ActivityLane) {
  const phrases: Record<ActivityLaneConfidence, string> = {
    clear: " with a clear evidence base",
    soft: " with early evidence",
    strong: " with strong evidence",
  };

  return phrases[lane.confidence];
}
