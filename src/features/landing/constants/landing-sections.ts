export const LANDING_SECTION_IDS = {
  hero: "hero",
  peopleProblem: "people-problem",
  planToGroup: "plan-to-group",
  whyDifferent: "why-different",
  groupFeelsRight: "group-feels-right",
  trustControl: "trust-control",
  cta: "cta",
} as const;

export type LandingSectionId =
  (typeof LANDING_SECTION_IDS)[keyof typeof LANDING_SECTION_IDS];

export interface LandingSectionLink {
  id: LandingSectionId;
  label: string;
}

export const LANDING_SECTIONS = [
  { id: LANDING_SECTION_IDS.hero, label: "Home" },
  { id: LANDING_SECTION_IDS.peopleProblem, label: "The Problem" },
  { id: LANDING_SECTION_IDS.planToGroup, label: "How It Works" },
  { id: LANDING_SECTION_IDS.whyDifferent, label: "Why Different" },
  { id: LANDING_SECTION_IDS.groupFeelsRight, label: "Why It Fits" },
  { id: LANDING_SECTION_IDS.trustControl, label: "Trust" },
  { id: LANDING_SECTION_IDS.cta, label: "Get Started" },
] as const satisfies readonly LandingSectionLink[];

export const LANDING_NAV_LINKS = LANDING_SECTIONS.filter(
  (section) => section.id !== LANDING_SECTION_IDS.cta,
);
