import type { OceanTraitKey } from "@/shared/types/psychometrics";

export type ShowUpDirection = "balanced" | "high" | "low";

export interface ShowUpSignal {
  key: string;
  label: string;
  value: number | null;
  level: string;
  description: string;
  source: "ocean";
  confidence: number;
}

export interface OceanSignalCopy {
  label: string;
  highLabel: string;
  lowLabel: string;
  balancedLabel: string;
  highDescription: string;
  lowDescription: string;
  balancedDescription: string;
}

export interface RankedOceanSignal {
  key: OceanTraitKey;
  score: number;
  strength: number;
  direction: ShowUpDirection;
  confidence: number;
}
