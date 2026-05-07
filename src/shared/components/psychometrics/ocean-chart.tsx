import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { useElementSize } from "@/shared/hooks/use-element-size";
import {
  getOceanChartData,
  getOceanTraitByLabel,
  getOceanTraitDetails,
} from "@/shared/components/psychometrics/ocean-chart-model";
import { ChartDot, ChartTick } from "./ocean-chart-points";
import { OceanTraitDetails } from "@/shared/components/psychometrics/ocean-trait-details";
import type {
  ChartDotProps,
  ChartTickProps,
  OceanChartProps,
  OceanDiagramProps,
} from "./psychometrics-types";
import type { OceanTraitKey } from "@/shared/types/psychometrics";

export function OceanDiagram({
  className,
  scores,
  onTraitSelect,
  selectedTrait,
  interactive = true,
}: OceanDiagramProps) {
  const { elementRef, hasSize } = useElementSize<HTMLDivElement>();

  const chartData = getOceanChartData(scores);

  const handleTraitClick = (label: string) => {
    if (!interactive || !onTraitSelect) return;

    const trait = getOceanTraitByLabel(label);
    if (trait) {
      onTraitSelect(selectedTrait === trait.key ? null : trait.key);
    }
  };

  return (
    <div
      ref={elementRef}
      className={cn(
        "h-full min-h-56 w-full [&_*:focus]:outline-none [&_svg]:outline-none [&_svg:focus]:outline-none",
        className,
      )}
    >
      {hasSize ? (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 25, right: 35, bottom: 25, left: 35 }}
          >
            <PolarGrid
              stroke="var(--border)"
              strokeWidth={1}
              gridType="polygon"
            />
            <PolarAngleAxis
              dataKey="trait"
              tick={(props: ChartTickProps) => (
                <ChartTick
                  {...props}
                  interactive={interactive}
                  selected={selectedTrait}
                  onTraitClick={handleTraitClick}
                  scores={scores}
                />
              )}
              tickLine={false}
            />
            <Radar
              name="Personality"
              dataKey="value"
              stroke="var(--primary)"
              strokeWidth={2.5}
              fill="var(--secondary)"
              fillOpacity={1}
              dot={(props: ChartDotProps) => (
                <ChartDot
                  {...props}
                  interactive={interactive}
                  selected={selectedTrait}
                  onTraitClick={handleTraitClick}
                />
              )}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

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
        <OceanDiagram
          scores={scores}
          selectedTrait={selected}
          onTraitSelect={setSelected}
          interactive={interactive}
        />
      </div>

      {showDetails && (
        <>
          <div className="-mt-2 border-t border-border/40" />
          <OceanTraitDetails
            selectedInfo={selectedInfo}
            onClear={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}
