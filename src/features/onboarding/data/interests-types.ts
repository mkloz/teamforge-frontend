export type InterestsScreen = "intro" | "browse" | "review";

export type MbtiType =
  | "INTJ"
  | "INTP"
  | "ENTJ"
  | "ENTP"
  | "INFJ"
  | "INFP"
  | "ENFJ"
  | "ENFP"
  | "ISTJ"
  | "ISFJ"
  | "ESTJ"
  | "ESFJ"
  | "ISTP"
  | "ISFP"
  | "ESTP"
  | "ESFP";

export interface LeafTag {
  id: string;
  label: string;
  /** Alternative names shown as tooltip and matched in search */
  aliases?: string[];
}

export interface Subcategory {
  id: string;
  label: string;
  emoji: string;
  tags: LeafTag[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
  /** Tailwind bg class for the accent dot */
  color: string;
  subcategories: Subcategory[];
}

export interface SearchResultTag {
  tag: LeafTag;
  categoryLabel: string;
  matchedAlias?: string;
}

export interface SearchResultSubcategory {
  sub: Subcategory;
  categoryLabel: string;
}

export interface SearchResults {
  tags: SearchResultTag[];
  subcategories: SearchResultSubcategory[];
}
