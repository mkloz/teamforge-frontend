import type { PersonalityType } from "@/shared/schemas/enums";

export interface PersonalityInfo {
  letters: string;
  name: string;
  tagline: string;
  about: string;
  inGroups: string;
}

export const PERSONALITY_INFO_BY_TYPE: Record<
  PersonalityType,
  PersonalityInfo
> = {
  INTJ: {
    letters: "INTJ",
    name: "The Architect",
    tagline: "Independent, strategic, and focused on long-term plans.",
    about:
      "You tend to look for systems and patterns. You often prefer to understand a problem's structure, work independently, and decide against your own standards.",
    inGroups:
      "In a group, you may prefer to think ahead, clarify the plan, and take initiative when the next step is unclear. You tend to work best with room to act independently.",
  },
  INTP: {
    letters: "INTP",
    name: "The Thinker",
    tagline: "Curious, analytical, and interested in how ideas fit together.",
    about:
      "You tend to question assumptions, build mental models, and explore several explanations before settling on one. You often value accuracy and intellectual honesty.",
    inGroups:
      "In a group, you may ask questions that test the plan and spot gaps before action starts. You tend to prefer groups that make room for detailed discussion.",
  },
  ENTJ: {
    letters: "ENTJ",
    name: "The Commander",
    tagline: "Direct, organized, and comfortable leading toward a goal.",
    about:
      "You tend to notice what needs organizing and feel comfortable making decisions. Clear roles, high standards, and forward movement often matter to you.",
    inGroups:
      "In a group, you may push for decisions, redirect a drifting conversation, and help clarify the next step. You may take the lead even without a formal role.",
  },
  ENTP: {
    letters: "ENTP",
    name: "The Debater",
    tagline: "Idea-driven, quick to question assumptions, and open to debate.",
    about:
      "You may enjoy testing ideas through debate and looking at problems from several angles. Novelty and open-ended questions often hold your attention.",
    inGroups:
      "In a group, you may challenge a plan before action starts. This can uncover gaps, though the timing may frustrate people who are ready to proceed.",
  },
  INFJ: {
    letters: "INFJ",
    name: "The Advocate",
    tagline: "Reflective, values-led, and attentive to other people.",
    about:
      "You tend to look beneath the surface of situations and care about work that feels purposeful. You may prefer to contribute quietly, especially when you can combine empathy with a clear direction.",
    inGroups:
      "In a group, you may notice emotional undercurrents and ask whether the plan aligns with shared values. You often prefer work that has a clear purpose.",
  },
  INFP: {
    letters: "INFP",
    name: "The Idealist",
    tagline: "Values-led, imaginative, and attentive to sincerity.",
    about:
      "You tend to be guided by personal values and spend time imagining how things could be different. Being sincere matters to you, and you often notice when words and actions do not line up.",
    inGroups:
      "In a group, you may notice when a plan conflicts with shared values and offer a different idea. You may prefer time to reflect before deciding.",
  },
  ENFJ: {
    letters: "ENFJ",
    name: "The Protagonist",
    tagline: "People-focused, encouraging, and comfortable guiding a group.",
    about:
      "You tend to notice other people's strengths and the emotional tone of a room. You may enjoy helping people contribute and move toward a shared goal.",
    inGroups:
      "In a group, you may draw quieter people into the discussion, name shared concerns, and help different views move toward a decision.",
  },
  ENFP: {
    letters: "ENFP",
    name: "The Campaigner",
    tagline: "Enthusiastic, imaginative, and interested in new possibilities.",
    about:
      "You tend to connect ideas quickly and respond well to novelty. You may enjoy meeting new people and exploring possibilities before choosing one direction.",
    inGroups:
      "In a group, you may bring new ideas, connect different viewpoints, and encourage people to get started. You tend to prefer groups with room to change direction.",
  },
  ISTJ: {
    letters: "ISTJ",
    name: "The Inspector",
    tagline: "Methodical, dependable, and attentive to agreed details.",
    about:
      "You tend to value clear expectations, consistent follow-through, and practical detail. You may prefer proven methods and defined responsibilities.",
    inGroups:
      "In a group, you may track decisions, follow up on agreed tasks, and notice details that could otherwise be missed.",
  },
  ISFJ: {
    letters: "ISFJ",
    name: "The Defender",
    tagline: "Attentive, considerate, and practical in how they help.",
    about:
      "You tend to notice changes in mood, overlooked details, and practical needs. You often show care through consistent actions.",
    inGroups:
      "In a group, you may handle overlooked logistics, check in with quieter members, and help create a calm setting.",
  },
  ESTJ: {
    letters: "ESTJ",
    name: "The Executive",
    tagline: "Organized, decisive, and focused on carrying out the plan.",
    about:
      "You tend to prefer clear roles, direct decisions, and practical action. Ambiguity may be frustrating when a plan could be clarified.",
    inGroups:
      "In a group, you may clarify responsibilities, set timelines, and keep attention on the goal. You often expect people to follow through.",
  },
  ESFJ: {
    letters: "ESFJ",
    name: "The Consul",
    tagline: "Sociable, considerate, and attentive to group needs.",
    about:
      "You tend to pay attention to the needs and feelings of people around you. You may enjoy creating a setting where people feel included.",
    inGroups:
      "In a group, you may make introductions, notice tension, and help people take part in the conversation.",
  },
  ISTP: {
    letters: "ISTP",
    name: "The Craftsman",
    tagline: "Practical, observant, and interested in how things work.",
    about:
      "You may learn best through hands-on work and prefer practical solutions. You often value action and visible results over long discussion.",
    inGroups:
      "In a group, you may move quickly toward a hands-on solution while others are still discussing options. You tend to value practical competence.",
  },
  ISFP: {
    letters: "ISFP",
    name: "The Artist",
    tagline: "Observant, flexible, and attentive to the immediate setting.",
    about:
      "You may notice sensory details and changes in atmosphere that others overlook. You often value sincerity and room to respond in the moment.",
    inGroups:
      "In a group, you may contribute quietly, notice practical details, and encourage others to pay attention to the immediate experience.",
  },
  ESTP: {
    letters: "ESTP",
    name: "The Entrepreneur",
    tagline: "Direct, observant, and comfortable acting in the moment.",
    about:
      "You tend to act quickly, respond to the room, and solve problems in real time. Fast-moving situations may hold your attention.",
    inGroups:
      "In a group, you may push for action, notice immediate opportunities, and help move a stalled plan forward.",
  },
  ESFP: {
    letters: "ESFP",
    name: "The Entertainer",
    tagline: "Spontaneous, expressive, and attentive to the people present.",
    about:
      "You tend to bring energy to shared experiences and pay attention to how others are feeling. You often help people settle in by staying present and expressive.",
    inGroups:
      "In a group, you may bring energy, ease early tension, and notice when someone needs a way into the conversation.",
  },
};

export const OCEAN_DIMENSION_LABELS = {
  O: { label: "Openness", lowLabel: "Practical", highLabel: "Curious" },
  C: { label: "Organization", lowLabel: "Flexible", highLabel: "Disciplined" },
  E: { label: "Energy", lowLabel: "Reserved", highLabel: "Outgoing" },
  A: { label: "Warmth", lowLabel: "Direct", highLabel: "Empathic" },
  N: { label: "Stability", lowLabel: "Sensitive", highLabel: "Steady" },
} as const;
