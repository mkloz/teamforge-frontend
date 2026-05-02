import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

const PERSONALITY_DESCRIPTIONS: Record<
  string,
  { title: string; summary: string; strengths: string[]; inGroups: string }
> = {
  "high-openness-high-extraversion": {
    title: "The Creative Catalyst",
    summary:
      "A magnetic personality who combines boundless imagination with infectious social energy. They're the ones suggesting impromptu road trips, organizing themed parties, or rallying friends for that quirky new experience everyone else is too cautious to try. Their enthusiasm is contagious, and they have a gift for making others feel adventurous and alive.",
    strengths: [
      "Generates exciting ideas for group activities",
      "Makes everyone feel included in adventures",
      "Turns ordinary moments into memorable experiences",
      "Brings creative solutions to group challenges",
    ],
    inGroups:
      "The spark plug who keeps things interesting. They'll suggest the unconventional restaurant, propose the creative team-building activity, and ensure no gathering ever feels dull or routine.",
  },
  "high-openness-low-extraversion": {
    title: "The Thoughtful Dreamer",
    summary:
      "A deeply creative soul with a rich inner world that they share selectively with trusted friends. They bring profound insights and artistic sensibilities to intimate conversations, often seeing connections and possibilities that others miss. While they may not seek the spotlight, their ideas and perspectives are uniquely valuable.",
    strengths: [
      "Offers unique, creative perspectives",
      "Creates meaningful one-on-one connections",
      "Brings depth to conversations and activities",
      "Appreciates and enhances aesthetic experiences",
    ],
    inGroups:
      "The quiet visionary who contributes thoughtful ideas. They're most comfortable in smaller gatherings where they can engage deeply, and they often become the creative conscience of their friend groups.",
  },
  "high-openness-high-conscientiousness": {
    title: "The Visionary Builder",
    summary:
      "A rare combination of big-picture thinking and follow-through capability. They dream ambitious dreams but also create the plans and put in the work to make them real. Whether it's organizing a complex group trip or launching a creative project, they balance innovation with execution in ways that inspire others.",
    strengths: [
      "Turns creative visions into actionable plans",
      "Balances innovation with reliability",
      "Excels at complex, creative projects",
      "Inspires others while delivering results",
    ],
    inGroups:
      "The architect of memorable experiences. They'll not only come up with the brilliant idea for the group adventure but also handle the logistics, bookings, and contingency plans.",
  },
  "high-conscientiousness-high-agreeableness": {
    title: "The Reliable Anchor",
    summary:
      "The person everyone knows they can count on, no matter what. They combine genuine care for others with the organizational skills to actually show up and follow through. They remember birthdays, check in during tough times, and make sure group plans actually happen. Their reliability creates a foundation of trust that strengthens every relationship.",
    strengths: [
      "Always follows through on commitments",
      "Remembers important details about friends",
      "Creates structure that helps groups function",
      "Balances personal needs with group harmony",
    ],
    inGroups:
      "The backbone of any friend group. They're the one who books the restaurant, sends the reminder texts, and makes sure no one feels left out. Their consistency builds deep, lasting friendships.",
  },
  "high-conscientiousness-low-agreeableness": {
    title: "The Honest Achiever",
    summary:
      "A driven personality who values excellence and authenticity over social niceties. They set high standards for themselves and aren't afraid to speak difficult truths that others avoid. While their directness can be challenging, it's ultimately refreshing, and they often help groups make better decisions by cutting through comfortable but unhelpful consensus.",
    strengths: [
      "Provides honest, valuable feedback",
      "Maintains high standards for group activities",
      "Makes decisions efficiently",
      "Holds themselves and others accountable",
    ],
    inGroups:
      "The voice of reason who keeps groups honest. They'll point out when plans are unrealistic, ensure commitments are kept, and help groups avoid the pitfalls of groupthink.",
  },
  "high-extraversion-high-agreeableness": {
    title: "The Social Glue",
    summary:
      "A natural community builder with the rare ability to make everyone feel seen and valued. They thrive on bringing people together and have an intuitive sense for group dynamics, often introducing strangers who become friends and smoothing over tensions before they escalate. Their warmth and energy create spaces where authentic connection flourishes.",
    strengths: [
      "Makes everyone feel welcome and included",
      "Naturally connects people with shared interests",
      "Defuses conflicts with grace",
      "Energizes and unites groups",
    ],
    inGroups:
      "The heart of the social circle. They're constantly expanding the group, introducing people, and ensuring that gatherings have the right mix of energy and inclusion.",
  },
  "high-extraversion-low-agreeableness": {
    title: "The Bold Leader",
    summary:
      "A charismatic personality who isn't afraid to take charge and make things happen. They bring confidence and energy to group settings, often stepping up when leadership is needed. While they may challenge others and push boundaries, their assertiveness often drives groups to achieve more than they would otherwise.",
    strengths: [
      "Takes initiative in group situations",
      "Brings energy and momentum",
      "Makes decisions confidently",
      "Challenges groups to aim higher",
    ],
    inGroups:
      "The natural leader who steps up when direction is needed. They'll organize the activity, make the tough calls, and keep things moving, even if it means ruffling a few feathers.",
  },
  "high-agreeableness-high-sensitivity": {
    title: "The Empathic Guardian",
    summary:
      "A deeply feeling soul with extraordinary emotional intelligence. They sense what others need, often before those people know themselves, and offer compassion and understanding that creates profound trust. While they may need time to process intense experiences, their capacity for emotional connection makes them irreplaceable friends.",
    strengths: [
      "Provides deep emotional support",
      "Senses group moods and needs intuitively",
      "Creates safe spaces for vulnerability",
      "Remembers and honors others' feelings",
    ],
    inGroups:
      "The emotional anchor who ensures everyone feels heard. They notice when someone is struggling, create space for difficult conversations, and help groups navigate emotional complexity.",
  },
  "high-agreeableness-low-sensitivity": {
    title: "The Steady Supporter",
    summary:
      "A calm, caring presence who remains grounded even in chaos. They combine genuine warmth with emotional stability, making them the person others turn to during crises. Their unflappable nature and consistent kindness create a sense of safety that allows others to take risks and express themselves freely.",
    strengths: [
      "Remains calm under pressure",
      "Offers reliable emotional support",
      "Creates stability in group dynamics",
      "Helps others feel safe to be vulnerable",
    ],
    inGroups:
      "The rock that others lean on. When things get stressful or emotions run high, they provide the steady presence that helps groups navigate challenges without falling apart.",
  },
  balanced: {
    title: "The Adaptive Ally",
    summary:
      "A versatile personality who reads situations well and adjusts their approach accordingly. They can energize a quiet gathering or calm an intense one, step up to lead or support from behind. This flexibility makes them valuable in any group configuration and allows them to connect authentically with a wide range of personalities.",
    strengths: [
      "Adapts to different social situations",
      "Bridges gaps between different personality types",
      "Provides balance to group dynamics",
      "Connects with a wide range of people",
    ],
    inGroups:
      "The versatile member who fills whatever role is needed. They can be the planner, the peacemaker, the energizer, or the supporter, depending on what the group needs most.",
  },
};

export interface PersonalityProfile {
  title: string;
  summary: string;
  strengths: string[];
  inGroups: string;
}

function isOceanTraitKey(key: string): key is OceanTraitKey {
  return [
    "openness",
    "conscientiousness",
    "extraversion",
    "agreeableness",
    "neuroticism",
  ].includes(key);
}

export function generateDetailedDescription(
  scores: OceanScores,
): PersonalityProfile {
  const highTraits: OceanTraitKey[] = [];
  const lowTraits: OceanTraitKey[] = [];

  Object.entries(scores).forEach(([key, value]) => {
    if (isOceanTraitKey(key)) {
      if (value >= 65) highTraits.push(key);
      if (value <= 35) lowTraits.push(key);
    }
  });

  if (highTraits.includes("openness") && highTraits.includes("extraversion")) {
    return PERSONALITY_DESCRIPTIONS["high-openness-high-extraversion"];
  }

  if (highTraits.includes("openness") && lowTraits.includes("extraversion")) {
    return PERSONALITY_DESCRIPTIONS["high-openness-low-extraversion"];
  }

  if (
    highTraits.includes("openness") &&
    highTraits.includes("conscientiousness")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-openness-high-conscientiousness"];
  }

  if (
    highTraits.includes("conscientiousness") &&
    highTraits.includes("agreeableness")
  ) {
    return PERSONALITY_DESCRIPTIONS[
      "high-conscientiousness-high-agreeableness"
    ];
  }

  if (
    highTraits.includes("conscientiousness") &&
    lowTraits.includes("agreeableness")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-conscientiousness-low-agreeableness"];
  }

  if (
    highTraits.includes("extraversion") &&
    highTraits.includes("agreeableness")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-extraversion-high-agreeableness"];
  }

  if (
    highTraits.includes("extraversion") &&
    lowTraits.includes("agreeableness")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-extraversion-low-agreeableness"];
  }

  if (
    highTraits.includes("agreeableness") &&
    highTraits.includes("neuroticism")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-agreeableness-high-sensitivity"];
  }

  if (
    highTraits.includes("agreeableness") &&
    lowTraits.includes("neuroticism")
  ) {
    return PERSONALITY_DESCRIPTIONS["high-agreeableness-low-sensitivity"];
  }

  return PERSONALITY_DESCRIPTIONS["balanced"];
}

export function getBorderlineExplanation(
  dimension: string,
  score: number,
): string {
  const side = score <= 50 ? "first" : "second";
  const percentage = Math.abs(50 - score) <= 5 ? "nearly balanced" : "leaning";

  const dimensionLabels: Record<string, [string, string]> = {
    EI: ["Extraversion", "Introversion"],
    SN: ["Sensing", "Intuition"],
    TF: ["Thinking", "Feeling"],
    JP: ["Judging", "Perceiving"],
  };

  const [first, second] = dimensionLabels[dimension] || ["", ""];
  const leaning = side === "first" ? first : second;

  return `Your ${first}/${second} preference is ${percentage} (${score}% toward ${leaning}). You likely relate to both descriptions depending on the context.`;
}
