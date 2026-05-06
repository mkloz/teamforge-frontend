import { useState } from "react";

import type {
  DimensionScore,
  OceanScores,
} from "@/features/profile/lib/profile-contract";
import type { OceanTraitKey } from "@/shared/types/psychometrics";

import { TraitMapSection } from "./trait-map-section";
import { TypeDimensionsSection } from "./type-dimensions-section";

interface PsychometricsSidebarProps {
  oceanScores: OceanScores | null;
  dimensionScores: DimensionScore[] | null;
}

export function PsychometricsSidebar({
  oceanScores,
  dimensionScores,
}: PsychometricsSidebarProps) {
  const [selectedTrait, setSelectedTrait] = useState<OceanTraitKey | null>(
    null,
  );

  return (
    <div className="grid w-full gap-8 md:grid-cols-2 lg:sticky lg:top-4 lg:flex lg:flex-col lg:gap-10">
      <TraitMapSection
        oceanScores={oceanScores}
        selectedTrait={selectedTrait}
        onTraitSelect={setSelectedTrait}
      />
      <TypeDimensionsSection dimensionScores={dimensionScores} />
    </div>
  );
}
