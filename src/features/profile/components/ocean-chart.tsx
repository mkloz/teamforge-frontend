import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { ChartContainer } from "@/shared/components/ui/chart";
import type { OceanScores } from "../types/profile.types";
import { OCEAN_TRAITS } from "../lib/ocean-traits";

interface OceanChartProps {
  scores: OceanScores;
}

export function OceanChart({ scores }: OceanChartProps) {
  // Transform scores to chart data format
  const chartData = OCEAN_TRAITS.map((trait) => ({
    trait: trait.label,
    value: scores[trait.key],
    fullMark: 100,
  }));

  // Compute the teal color for Recharts (CSS vars don't work directly)
  const primaryColor = "rgb(13, 148, 136)"; // teal-600
  const primaryColorFill = "rgba(13, 148, 136, 0.25)";

  return (
    <ChartContainer
      config={{
        value: {
          label: "Score",
          color: primaryColor,
        },
      }}
      className="aspect-square w-full max-w-[320px] mx-auto"
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
        >
          <PolarGrid 
            stroke="hsl(var(--border))"
            strokeOpacity={0.5}
          />
          <PolarAngleAxis
            dataKey="trait"
            tick={{ 
              fill: "hsl(var(--muted-foreground))",
              fontSize: 11,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ 
              fill: "hsl(var(--muted-foreground))",
              fontSize: 9,
            }}
            tickCount={5}
            axisLine={false}
          />
          <Radar
            name="Personality"
            dataKey="value"
            stroke={primaryColor}
            strokeWidth={2}
            fill={primaryColorFill}
            dot={{
              r: 4,
              fill: primaryColor,
              strokeWidth: 0,
            }}
            activeDot={{
              r: 6,
              fill: primaryColor,
              stroke: "white",
              strokeWidth: 2,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
}
