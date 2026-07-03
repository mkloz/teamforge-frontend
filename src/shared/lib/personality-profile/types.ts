import type { OceanTraitKey } from "@/shared/types/psychometrics";

export type TraitDirection = "high" | "low";

export interface TraitSignal {
  trait: OceanTraitKey;
  direction: TraitDirection;
  score: number;
  strength: number;
}

export interface SignalPair {
  first: TraitSignal;
  second: TraitSignal;
  key: string;
  strength: number;
}

export interface TraitCopy {
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
