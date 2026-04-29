import type {
  OceanScores,
  OceanTraitKey,
  OceanTraitMeta,
} from "./profile-contract";

// Extended trait metadata with rich, detailed descriptions
export interface ExtendedTraitMeta extends OceanTraitMeta {
  icon: string;
  color: string;
  highDetailedDescription: string;
  lowDetailedDescription: string;
  inActivities: string;
  compatibleWith: string;
}

// Human-friendly trait metadata with rich descriptions
export const OCEAN_TRAITS: OceanTraitMeta[] = [
  {
    key: "openness",
    label: "Curiosity",
    highDescription: "Loves exploring new ideas and experiences",
    lowDescription: "Prefers familiar routines and practical approaches",
  },
  {
    key: "conscientiousness",
    label: "Organization",
    highDescription: "Structured, reliable, and detail-oriented",
    lowDescription: "Flexible, spontaneous, and adaptable",
  },
  {
    key: "extraversion",
    label: "Social Energy",
    highDescription: "Energized by people and social activities",
    lowDescription: "Recharges with quiet time and smaller groups",
  },
  {
    key: "agreeableness",
    label: "Warmth",
    highDescription: "Trusting, cooperative, and empathetic",
    lowDescription: "Independent, direct, and objective",
  },
  {
    key: "neuroticism",
    label: "Sensitivity",
    highDescription: "Emotionally aware and deeply feeling",
    lowDescription: "Calm under pressure and emotionally stable",
  },
];

// Extended trait data for interactive display
export const EXTENDED_TRAITS: Record<OceanTraitKey, ExtendedTraitMeta> = {
  openness: {
    key: "openness",
    label: "Curiosity",
    highDescription: "Loves exploring new ideas and experiences",
    lowDescription: "Prefers familiar routines and practical approaches",
    icon: "Sparkles",
    color: "#8b5cf6", // violet
    highDetailedDescription:
      "You have a vivid imagination and a deep appreciation for art, beauty, and novel experiences. You're drawn to unconventional ideas, enjoy philosophical discussions, and often think outside the box. You embrace change and seek out new adventures, whether that's trying exotic cuisines, exploring unfamiliar places, or diving into creative projects.",
    lowDetailedDescription:
      "You value practicality and prefer tried-and-true approaches. You find comfort in routine and familiar environments, which allows you to develop deep expertise in your areas of interest. You're grounded, realistic, and prefer concrete facts over abstract theories.",
    inActivities:
      "Thrives in creative workshops, cultural events, travel adventures, and brainstorming sessions. Loves activities that offer new perspectives or unconventional experiences.",
    compatibleWith:
      "Works well with other open-minded individuals for exploring new ideas, but also pairs nicely with practical types who can help execute creative visions.",
  },
  conscientiousness: {
    key: "conscientiousness",
    label: "Organization",
    highDescription: "Structured, reliable, and detail-oriented",
    lowDescription: "Flexible, spontaneous, and adaptable",
    icon: "ListChecks",
    color: "#0d9488", // teal
    highDetailedDescription:
      "You're the person everyone counts on. You set goals and achieve them through careful planning and persistent effort. You pay attention to details, meet deadlines, and take your commitments seriously. Your organized approach means you rarely forget important dates or let responsibilities slip through the cracks.",
    lowDetailedDescription:
      "You embrace spontaneity and prefer to go with the flow rather than stick to rigid schedules. You're adaptable and can pivot quickly when circumstances change. You may find strict routines stifling and prefer flexibility in how and when you approach tasks.",
    inActivities:
      "Excellent at planning group events, managing logistics, and ensuring activities run smoothly. You're the one who remembers to book reservations and sends helpful reminders.",
    compatibleWith:
      "Balances well with spontaneous types who bring excitement, while providing the structure that helps turn ideas into reality.",
  },
  extraversion: {
    key: "extraversion",
    label: "Social Energy",
    highDescription: "Energized by people and social activities",
    lowDescription: "Recharges with quiet time and smaller groups",
    icon: "Users",
    color: "#f59e0b", // amber
    highDetailedDescription:
      "Social situations energize you. You light up in group settings, enjoy meeting new people, and often find yourself at the center of conversations. You think out loud, express emotions openly, and draw energy from being around others. Parties, team activities, and lively gatherings are your natural habitat.",
    lowDetailedDescription:
      "You recharge through solitude or intimate conversations with close friends. You prefer depth over breadth in relationships and may need time alone after social events to restore your energy. You're a thoughtful listener who values meaningful one-on-one connections over large group dynamics.",
    inActivities:
      "High scorers shine in group outings, parties, and team sports. Lower scorers prefer intimate dinners, quiet hikes, or activities with a small, trusted group.",
    compatibleWith:
      "Introverts and extroverts often complement each other beautifully, with one bringing energy and the other bringing depth to shared experiences.",
  },
  agreeableness: {
    key: "agreeableness",
    label: "Warmth",
    highDescription: "Trusting, cooperative, and empathetic",
    lowDescription: "Independent, direct, and objective",
    icon: "Heart",
    color: "#ec4899", // pink
    highDetailedDescription:
      "You naturally tune into others' emotions and prioritize harmony in your relationships. You're generous with your time and attention, quick to offer help, and skilled at making people feel valued and understood. You prefer collaboration over competition and work to ensure everyone's voice is heard.",
    lowDetailedDescription:
      "You value honesty over diplomacy and aren't afraid to challenge ideas or push back when you disagree. You maintain healthy boundaries and make decisions based on logic rather than others' expectations. Your directness can be refreshing, and you're not easily swayed by social pressure.",
    inActivities:
      "High scorers excel at team-building activities, volunteer work, and situations requiring mediation. Lower scorers bring valuable critical thinking to group decisions.",
    compatibleWith:
      "Works wonderfully with a range of personalities. High agreeableness smooths group dynamics, while lower scorers ensure honest feedback and accountability.",
  },
  neuroticism: {
    key: "neuroticism",
    label: "Sensitivity",
    highDescription: "Emotionally aware and deeply feeling",
    lowDescription: "Calm under pressure and emotionally stable",
    icon: "Waves",
    color: "#6366f1", // indigo
    highDetailedDescription:
      "You experience emotions intensely and are highly attuned to subtle changes in your environment and relationships. This sensitivity makes you perceptive and empathetic, but may also mean you need extra self-care during stressful periods. You feel things deeply, which fuels creativity and meaningful connections.",
    lowDetailedDescription:
      "You remain calm and collected even in challenging situations. Stress doesn't easily rattle you, and you recover quickly from setbacks. Your emotional stability makes you a grounding presence for others and allows you to think clearly under pressure.",
    inActivities:
      "Those with higher sensitivity may prefer predictable activities with trusted friends, while stable types thrive in high-energy or unpredictable adventures.",
    compatibleWith:
      "Emotionally stable individuals can provide a calming anchor, while sensitive individuals bring emotional depth and awareness to the group.",
  },
};

// Rich, expanded personality descriptions based on dominant traits
const PERSONALITY_DESCRIPTIONS: Record<
  string,
  { title: string; summary: string; strengths: string[]; inGroups: string }
> = {
  // High Openness patterns
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

  // High Conscientiousness patterns
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

  // High Extraversion patterns
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

  // High Agreeableness patterns
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

  // Balanced patterns
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

// Generate comprehensive personality description
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

  // Try to find matching description pattern
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

  // Default balanced description
  return PERSONALITY_DESCRIPTIONS["balanced"];
}

// Get extended trait info for interactive display
export function getExtendedTraitInfo(
  key: OceanTraitKey,
  score: number,
): {
  label: string;
  score: number;
  level: string;
  description: string;
  inActivities: string;
  compatibleWith: string;
} {
  const trait = EXTENDED_TRAITS[key];
  const isHigh = score >= 50;

  return {
    label: trait.label,
    score,
    level: getTraitLevel(score),
    description: isHigh
      ? trait.highDetailedDescription
      : trait.lowDetailedDescription,
    inActivities: trait.inActivities,
    compatibleWith: trait.compatibleWith,
  };
}

// Get trait meta by key
export function getTraitMeta(key: OceanTraitKey): OceanTraitMeta {
  return OCEAN_TRAITS.find((t) => t.key === key)!;
}

// Get top N traits by score
export function getTopTraits(
  scores: OceanScores,
  count: number = 2,
): OceanTraitMeta[] {
  const sorted = OCEAN_TRAITS.slice().sort(
    (a, b) => scores[b.key] - scores[a.key],
  );
  return sorted.slice(0, count);
}

// Get trait level label
export function getTraitLevel(score: number): string {
  if (score >= 80) return "Very High";
  if (score >= 60) return "High";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low";
  return "Very Low";
}

// Generate personality summary from OCEAN scores
export function generateOceanSummary(scores: OceanScores): string {
  const topTraits = getTopTraits(scores, 2);
  const highTraits = topTraits.map((t) => t.label.toLowerCase());

  const descriptors: string[] = [];

  if (scores.openness >= 70) descriptors.push("creative and curious");
  else if (scores.openness <= 30) descriptors.push("practical and grounded");

  if (scores.conscientiousness >= 70)
    descriptors.push("organized and reliable");
  else if (scores.conscientiousness <= 30)
    descriptors.push("spontaneous and flexible");

  if (scores.extraversion >= 70) descriptors.push("outgoing and energetic");
  else if (scores.extraversion <= 30)
    descriptors.push("thoughtful and reserved");

  if (scores.agreeableness >= 70) descriptors.push("warm and cooperative");
  else if (scores.agreeableness <= 30)
    descriptors.push("independent and direct");

  // Neuroticism framed positively
  if (scores.neuroticism >= 70) descriptors.push("emotionally attuned");
  else if (scores.neuroticism <= 30) descriptors.push("calm and steady");

  const uniqueDescriptors = descriptors.slice(0, 3);

  if (uniqueDescriptors.length === 0) {
    return `A balanced personality with moderate levels across all traits, showing adaptability in various situations.`;
  }

  return `${uniqueDescriptors.slice(0, -1).join(", ")}${uniqueDescriptors.length > 1 ? " and " : ""}${uniqueDescriptors.slice(-1)[0]}. Strongest in ${highTraits.join(" and ")}.`;
}
