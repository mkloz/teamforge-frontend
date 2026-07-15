import type {
  TraitCopy,
  TraitDirection,
} from "@/shared/lib/personality-profile/types";
import type { OceanTraitKey } from "@/shared/types/psychometrics";

export const TRAIT_COPY: Record<
  OceanTraitKey,
  Record<TraitDirection, TraitCopy>
> = {
  openness: {
    high: {
      summary:
        "Your answers suggest that you often enjoy new ideas, different interpretations, and unfamiliar experiences.",
      strengths: [
        "Explores several ways to understand a topic",
        "Shows interest in unfamiliar ideas",
        "Brings imagination into practical situations",
      ],
      socialRead:
        "you may introduce a new idea or a different way to approach the plan",
      mostYourself:
        "you have room to explore and interpret the activity in your own way",
    },
    low: {
      summary:
        "Your answers suggest that you often prefer practical information, familiar methods, and concrete outcomes.",
      strengths: [
        "Keeps attention on workable options",
        "Simplifies overcomplicated ideas",
        "Uses practical evidence when deciding",
      ],
      socialRead:
        "you may help the group focus on the practical details in front of them",
      mostYourself: "expectations are clear and the plan is concrete",
    },
  },
  conscientiousness: {
    high: {
      summary:
        "Your answers suggest that you often prefer structure, clear standards, and reliable follow-through.",
      strengths: [
        "Follows through on agreed tasks",
        "Notices details in a plan",
        "Keeps work organized and consistent",
      ],
      socialRead:
        "people may experience you as dependable because you follow through on plans",
      mostYourself:
        "the plan has enough structure for you to know what to expect",
    },
    low: {
      summary:
        "Your answers suggest that you often prefer flexibility and do not need every detail decided before starting.",
      strengths: [
        "Adapts when the plan changes",
        "Starts before every detail is settled",
        "Keeps several options open",
      ],
      socialRead:
        "you may help the group adjust when the original plan changes",
      mostYourself: "you can act without every detail being decided in advance",
    },
  },
  extraversion: {
    high: {
      summary:
        "Your answers suggest that social activity and conversation often help you think and respond.",
      strengths: [
        "Shares thoughts early in a conversation",
        "Starts interaction with new people",
        "Responds well to active group settings",
      ],
      socialRead: "you may speak early and help start the group's conversation",
      mostYourself: "there is conversation and an activity to respond to",
    },
    low: {
      summary:
        "Your answers suggest that you often prefer quieter settings and time to think before responding.",
      strengths: [
        "Notices details in quieter moments",
        "Takes time before speaking",
        "Contributes consistently without seeking attention",
      ],
      socialRead:
        "you may contribute more after you have had time to settle into the group",
      mostYourself: "you have time to settle in before being asked to speak",
    },
  },
  agreeableness: {
    high: {
      summary:
        "Your answers suggest that you often consider other people's comfort and look for cooperation.",
      strengths: [
        "Looks for compromise",
        "Notices when someone may need support",
        "Encourages a cooperative tone",
      ],
      socialRead: "you may help the group handle disagreement with care",
      mostYourself: "cooperation and consideration are valued",
    },
    low: {
      summary:
        "Your answers suggest that you often value directness and independent judgment over easy agreement.",
      strengths: [
        "States concerns directly",
        "Forms an independent view",
        "Questions agreement that hides a problem",
      ],
      socialRead:
        "you may make your position clear even when the group disagrees",
      mostYourself:
        "direct opinions are welcome and disagreement can be discussed openly",
    },
  },
  neuroticism: {
    high: {
      summary:
        "Your answers suggest that you often notice stress, tension, and changes in mood quickly.",
      strengths: [
        "Notices tension early",
        "Pays attention to emotional changes",
        "Considers possible risks before acting",
      ],
      socialRead: "you may notice shifts in tone, mood, or risk early",
      mostYourself: "people can discuss concerns without dismissing them",
    },
    low: {
      summary:
        "Your answers suggest that uncertainty, disagreement, or a changed plan may not unsettle you quickly.",
      strengths: [
        "Stays calm during uncertainty",
        "Responds evenly to small setbacks",
        "Keeps attention on the immediate problem",
      ],
      socialRead: "you may remain steady when a plan changes or tension rises",
      mostYourself: "small problems can be handled without urgency",
    },
  },
};
