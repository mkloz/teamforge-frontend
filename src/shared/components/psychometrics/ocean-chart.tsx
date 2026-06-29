import { lazy, Suspense, useState } from "react";
import { getOceanTraitDetails } from "@/shared/components/psychometrics/ocean-chart-model";
import { OceanTraitDetails } from "@/shared/components/psychometrics/ocean-trait-details";
import type { OceanTraitKey } from "@/shared/types/psychometrics";
import type { OceanChartProps } from "./psychometrics-types";

const OceanDiagram = lazy(() =>
  import("./ocean-diagram").then((module) => ({
    default: module.OceanDiagram,
  })),
);

export function OceanChart({
  scores,
  onTraitSelect,
  selectedTrait,
  interactive = true,
  showDetails = true,
}: OceanChartProps) {
  const [internalSelected, setInternalSelected] =
    useState<OceanTraitKey | null>(null);

  const selected =
    selectedTrait !== undefined ? selectedTrait : internalSelected;
  const setSelected = onTraitSelect || setInternalSelected;
  const selectedInfo = getOceanTraitDetails(selected, scores);

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mx-auto aspect-square w-full max-w-80">
        <Suspense fallback={<div className="size-full min-h-56" />}>
          <OceanDiagram
            scores={scores}
            selectedTrait={selected}
            onTraitSelect={setSelected}
            interactive={interactive}
          />
        </Suspense>
      </div>

      {showDetails && (
        <>
          <div className="-mt-2 border-border/40 border-t" />
          <OceanTraitDetails
            selectedInfo={selectedInfo}
            onClear={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}
