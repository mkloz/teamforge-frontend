export type LegalPageKind = "privacy" | "terms";

export interface LegalPageProps {
  kind: LegalPageKind;
}

export interface LegalSection {
  id: string;
  heading: string;
  body: string;
  bullets: string[];
}

export interface LegalPageCopy {
  eyebrow: string;
  title: string;
  summary: string;
  notice: string;
  updatedAt: string;
  sections: LegalSection[];
}
