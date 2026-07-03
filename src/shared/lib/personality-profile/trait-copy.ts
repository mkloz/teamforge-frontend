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
        "You are pulled toward possibility: new ideas, subtle meanings, and the feeling that there is always another angle worth exploring.",
      strengths: [
        "Sees connections other people miss",
        "Follows curiosity into unexpected places",
        "Keeps imagination close to everyday life",
      ],
      socialRead:
        "you bring curiosity into the room and often notice a more interesting path before anyone names it",
      mostYourself:
        "there is room to explore, reinterpret, and make something ordinary feel new",
    },
    low: {
      summary:
        "You are grounded by what is tangible and tested. You usually prefer a clear reality over an elegant theory.",
      strengths: [
        "Keeps attention on what is real and workable",
        "Cuts through overcomplicated ideas",
        "Trusts practical evidence over novelty",
      ],
      socialRead:
        "you keep things anchored and help others return to what is actually in front of them",
      mostYourself:
        "expectations are clear and the situation feels concrete enough to trust",
    },
  },
  conscientiousness: {
    high: {
      summary:
        "You feel calmer when intentions turn into structure: a plan, a standard, or a promise that is actually kept.",
      strengths: [
        "Turns intention into follow-through",
        "Notices the details that make trust possible",
        "Brings steadiness without needing a spotlight",
      ],
      socialRead:
        "people often experience you as dependable because your care shows up in what you actually do",
      mostYourself: "there is enough order to let you relax into the moment",
    },
    low: {
      summary:
        "You do not need everything locked down before you begin. Flexibility keeps you interested and lets better options appear.",
      strengths: [
        "Stays open when the plan changes",
        "Finds ease in loose, unfinished moments",
        "Adapts without making everything heavy",
      ],
      socialRead:
        "you can keep things light when others start making the moment too rigid",
      mostYourself:
        "you can move naturally without every detail being decided in advance",
    },
  },
  extraversion: {
    high: {
      summary:
        "Your energy tends to move outward. You think well in motion, with people, conversation, and visible momentum around you.",
      strengths: [
        "Brings thoughts out into the open quickly",
        "Makes first moments feel less stiff",
        "Adds visible energy when things are too quiet",
      ],
      socialRead:
        "you often make your presence felt early, which can help people relax into the exchange",
      mostYourself:
        "there is movement, conversation, and something alive to respond to",
    },
    low: {
      summary:
        "Your energy is more selective. You often need quiet space before your real thoughts and preferences become clear.",
      strengths: [
        "Notices details that louder moments can bury",
        "Chooses words with care",
        "Builds trust through consistency rather than volume",
      ],
      socialRead:
        "you may take longer to unfold, but your presence becomes clearer when the pace gives you room",
      mostYourself:
        "you are not pushed to perform before you have settled into the room",
    },
  },
  agreeableness: {
    high: {
      summary:
        "You are tuned to other people's comfort and emotional weather, sometimes before anything is said directly.",
      strengths: [
        "Makes warmth feel natural rather than forced",
        "Senses when someone needs gentler handling",
        "Creates ease without demanding attention",
      ],
      socialRead:
        "you soften the emotional edges of a room and make it easier for people to be themselves",
      mostYourself:
        "kindness is treated as strength, not as something people take for granted",
    },
    low: {
      summary:
        "You are not easily swept along by social pressure. You tend to respect honesty more than easy agreement.",
      strengths: [
        "Says what others are only circling around",
        "Keeps your own judgment intact",
        "Spots false harmony quickly",
      ],
      socialRead:
        "you can be refreshing because people usually know where they stand with you",
      mostYourself:
        "directness is welcome and nobody expects you to soften every opinion",
    },
  },
  neuroticism: {
    high: {
      summary:
        "You feel things quickly and notice tension early. That sensitivity can make you perceptive, even when it costs energy.",
      strengths: [
        "Reads subtle tension before it becomes obvious",
        "Takes emotional undercurrents seriously",
        "Notices what a smoother person might miss",
      ],
      socialRead:
        "you often catch small shifts in tone, mood, or risk before others have words for them",
      mostYourself:
        "there is enough emotional honesty that you do not have to pretend everything is fine",
    },
    low: {
      summary:
        "Your emotional baseline is fairly steady. You are less easily shaken by friction, uncertainty, or a change of plan.",
      strengths: [
        "Stays steady when the moment gets messy",
        "Does not overreact to small uncertainty",
        "Gives others a calmer point of reference",
      ],
      socialRead:
        "you can make pressure feel more manageable because you do not absorb every ripple around you",
      mostYourself: "things can be imperfect without becoming dramatic",
    },
  },
};
