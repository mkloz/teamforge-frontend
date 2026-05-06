import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

type TraitDirection = "high" | "low";

interface TraitSignal {
  trait: OceanTraitKey;
  direction: TraitDirection;
  score: number;
  strength: number;
}

interface SignalPair {
  first: TraitSignal;
  second: TraitSignal;
  key: string;
  strength: number;
}

interface TraitCopy {
  summary: string;
  strengths: string[];
  socialRead: string;
  mostYourself: string;
}

export interface PersonalityProfile {
  title: string;
  summary: string;
  strengths: string[];
  inGroups: string;
}

const TRAITS: OceanTraitKey[] = [
  "openness",
  "conscientiousness",
  "extraversion",
  "agreeableness",
  "neuroticism",
];

const SIGNAL_THRESHOLD = 12;
const STRONG_SIGNAL_THRESHOLD = 22;
const TERTIARY_SIGNAL_THRESHOLD = 18;

const PAIR_TITLES: Record<string, string> = {
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

const PAIR_DYNAMICS: Partial<Record<string, string>> = {
  "agreeableness:high|conscientiousness:high":
    "Your care tends to become practical: remembering details, keeping promises, and making reliability feel personal.",
  "agreeableness:high|extraversion:high":
    "Warmth and outward energy meet in you, so connection can feel both lively and emotionally easy.",
  "agreeableness:high|extraversion:low":
    "Your warmth is quieter and more selective, often showing up through patience, loyalty, and careful attention.",
  "agreeableness:high|neuroticism:high":
    "You are emotionally receptive, which can make you unusually aware of what people are feeling beneath the surface.",
  "agreeableness:low|conscientiousness:high":
    "You are often more interested in what is honest and well-made than in keeping everything socially smooth.",
  "conscientiousness:high|openness:high":
    "You have both imagination and a need for shape, so ideas feel best when they can become something real.",
  "conscientiousness:low|openness:high":
    "Curiosity matters more to you when it can stay loose, experimental, and free from premature definition.",
  "extraversion:high|neuroticism:low":
    "Your energy has a relatively steady base, which can make spontaneity feel easy rather than chaotic.",
  "extraversion:high|openness:high":
    "Possibility tends to move through you out loud: ideas, invitations, and connections often appear as you talk and explore.",
  "extraversion:low|neuroticism:high":
    "You may need more space than people expect because your inner reactions can be vivid even when your outside stays quiet.",
  "extraversion:low|openness:high":
    "Your imagination has a private quality; it often deepens before it becomes visible to other people.",
  "neuroticism:high|openness:high":
    "Your mind is sensitive to possibility and consequence at the same time, which can make you both imaginative and highly perceptive.",
  "neuroticism:low|openness:high":
    "You can follow curiosity without being shaken too easily by ambiguity or a change in direction.",
};

const FALLBACK_TITLES: Record<OceanTraitKey, Record<TraitDirection, string>> = {
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

const TRAIT_COPY: Record<OceanTraitKey, Record<TraitDirection, TraitCopy>> = {
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

export function generateDetailedDescription(
  scores: OceanScores,
): PersonalityProfile {
  const signals = getRankedSignals(scores);

  if (signals.length === 0) {
    return buildBalancedProfile();
  }

  const primary = signals[0];
  const selectedPair = getBestPair(primary, signals);
  const secondary = selectedPair
    ? getOtherSignal(selectedPair, primary)
    : signals[1];

  return {
    title: getProfileTitle(primary, selectedPair),
    summary: buildSummary(
      primary,
      secondary,
      getTertiarySignal(signals, [primary, secondary]),
    ),
    strengths: buildStrengths(signals),
    inGroups: buildSocialRead(primary, secondary, selectedPair),
  };
}

function getRankedSignals(scores: OceanScores): TraitSignal[] {
  return TRAITS.map((trait) => {
    const score = scores[trait];
    const strength = Math.abs(score - 50);
    const direction: TraitDirection = score >= 50 ? "high" : "low";

    return { trait, direction, score, strength };
  })
    .filter((signal) => signal.strength >= SIGNAL_THRESHOLD)
    .sort((left, right) => right.strength - left.strength);
}

function getBestPair(
  primary: TraitSignal,
  signals: TraitSignal[],
): SignalPair | null {
  const candidates: SignalPair[] = [];

  for (let left = 0; left < Math.min(signals.length, 4); left++) {
    for (let right = left + 1; right < Math.min(signals.length, 4); right++) {
      const first = signals[left];
      const second = signals[right];
      const key = getPairKey(first, second);

      candidates.push({
        first,
        second,
        key,
        strength: first.strength + second.strength,
      });
    }
  }

  const namedPairs = candidates
    .filter((pair) => PAIR_TITLES[pair.key])
    .sort((left, right) => right.strength - left.strength);
  const primaryPair = namedPairs.find((pair) => pairIncludes(pair, primary));

  return primaryPair ?? namedPairs[0] ?? null;
}

function getOtherSignal(pair: SignalPair, signal: TraitSignal) {
  return sameSignal(pair.first, signal) ? pair.second : pair.first;
}

function pairIncludes(pair: SignalPair, signal: TraitSignal) {
  return sameSignal(pair.first, signal) || sameSignal(pair.second, signal);
}

function sameSignal(left: TraitSignal, right: TraitSignal) {
  return left.trait === right.trait && left.direction === right.direction;
}

function getProfileTitle(
  primary: TraitSignal,
  selectedPair: SignalPair | null,
) {
  if (!selectedPair) {
    return FALLBACK_TITLES[primary.trait][primary.direction];
  }

  const pairedTitle = PAIR_TITLES[selectedPair.key];

  return pairedTitle ?? FALLBACK_TITLES[primary.trait][primary.direction];
}

function getPairKey(first: TraitSignal, second: TraitSignal) {
  return [first, second]
    .map((signal) => `${signal.trait}:${signal.direction}`)
    .sort()
    .join("|");
}

function buildSummary(
  primary: TraitSignal,
  secondary?: TraitSignal,
  tertiary?: TraitSignal,
) {
  const pairKey = secondary ? getPairKey(primary, secondary) : null;
  const pairDynamic = pairKey ? PAIR_DYNAMICS[pairKey] : null;
  const sentences = [
    TRAIT_COPY[primary.trait][primary.direction].summary,
    pairDynamic ??
      (secondary
        ? TRAIT_COPY[secondary.trait][secondary.direction].summary
        : null),
    tertiary && tertiary.strength >= TERTIARY_SIGNAL_THRESHOLD
      ? getModifierSentence(tertiary)
      : getBalanceSentence(primary, secondary),
  ].filter(Boolean);

  return sentences.join(" ");
}

function getModifierSentence(signal: TraitSignal) {
  const copy = TRAIT_COPY[signal.trait][signal.direction];

  return signal.strength >= STRONG_SIGNAL_THRESHOLD
    ? `Another clear part of the pattern is this: ${copy.mostYourself}.`
    : `A quieter part of the pattern is this: ${copy.mostYourself}.`;
}

function getBalanceSentence(primary: TraitSignal, secondary?: TraitSignal) {
  if (!secondary) {
    return `You tend to feel most like yourself when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}.`;
  }

  return `The mix is most visible when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}, while ${TRAIT_COPY[secondary.trait][secondary.direction].mostYourself}.`;
}

function buildStrengths(signals: TraitSignal[]) {
  const strengths: string[] = [];

  addOneStrengthPerSignal(signals, strengths);
  fillRemainingStrengths(signals, strengths);
  fillFallbackStrengths(strengths);

  return strengths.slice(0, 4);
}

function addOneStrengthPerSignal(signals: TraitSignal[], strengths: string[]) {
  for (const signal of signals.slice(0, 4)) {
    const candidates = TRAIT_COPY[signal.trait][signal.direction].strengths;
    const firstUnused = candidates.find(
      (strength) => !strengths.includes(strength),
    );

    if (firstUnused) {
      strengths.push(firstUnused);
    }
  }
}

function fillRemainingStrengths(signals: TraitSignal[], strengths: string[]) {
  for (const signal of signals) {
    for (const strength of TRAIT_COPY[signal.trait][signal.direction]
      .strengths) {
      if (!strengths.includes(strength)) {
        strengths.push(strength);
      }
    }
    if (strengths.length === 4) {
      return;
    }
  }
}

function fillFallbackStrengths(strengths: string[]) {
  const fallbackStrengths = [
    "Adapts to different social situations",
    "Bridges different personalities without losing yourself",
    "Provides balance when a room has too much of one energy",
    "Connects with a wide range of people",
  ];

  for (const strength of fallbackStrengths) {
    if (!strengths.includes(strength)) {
      strengths.push(strength);
    }

    if (strengths.length === 4) {
      return;
    }
  }
}

function buildSocialRead(
  primary: TraitSignal,
  secondary?: TraitSignal,
  selectedPair?: SignalPair | null,
) {
  const primaryRead = TRAIT_COPY[primary.trait][primary.direction].socialRead;

  if (!secondary) {
    return `Around other people, ${primaryRead}. You tend to feel most natural when ${TRAIT_COPY[primary.trait][primary.direction].mostYourself}.`;
  }

  const pairDynamic = selectedPair ? PAIR_DYNAMICS[selectedPair.key] : null;

  if (pairDynamic) {
    return `Around other people, ${primaryRead}. ${pairDynamic}`;
  }

  return `Around other people, ${primaryRead}. At the same time, ${TRAIT_COPY[secondary.trait][secondary.direction].socialRead}.`;
}

function getTertiarySignal(
  signals: TraitSignal[],
  excludedSignals: Array<TraitSignal | undefined>,
) {
  return signals.find(
    (signal) =>
      !excludedSignals.some(
        (excluded) =>
          excluded &&
          excluded.trait === signal.trait &&
          excluded.direction === signal.direction,
      ),
  );
}

function buildBalancedProfile(): PersonalityProfile {
  return {
    title: "The Adaptive Ally",
    summary:
      "You are not pulled too hard toward one extreme, which can make you harder to summarize but easier to recognize in real life. You tend to read the moment, adjust your pace, and become different parts of yourself depending on who is around and what the situation asks for.",
    strengths: [
      "Adapts to different social situations",
      "Bridges different personalities without losing yourself",
      "Provides balance when a room has too much of one energy",
      "Connects with a wide range of people",
    ],
    inGroups:
      "Around other people, you are often the one who adjusts without making a performance of it. You can be steady, playful, practical, or reflective depending on what feels true in the moment.",
  };
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
