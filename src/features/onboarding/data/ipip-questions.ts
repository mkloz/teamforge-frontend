export type Dimension = "O" | "C" | "E" | "A" | "N";

export interface IpipQuestion {
  id: number;
  text: string;
  dimension: Dimension;
  /** true = higher response → higher dimension score; false = reversed */
  keyed: "+" | "-";
}

/**
 * 150-item pool: 30 per dimension.
 * Items are drawn in interleaved order per the test-length configs below.
 * All items re-worded from IPIP public domain constructs in plain English,
 * avoiding clinical terminology per brand guidelines.
 */
export const IPIP_QUESTIONS: IpipQuestion[] = [
  // ── OPENNESS (O) ──────────────────────────────────────────────────────────
  { id: 1,  dimension: "O", keyed: "+", text: "I find myself captivated by ideas that challenge conventional thinking." },
  { id: 2,  dimension: "O", keyed: "+", text: "I enjoy exploring abstract concepts even when they have no practical use." },
  { id: 3,  dimension: "O", keyed: "-", text: "I prefer sticking to familiar routines over trying new approaches." },
  { id: 4,  dimension: "O", keyed: "+", text: "Art, music, and literature genuinely move me." },
  { id: 5,  dimension: "O", keyed: "+", text: "I like to imagine alternative ways the world could work." },
  { id: 6,  dimension: "O", keyed: "-", text: "I find philosophical discussions tedious and unproductive." },
  { id: 7,  dimension: "O", keyed: "+", text: "Encountering a new culture or perspective excites me." },
  { id: 8,  dimension: "O", keyed: "+", text: "I often notice beauty in ordinary things others overlook." },
  { id: 9,  dimension: "O", keyed: "-", text: "I prefer concrete facts over theoretical possibilities." },
  { id: 10, dimension: "O", keyed: "+", text: "I enjoy thought experiments and hypothetical scenarios." },
  { id: 11, dimension: "O", keyed: "+", text: "I seek out experiences that push the boundaries of my comfort zone." },
  { id: 12, dimension: "O", keyed: "-", text: "I rarely find myself daydreaming or getting lost in my imagination." },
  { id: 13, dimension: "O", keyed: "+", text: "I love learning about fields completely outside my expertise." },
  { id: 14, dimension: "O", keyed: "+", text: "I am drawn to complex problems with no obvious solution." },
  { id: 15, dimension: "O", keyed: "-", text: "I find it hard to get excited about creative or artistic work." },
  { id: 16, dimension: "O", keyed: "+", text: "I often question assumptions that most people take for granted." },
  { id: 17, dimension: "O", keyed: "+", text: "I enjoy poetry, metaphor, and symbolism in communication." },
  { id: 18, dimension: "O", keyed: "-", text: "I prefer straightforward explanations over nuanced ones." },
  { id: 19, dimension: "O", keyed: "+", text: "Traveling to unfamiliar places energizes me." },
  { id: 20, dimension: "O", keyed: "+", text: "I find it easy to think in analogies and see unexpected connections." },
  { id: 21, dimension: "O", keyed: "-", text: "I am not particularly interested in understanding how things work beneath the surface." },
  { id: 22, dimension: "O", keyed: "+", text: "I often find myself absorbed in a creative project." },
  { id: 23, dimension: "O", keyed: "+", text: "I enjoy reading or thinking about the future of humanity." },
  { id: 24, dimension: "O", keyed: "-", text: "I tend to prefer what is proven and established over what is novel." },
  { id: 25, dimension: "O", keyed: "+", text: "My curiosity frequently leads me down unexpected paths of learning." },
  { id: 26, dimension: "O", keyed: "+", text: "I appreciate when someone shows me a completely different way of seeing something." },
  { id: 27, dimension: "O", keyed: "-", text: "I rarely seek out new music, art, or literature." },
  { id: 28, dimension: "O", keyed: "+", text: "I enjoy deep conversations about meaning, existence, and consciousness." },
  { id: 29, dimension: "O", keyed: "+", text: "I find myself drawn to complexity and ambiguity rather than simple answers." },
  { id: 30, dimension: "O", keyed: "-", text: "I prefer not to dwell on abstract or philosophical ideas." },

  // ── CONSCIENTIOUSNESS (C) ─────────────────────────────────────────────────
  { id: 31, dimension: "C", keyed: "+", text: "I always complete my tasks before allowing myself to relax." },
  { id: 32, dimension: "C", keyed: "+", text: "I keep my personal space organized and tidy." },
  { id: 33, dimension: "C", keyed: "-", text: "I often leave things to the last minute." },
  { id: 34, dimension: "C", keyed: "+", text: "I follow through on my commitments, even when it is inconvenient." },
  { id: 35, dimension: "C", keyed: "+", text: "I pay close attention to detail in work that matters to me." },
  { id: 36, dimension: "C", keyed: "-", text: "I sometimes start projects without fully thinking them through." },
  { id: 37, dimension: "C", keyed: "+", text: "I set clear goals and make a systematic effort to reach them." },
  { id: 38, dimension: "C", keyed: "+", text: "I am reliable — people can count on me to do what I say." },
  { id: 39, dimension: "C", keyed: "-", text: "I find it hard to stick to routines or schedules for long." },
  { id: 40, dimension: "C", keyed: "+", text: "I take my responsibilities seriously, even small ones." },
  { id: 41, dimension: "C", keyed: "+", text: "I prepare thoroughly before undertaking something important." },
  { id: 42, dimension: "C", keyed: "-", text: "I tend to act impulsively rather than thinking things through." },
  { id: 43, dimension: "C", keyed: "+", text: "I handle tasks efficiently without letting them pile up." },
  { id: 44, dimension: "C", keyed: "+", text: "I like having a clear plan before I start working on something." },
  { id: 45, dimension: "C", keyed: "-", text: "I often forget to put things back where they belong." },
  { id: 46, dimension: "C", keyed: "+", text: "I work hard even when the results will not be immediately visible." },
  { id: 47, dimension: "C", keyed: "+", text: "I am disciplined about managing my time well." },
  { id: 48, dimension: "C", keyed: "-", text: "I can be careless when I'm not especially interested in something." },
  { id: 49, dimension: "C", keyed: "+", text: "I double-check my work to make sure it meets a high standard." },
  { id: 50, dimension: "C", keyed: "+", text: "I approach long-term projects with persistence and patience." },
  { id: 51, dimension: "C", keyed: "-", text: "I find it hard to motivate myself when a task feels tedious." },
  { id: 52, dimension: "C", keyed: "+", text: "I maintain the same level of care and attention regardless of who is watching." },
  { id: 53, dimension: "C", keyed: "+", text: "I prioritize the most important tasks rather than whatever feels easiest." },
  { id: 54, dimension: "C", keyed: "-", text: "My living or working space often becomes disorganized." },
  { id: 55, dimension: "C", keyed: "+", text: "I consistently deliver what I promise, on time." },
  { id: 56, dimension: "C", keyed: "+", text: "I keep track of my commitments using lists or schedules." },
  { id: 57, dimension: "C", keyed: "-", text: "I sometimes act without thinking about the consequences." },
  { id: 58, dimension: "C", keyed: "+", text: "I take a methodical approach to solving complex problems." },
  { id: 59, dimension: "C", keyed: "+", text: "I am careful and thorough when learning something new." },
  { id: 60, dimension: "C", keyed: "-", text: "I sometimes lose focus and leave tasks unfinished." },

  // ── ENERGY / EXTRAVERSION (E) ─────────────────────────────────────────────
  { id: 61, dimension: "E", keyed: "+", text: "I feel energized after spending time in a lively social setting." },
  { id: 62, dimension: "E", keyed: "+", text: "I enjoy meeting strangers and striking up conversations." },
  { id: 63, dimension: "E", keyed: "-", text: "I need significant alone time to recover after social events." },
  { id: 64, dimension: "E", keyed: "+", text: "I am usually the first to introduce myself in a new group." },
  { id: 65, dimension: "E", keyed: "+", text: "I enjoy being the center of attention in social situations." },
  { id: 66, dimension: "E", keyed: "-", text: "I prefer small gatherings to large, loud parties." },
  { id: 67, dimension: "E", keyed: "+", text: "I talk to a lot of different people at social events." },
  { id: 68, dimension: "E", keyed: "+", text: "I feel comfortable speaking up in a group discussion." },
  { id: 69, dimension: "E", keyed: "-", text: "I often find myself preferring solitary activities." },
  { id: 70, dimension: "E", keyed: "+", text: "I find social interaction stimulating rather than draining." },
  { id: 71, dimension: "E", keyed: "+", text: "I tend to think out loud — talking helps me process ideas." },
  { id: 72, dimension: "E", keyed: "-", text: "I prefer to observe a new group before participating." },
  { id: 73, dimension: "E", keyed: "+", text: "I actively seek out social events and gatherings." },
  { id: 74, dimension: "E", keyed: "+", text: "I feel restless when I spend too much time alone." },
  { id: 75, dimension: "E", keyed: "-", text: "I find prolonged socializing exhausting, even when I enjoy it." },
  { id: 76, dimension: "E", keyed: "+", text: "I am generally cheerful and optimistic in social settings." },
  { id: 77, dimension: "E", keyed: "+", text: "I enjoy collaborative work more than solo projects." },
  { id: 78, dimension: "E", keyed: "-", text: "I feel most creative and productive when working alone." },
  { id: 79, dimension: "E", keyed: "+", text: "I am comfortable with a fast-paced, socially active lifestyle." },
  { id: 80, dimension: "E", keyed: "+", text: "I readily share my thoughts and feelings with others." },
  { id: 81, dimension: "E", keyed: "-", text: "I am a private person and prefer to keep to myself." },
  { id: 82, dimension: "E", keyed: "+", text: "I am enthusiastic and tend to bring energy to the groups I am in." },
  { id: 83, dimension: "E", keyed: "+", text: "I enjoy group activities and team-based challenges." },
  { id: 84, dimension: "E", keyed: "-", text: "After a busy social day, I need quiet time to decompress." },
  { id: 85, dimension: "E", keyed: "+", text: "I find it easy to make new friends." },
  { id: 86, dimension: "E", keyed: "+", text: "I am talkative and expressive in conversation." },
  { id: 87, dimension: "E", keyed: "-", text: "I often feel awkward in large group settings." },
  { id: 88, dimension: "E", keyed: "+", text: "I love spontaneous social plans and last-minute gatherings." },
  { id: 89, dimension: "E", keyed: "+", text: "I feel alive in a crowd — energy from others fuels me." },
  { id: 90, dimension: "E", keyed: "-", text: "I find it more natural to listen than to speak in groups." },

  // ── WARMTH / AGREEABLENESS (A) ────────────────────────────────────────────
  { id: 91,  dimension: "A", keyed: "+", text: "I genuinely care about the well-being of people around me." },
  { id: 92,  dimension: "A", keyed: "+", text: "I find it easy to empathize with others, even strangers." },
  { id: 93,  dimension: "A", keyed: "-", text: "I tend to be critical of others when they make mistakes." },
  { id: 94,  dimension: "A", keyed: "+", text: "I go out of my way to help people, even when it is inconvenient." },
  { id: 95,  dimension: "A", keyed: "+", text: "I believe most people have good intentions." },
  { id: 96,  dimension: "A", keyed: "-", text: "I can be blunt in a way that sometimes hurts others' feelings." },
  { id: 97,  dimension: "A", keyed: "+", text: "I try to see things from others' perspectives before forming an opinion." },
  { id: 98,  dimension: "A", keyed: "+", text: "I prefer harmony over conflict in relationships." },
  { id: 99,  dimension: "A", keyed: "-", text: "I tend to compete rather than cooperate." },
  { id: 100, dimension: "A", keyed: "+", text: "I feel uncomfortable when there is tension between people I know." },
  { id: 101, dimension: "A", keyed: "+", text: "I am patient with people who think or move more slowly than I do." },
  { id: 102, dimension: "A", keyed: "-", text: "I can be stubborn and resistant when others push back on my ideas." },
  { id: 103, dimension: "A", keyed: "+", text: "I notice when someone is struggling, even if they do not say so." },
  { id: 104, dimension: "A", keyed: "+", text: "I am forgiving — I do not hold onto grudges for long." },
  { id: 105, dimension: "A", keyed: "-", text: "I prioritize logic over how others feel when making decisions." },
  { id: 106, dimension: "A", keyed: "+", text: "I actively listen when someone shares a problem with me." },
  { id: 107, dimension: "A", keyed: "+", text: "I am warm and welcoming toward people I have just met." },
  { id: 108, dimension: "A", keyed: "-", text: "I sometimes come across as cold or indifferent to others' feelings." },
  { id: 109, dimension: "A", keyed: "+", text: "I try to be tactful and considerate in how I give feedback." },
  { id: 110, dimension: "A", keyed: "+", text: "I feel genuine satisfaction when I help someone through a hard time." },
  { id: 111, dimension: "A", keyed: "-", text: "I can be quite demanding and uncompromising with others." },
  { id: 112, dimension: "A", keyed: "+", text: "I trust people until they give me a reason not to." },
  { id: 113, dimension: "A", keyed: "+", text: "I naturally take on a supportive role in group settings." },
  { id: 114, dimension: "A", keyed: "-", text: "I find it difficult to be sympathetic when someone complains." },
  { id: 115, dimension: "A", keyed: "+", text: "I make a conscious effort to include people who seem left out." },
  { id: 116, dimension: "A", keyed: "+", text: "People often come to me for emotional support." },
  { id: 117, dimension: "A", keyed: "-", text: "I place my own needs clearly above others' most of the time." },
  { id: 118, dimension: "A", keyed: "+", text: "I soften my opinions when I sense someone might be hurt by them." },
  { id: 119, dimension: "A", keyed: "+", text: "I give people the benefit of the doubt in ambiguous situations." },
  { id: 120, dimension: "A", keyed: "-", text: "I can be argumentative when I believe I am right." },

  // ── EMOTIONAL STABILITY (N, reversed: high N = low stability) ─────────────
  { id: 121, dimension: "N", keyed: "-", text: "I remain calm in situations that most people would find stressful." },
  { id: 122, dimension: "N", keyed: "+", text: "I sometimes feel overwhelmed by minor setbacks." },
  { id: 123, dimension: "N", keyed: "-", text: "I recover quickly after something disappointing happens." },
  { id: 124, dimension: "N", keyed: "+", text: "I tend to worry about things that may never happen." },
  { id: 125, dimension: "N", keyed: "-", text: "My mood is generally stable and predictable." },
  { id: 126, dimension: "N", keyed: "+", text: "I find it hard to stop thinking about things that have gone wrong." },
  { id: 127, dimension: "N", keyed: "-", text: "I rarely feel anxious without a clear reason." },
  { id: 128, dimension: "N", keyed: "+", text: "I can get frustrated easily when things do not go as planned." },
  { id: 129, dimension: "N", keyed: "-", text: "I cope well with pressure and uncertainty." },
  { id: 130, dimension: "N", keyed: "+", text: "Negative emotions tend to linger with me longer than they should." },
  { id: 131, dimension: "N", keyed: "-", text: "I rarely let criticism affect my confidence for long." },
  { id: 132, dimension: "N", keyed: "+", text: "I sometimes feel like things are slipping out of my control." },
  { id: 133, dimension: "N", keyed: "-", text: "I can set worries aside and focus on what needs to be done." },
  { id: 134, dimension: "N", keyed: "+", text: "I feel anxious in social situations where I might be judged." },
  { id: 135, dimension: "N", keyed: "-", text: "I tend to stay composed even under significant pressure." },
  { id: 136, dimension: "N", keyed: "+", text: "Small frustrations can quickly put me in a bad mood." },
  { id: 137, dimension: "N", keyed: "-", text: "I am generally satisfied with who I am." },
  { id: 138, dimension: "N", keyed: "+", text: "I often feel like I am not good enough, even when things are going well." },
  { id: 139, dimension: "N", keyed: "-", text: "I can approach difficult situations without becoming emotionally overwhelmed." },
  { id: 140, dimension: "N", keyed: "+", text: "I tend to be hard on myself when I make mistakes." },
  { id: 141, dimension: "N", keyed: "-", text: "I feel secure in my sense of self and my decisions." },
  { id: 142, dimension: "N", keyed: "+", text: "I sometimes feel a vague sense of dread without knowing why." },
  { id: 143, dimension: "N", keyed: "-", text: "I handle change and unpredictability with relative ease." },
  { id: 144, dimension: "N", keyed: "+", text: "I am quick to feel irritated when others slow me down." },
  { id: 145, dimension: "N", keyed: "-", text: "I feel emotionally resilient when facing challenges." },
  { id: 146, dimension: "N", keyed: "+", text: "I can spiral into negative thinking when things go wrong." },
  { id: 147, dimension: "N", keyed: "-", text: "I rarely let my emotions cloud my judgment." },
  { id: 148, dimension: "N", keyed: "+", text: "I can become self-conscious in situations where I feel evaluated." },
  { id: 149, dimension: "N", keyed: "-", text: "I bounce back quickly from disappointment or failure." },
  { id: 150, dimension: "N", keyed: "+", text: "I am sensitive to criticism, even when it is constructive." },
];

/** Total items available per dimension */
export const ITEMS_PER_DIMENSION = 30;

export type TestLength = 30 | 50 | 150;

export const TEST_LENGTH_CONFIG: Record<
  TestLength,
  {
    label: string;
    sublabel: string;
    duration: string;
    itemsPerDimension: number;
    questionsPerPage: number;
    recommended?: boolean;
  }
> = {
  30: {
    label: "Quick",
    sublabel: "10 pages — just enough to get started",
    duration: "~2 min",
    itemsPerDimension: 6,
    questionsPerPage: 3,
  },
  50: {
    label: "Standard",
    sublabel: "17 pages — best accuracy / time balance",
    duration: "~5 min",
    itemsPerDimension: 10,
    questionsPerPage: 3,
    recommended: true,
  },
  150: {
    label: "Deep",
    sublabel: "50 pages — for a match that improves with every retake",
    duration: "~15 min",
    itemsPerDimension: 30,
    questionsPerPage: 3,
  },
};

/**
 * Build an interleaved question list for a given test length.
 * Cycles O → C → E → A → N, drawing evenly from each dimension.
 */
export function buildQuestionList(length: TestLength): IpipQuestion[] {
  const { itemsPerDimension } = TEST_LENGTH_CONFIG[length];
  const dimensions: Dimension[] = ["O", "C", "E", "A", "N"];
  const pools: Record<Dimension, IpipQuestion[]> = {
    O: IPIP_QUESTIONS.filter((q) => q.dimension === "O").slice(0, itemsPerDimension),
    C: IPIP_QUESTIONS.filter((q) => q.dimension === "C").slice(0, itemsPerDimension),
    E: IPIP_QUESTIONS.filter((q) => q.dimension === "E").slice(0, itemsPerDimension),
    A: IPIP_QUESTIONS.filter((q) => q.dimension === "A").slice(0, itemsPerDimension),
    N: IPIP_QUESTIONS.filter((q) => q.dimension === "N").slice(0, itemsPerDimension),
  };

  const result: IpipQuestion[] = [];
  for (let i = 0; i < itemsPerDimension; i++) {
    for (const dim of dimensions) {
      result.push(pools[dim][i]);
    }
  }
  return result;
}
