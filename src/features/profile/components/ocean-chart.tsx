import { useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/shared/lib/utils";
import type { OceanScores, OceanTraitKey } from "../types/profile.types";
import { OCEAN_TRAITS, getExtendedTraitInfo, getTraitLevel } from "../lib/ocean-traits";

interface OceanChartProps {
  scores: OceanScores;
  onTraitSelect?: (key: OceanTraitKey | null) => void;
  selectedTrait?: OceanTraitKey | null;
}

export function OceanChart({ scores, onTraitSelect, selectedTrait }: OceanChartProps) {
  const [internalSelected, setInternalSelected] = useState<OceanTraitKey | null>(null);
  
  const selected = selectedTrait !== undefined ? selectedTrait : internalSelected;
  const setSelected = onTraitSelect || setInternalSelected;

  // Transform scores to chart data format
  const chartData = OCEAN_TRAITS.map((trait) => ({
    trait: trait.label,
    key: trait.key,
    value: scores[trait.key],
    fullMark: 100,
  }));

  // Solid colors for Recharts (CSS vars don't work)
  const primaryColor = "#0d9488"; // teal-600
  const primaryColorFill = "rgba(13, 148, 136, 0.25)";
  const gridColor = "#d1d5db"; // gray-300

  // Handle trait click
  const handleTraitClick = (label: string) => {
    const trait = OCEAN_TRAITS.find(t => t.label === label);
    if (trait) {
      setSelected(selected === trait.key ? null : trait.key);
    }
  };

  // Custom tick renderer for clickable labels
  const renderTick = (props: { x: number; y: number; payload: { value: string } }) => {
    const { x, y, payload } = props;
    const trait = OCEAN_TRAITS.find(t => t.label === payload.value);
    const isSelected = trait && selected === trait.key;
    const score = trait ? scores[trait.key] : 0;
    
    return (
      <g 
        className="cursor-pointer" 
        onClick={() => handleTraitClick(payload.value)}
      >
        <text
          x={x}
          y={y}
          textAnchor="middle"
          dominantBaseline="middle"
          className={cn(
            "text-[11px] font-medium transition-colors select-none",
            isSelected ? "fill-primary" : "fill-muted-foreground"
          )}
          style={{ 
            fill: isSelected ? primaryColor : "#6b7280",
            fontWeight: isSelected ? 600 : 500,
          }}
        >
          {payload.value}
        </text>
        {isSelected && (
          <text
            x={x}
            y={y + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] font-bold"
            style={{ fill: primaryColor }}
          >
            {score}%
          </text>
        )}
      </g>
    );
  };

  const selectedInfo = selected ? getExtendedTraitInfo(selected, scores[selected]) : null;

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="w-full max-w-[300px] mx-auto aspect-square [&_svg]:outline-none [&_svg:focus]:outline-none [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 28, right: 36, bottom: 28, left: 36 }}
          >
            <PolarGrid 
              stroke={gridColor}
              strokeWidth={1}
              gridType="polygon"
            />
            
            <PolarAngleAxis
              dataKey="trait"
              tick={renderTick}
              tickLine={false}
            />
            
            <Radar
              name="Personality"
              dataKey="value"
              stroke={primaryColor}
              strokeWidth={2.5}
              fill={primaryColorFill}
              fillOpacity={1}
              dot={{
                r: 5,
                fill: primaryColor,
                stroke: "#fff",
                strokeWidth: 2,
              }}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Tap hint or selected trait detail */}
      {!selected ? (
        <p className="text-center text-xs text-muted-foreground">
          Tap any trait to learn more
        </p>
      ) : selectedInfo && (
        <div className="p-4 rounded-xl bg-muted/50 space-y-3 animate-fade-up">
          <div className="flex items-center justify-between">
            <div>
              <h5 className="font-semibold text-foreground">{selectedInfo.label}</h5>
              <span className="text-xs text-muted-foreground">{selectedInfo.level} ({selectedInfo.score}%)</span>
            </div>
            <button 
              onClick={() => setSelected(null)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Close
            </button>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {selectedInfo.description}
          </p>
          <div className="pt-2 border-t border-border space-y-2">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium text-foreground">In activities:</span> {selectedInfo.inActivities}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
