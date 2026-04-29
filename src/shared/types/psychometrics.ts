export type DimensionKey = "EI" | "SN" | "TF" | "JP";

export interface DimensionScore {
  dimension: DimensionKey;
  score: number;
  letter: string;
  isBorderline: boolean;
}

export interface OceanScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export type OceanTraitKey = keyof OceanScores;

export interface OceanTraitMeta {
  key: OceanTraitKey;
  label: string;
  highDescription: string;
  lowDescription: string;
}
