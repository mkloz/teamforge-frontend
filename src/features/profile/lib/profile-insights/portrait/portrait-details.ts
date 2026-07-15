import type { OceanTraitKey } from "../../profile-contract";
import type {
  PersonalityProfile,
  PortraitContext,
  PortraitKey,
  ProfilePortraitInsight,
  TraitProfile,
} from "../types";
import { capitalize } from "../utils";

export function buildPortraitDetails(
  key: PortraitKey,
  context: PortraitContext,
): ProfilePortraitInsight["details"] {
  const firstLane = context.lanes[0]?.label ?? "shared activity";
  const detailByKey: Record<PortraitKey, ProfilePortraitInsight["details"]> = {
    activeCatalyst: [
      {
        label: "Social tell",
        value: "Gets more natural once the group is already doing something.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with a clear first stop.`,
      },
      {
        label: "Watch for",
        value: "Too much pre-planning can drain the useful energy.",
      },
    ],
    cafeConnector: [
      {
        label: "Social tell",
        value: "Makes a simple setting easier to join.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, public and easy to extend or end.`,
      },
      {
        label: "Watch for",
        value: "Needs the plan to stay casual enough for people to relax.",
      },
    ],
    calmAnchor: [
      {
        label: "Social tell",
        value: "Keeps track of whether the pace still feels good.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, smaller groups, no forced performance.`,
      },
      {
        label: "Watch for",
        value: "Loud formats may hide what makes this profile useful.",
      },
    ],
    creativeInstigator: [
      {
        label: "Social tell",
        value: "Adds a sharper angle to plans that could feel ordinary.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with room for taste and improvisation.`,
      },
      {
        label: "Watch for",
        value: "Overly generic plans will probably feel flat.",
      },
    ],
    curiousSpecialist: [
      {
        label: "Social tell",
        value:
          "Brings the tangent that gives the group something real to chew on.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, focused enough to reward curiosity.`,
      },
      {
        label: "Watch for",
        value: "Works better with a topic than with pure mingling.",
      },
    ],
    focusedBuilder: [
      {
        label: "Social tell",
        value: "Wants a conversation to turn into something usable.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with room for ideas and decisions.`,
      },
      {
        label: "Watch for",
        value: "Can lose interest if the plan has no edge or purpose.",
      },
    ],
    socialGameHost: [
      {
        label: "Social tell",
        value: "Lets the activity carry the first awkward stretch.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, friendly stakes, easy laughter.`,
      },
      {
        label: "Watch for",
        value: "A heavy agenda would work against this cue.",
      },
    ],
    tasteMaker: [
      {
        label: "Social tell",
        value: "Notices the detail that makes a plan feel chosen.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with space for preference and taste.`,
      },
      {
        label: "Watch for",
        value: "Needs enough detail to avoid bland first meets.",
      },
    ],
    flexibleParticipant: [
      {
        label: "Social tell",
        value: "Looks for the thread that makes the group click.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, kept simple enough to join easily.`,
      },
      {
        label: "Watch for",
        value:
          "The profile needs a clear plan more than a big personality label.",
      },
    ],
    ideaFirstExplorer: [
      {
        label: "Social tell",
        value: "Finds the more interesting version of the obvious plan.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, especially with people who prefer several options.`,
      },
      {
        label: "Watch for",
        value: "Too much structure can flatten the best part of the profile.",
      },
    ],
    playfulScout: [
      {
        label: "Social tell",
        value: "Makes the activity do the awkward first-minute work.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, casual groups, easy exits.`,
      },
      {
        label: "Watch for",
        value: "Works better with a simple start than a serious agenda.",
      },
    ],
    practicalOrganizer: [
      {
        label: "Social tell",
        value: "Turns loose interest into a plan people can follow.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with clear time and place.`,
      },
      {
        label: "Watch for",
        value: "Needs enough flexibility that the plan still feels social.",
      },
    ],
    quietSpecialist: [
      {
        label: "Social tell",
        value: "Brings the detail people remember later.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, smaller groups, real topic.`,
      },
      {
        label: "Watch for",
        value: "Forced icebreakers will probably do less than a good activity.",
      },
    ],
    restlessInstigator: [
      {
        label: "Social tell",
        value: "Suggests the first move before the group overthinks it.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with space to change course.`,
      },
      {
        label: "Watch for",
        value: "May need one steady person nearby to hold the details.",
      },
    ],
    steadyHost: [
      {
        label: "Social tell",
        value: "Makes people feel the plan has been thought through.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with a warm but clear frame.`,
      },
      {
        label: "Watch for",
        value: "Too many open choices can slow the group down.",
      },
    ],
    warmConnector: [
      {
        label: "Social tell",
        value: "Notices when the group needs an easier way in.",
      },
      {
        label: "Best setting",
        value: `${firstLane}, with a low-pressure first activity.`,
      },
      {
        label: "Watch for",
        value: "Should not have to carry the whole social mood alone.",
      },
    ],
  };

  return [
    ...detailByKey[key].slice(0, 2),
    getPortraitSignalDetail(context),
    detailByKey[key][2],
  ];
}

function getPortraitSignalDetail(
  context: PortraitContext,
): ProfilePortraitInsight["details"][number] {
  const [tension] = context.tensions;

  if (tension) {
    return tension;
  }

  if (!context.traits && !context.personality.type) {
    return {
      label: "Read basis",
      value: "Add personality results to make this sketch less interest-led.",
    };
  }

  if (!context.traits) {
    return getPersonalityDetail(context.personality);
  }

  if (!context.personality.type) {
    return getDominantTraitDetail(context.traits);
  }

  return {
    label: "Read basis",
    value: `${context.personality.type}; ${context.traits.dominant.label} is the strongest personality score.`,
  };
}

function getDominantTraitDetail(
  traits: TraitProfile | null,
): ProfilePortraitInsight["details"][number] {
  if (!traits) {
    return {
      label: "Personality cue",
      value: "OCEAN data will sharpen this read.",
    };
  }

  const details: Record<OceanTraitKey, string> = {
    agreeableness: "Warmth is the clearest trait cue.",
    conscientiousness: "Organization is the clearest trait cue.",
    extraversion: "Social energy is the clearest trait cue.",
    neuroticism: "Sensitivity is the clearest trait cue.",
    openness: "Curiosity is the clearest trait cue.",
  };

  return {
    label: "Trait read",
    value: details[traits.dominant.key],
  };
}

function getPersonalityDetail(
  personality: PersonalityProfile,
): ProfilePortraitInsight["details"][number] {
  if (!personality.type) {
    return {
      label: "Type read",
      value: "Personality type is not available yet.",
    };
  }

  const energy =
    personality.energy === "outward" ? "starts outward" : "starts inward";
  const attention =
    personality.attention === "possibility"
      ? "looks for possibilities"
      : "trusts concrete details";
  const structure =
    personality.structure === "open"
      ? "keeps plans flexible"
      : "prefers clear decisions";

  return {
    label: personality.type,
    value: `${capitalize(energy)}, ${attention}, ${structure}.`,
  };
}
