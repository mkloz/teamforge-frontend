import type { TraitDirection } from "@/shared/lib/personality-profile/types";
import type { OceanTraitKey } from "@/shared/types/psychometrics";

export const PAIR_TITLES: Record<string, string> = {
  "agreeableness:high|conscientiousness:high": "The Reliable Anchor",
  "agreeableness:high|conscientiousness:low": "The Easygoing Supporter",
  "agreeableness:high|extraversion:high": "The Social Glue",
  "agreeableness:high|extraversion:low": "The Gentle Confidant",
  "agreeableness:high|neuroticism:high": "The Empathic Guardian",
  "agreeableness:high|neuroticism:low": "The Steady Supporter",
  "agreeableness:high|openness:high": "The Warm Idealist",
  "agreeableness:low|conscientiousness:high": "The Honest Achiever",
  "agreeableness:low|extraversion:high": "The Bold Spark",
  "agreeableness:low|openness:high": "The Independent Original",
  "conscientiousness:high|neuroticism:low": "The Composed Planner",
  "conscientiousness:high|openness:high": "The Visionary Builder",
  "conscientiousness:low|extraversion:high": "The Spontaneous Starter",
  "conscientiousness:low|neuroticism:high": "The Restless Improviser",
  "conscientiousness:low|openness:high": "The Freeform Explorer",
  "extraversion:high|neuroticism:low": "The Bright Mover",
  "extraversion:high|openness:high": "The Creative Catalyst",
  "extraversion:low|neuroticism:high": "The Private Feeler",
  "extraversion:low|openness:high": "The Thoughtful Dreamer",
  "neuroticism:high|openness:high": "The Sensitive Imaginist",
  "neuroticism:low|openness:high": "The Bright Explorer",
};

export const FALLBACK_TITLES: Record<
  OceanTraitKey,
  Record<TraitDirection, string>
> = {
  openness: {
    high: "The Curious Original",
    low: "The Grounded Realist",
  },
  conscientiousness: {
    high: "The Steady Builder",
    low: "The Flexible Improviser",
  },
  extraversion: {
    high: "The Expressive Connector",
    low: "The Quiet Observer",
  },
  agreeableness: {
    high: "The Gentle Connector",
    low: "The Direct Individualist",
  },
  neuroticism: {
    high: "The Sensitive Interpreter",
    low: "The Even-Keeled Presence",
  },
};
