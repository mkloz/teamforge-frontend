export const LANDING_SECTION_IDS = {
  hero: "hero",
  howItWorks: "how-it-works",
  algorithm: "algorithm",
  about: "about",
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
  { id: LANDING_SECTION_IDS.howItWorks, label: "How It Works" },
  { id: LANDING_SECTION_IDS.algorithm, label: "The Algorithm" },
  { id: LANDING_SECTION_IDS.about, label: "About" },
  { id: LANDING_SECTION_IDS.cta, label: "Get Started" },
] as const satisfies readonly LandingSectionLink[];

export const LANDING_NAV_LINKS = LANDING_SECTIONS.filter(
  (section) => section.id !== LANDING_SECTION_IDS.cta,
);
