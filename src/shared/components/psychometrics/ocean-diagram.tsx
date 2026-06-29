// react-doctor-disable-next-line react-doctor/prefer-dynamic-import -- This diagram module is itself loaded through React.lazy from ocean-chart.tsx, so Recharts stays in the async chart chunk.
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";

import {
  getOceanChartData,
  getOceanTraitByLabel,
} from "@/shared/components/psychometrics/ocean-chart-model";
import { useElementSize } from "@/shared/hooks/use-element-size";
import { cn } from "@/shared/lib/utils";
import { ChartDot, ChartTick } from "./ocean-chart-points";
import type {
  ChartDotProps,
  ChartTickProps,
  OceanDiagramProps,
} from "./psychometrics-types";

export function OceanDiagram({
  className,
  scores,
  onTraitSelect,
  selectedTrait,
  interactive = true,
}: OceanDiagramProps) {
  const { elementRef, hasSize, size } = useElementSize<HTMLDivElement>();

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
        "size-full min-h-56 [&_*:focus]:outline-none [&_svg:focus]:outline-none [&_svg]:outline-none",
        className,
      )}
    >
      {hasSize ? (
        <RadarChart
          data={chartData}
          width={size.width}
          height={size.height}
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
      ) : null}
    </div>
  );
}
