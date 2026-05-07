import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

export interface OceanDiagramProps {
  className?: string;
  scores: OceanScores;
  onTraitSelect?: (key: OceanTraitKey | null) => void;
  selectedTrait?: OceanTraitKey | null;
  interactive?: boolean;
}

export interface OceanChartProps extends OceanDiagramProps {
  showDetails?: boolean;
}

export interface ChartDotProps {
  cx?: number | string;
  cy?: number | string;
  payload?: { trait?: string; value?: string | number };
  interactive?: boolean;
  selected?: OceanTraitKey | null;
  onTraitClick?: (label: string) => void;
}

export interface ChartTickProps {
  x?: number | string;
  y?: number | string;
  cx?: number | string;
  cy?: number | string;
  payload?: { trait?: string; value?: string };
  interactive?: boolean;
  selected?: OceanTraitKey | null;
  onTraitClick?: (label: string) => void;
  scores?: OceanScores;
}
