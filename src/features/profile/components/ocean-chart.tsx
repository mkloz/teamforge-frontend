import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
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

  // Solid colors for Recharts (CSS vars don't work)
  const primaryColor = "#0d9488"; // teal-600
  const primaryColorFill = "rgba(13, 148, 136, 0.2)";
  const gridColor = "#e5e7eb"; // gray-200

  return (
    <div className="w-full max-w-[300px] mx-auto aspect-square">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart
          data={chartData}
          margin={{ top: 24, right: 32, bottom: 24, left: 32 }}
          style={{ cursor: "default" }}
        >
          {/* Grid with visible web lines */}
          <PolarGrid 
            stroke={gridColor}
            strokeWidth={1}
            gridType="polygon"
          />
          
          {/* Trait labels around the chart */}
          <PolarAngleAxis
            dataKey="trait"
            tick={{ 
              fill: "#6b7280", // gray-500
              fontSize: 11,
              fontWeight: 500,
            }}
            tickLine={false}
          />
          
          {/* Data area - no interaction */}
          <Radar
            name="Personality"
            dataKey="value"
            stroke={primaryColor}
            strokeWidth={2.5}
            fill={primaryColorFill}
            fillOpacity={1}
            dot={{
              r: 4,
              fill: primaryColor,
              stroke: "#fff",
              strokeWidth: 2,
            }}
            // Disable hover/click effects
            isAnimationActive={false}
            activeDot={false}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
