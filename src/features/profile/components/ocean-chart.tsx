import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { OCEAN_TRAITS, getExtendedTraitInfo } from "../lib/ocean-traits";
import type { OceanScores, OceanTraitKey } from "../types/profile.types";

interface OceanChartProps {
  scores: OceanScores;
  onTraitSelect?: (key: OceanTraitKey | null) => void;
  selectedTrait?: OceanTraitKey | null;
}

interface ChartDotProps {
  cx?: number | string;
  cy?: number | string;
  payload?: { trait?: string; value?: string | number };
}

interface ChartTickProps {
  x?: number | string;
  y?: number | string;
  cx?: number | string;
  cy?: number | string;
  payload?: { trait?: string; value?: string };
}

export function OceanChart({
  scores,
  onTraitSelect,
  selectedTrait,
}: OceanChartProps) {
  const [internalSelected, setInternalSelected] =
    useState<OceanTraitKey | null>(null);

  const selected =
    selectedTrait !== undefined ? selectedTrait : internalSelected;
  const setSelected = onTraitSelect || setInternalSelected;

  // Transform scores to chart data format
  const chartData = OCEAN_TRAITS.map((trait) => ({
    trait: trait.label,
    key: trait.key,
    value: scores[trait.key],
    fullMark: 100,
  }));

  // Solid colors for Recharts (CSS vars used as standard fallback)
  const primaryColor = "var(--primary)";
  const primaryColorFill = "var(--secondary)";
  const gridColor = "var(--border)";

  // Handle trait click
  const handleTraitClick = (label: string) => {
    const trait = OCEAN_TRAITS.find((t) => t.label === label);
    if (trait) {
      setSelected(selected === trait.key ? null : trait.key);
    }
  };

  // Custom dot renderer for clickable data points
  const renderDot = (props: ChartDotProps) => {
    const { cx, cy, payload } = props;
    if (cx === undefined || cy === undefined || !payload?.trait) return null;

    const trait = OCEAN_TRAITS.find((t) => t.label === payload.trait);
    const isSelected = trait && selected === trait.key;

    const numCx = Number(cx);
    const numCy = Number(cy);

    return (
      <g
        key={`dotgroup-${payload.trait}`}
        className="cursor-pointer outline-none"
        style={{ cursor: "pointer", pointerEvents: "all" }}
        onClick={(e) => {
          e.stopPropagation();
          handleTraitClick(payload.trait!);
        }}
      >
        <circle
          cx={numCx}
          cy={numCy}
          r={isSelected ? 7 : 5}
          fill="var(--primary)"
          stroke="var(--card)"
          strokeWidth={2}
          className="transition-all duration-200"
        />
        <circle
          cx={numCx}
          cy={numCy}
          r={32}
          fill="transparent"
          stroke="transparent"
        />
      </g>
    );
  };

  // Custom tick renderer for clickable labels
  const renderTick = (props: ChartTickProps) => {
    const { x, y, cx, cy, payload } = props;
    if (
      x === undefined ||
      y === undefined ||
      cx === undefined ||
      cy === undefined ||
      !payload?.value
    )
      return null;

    const numX = Number(x);
    const numY = Number(y);
    const numCx = Number(cx);
    const numCy = Number(cy);

    const dx = numX - numCx;
    const dy = numY - numCy;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const pushOutOffset = 18;

    const newX =
      distance > 0
        ? numCx + (dx / distance) * (distance + pushOutOffset)
        : numX;
    const newY =
      distance > 0
        ? numCy + (dy / distance) * (distance + pushOutOffset)
        : numY;

    const trait = OCEAN_TRAITS.find((t) => t.label === payload.value);
    const isSelected = trait && selected === trait.key;
    const score = trait ? scores[trait.key] : 0;

    return (
      <g
        className="cursor-pointer outline-none"
        onClick={(e) => {
          e.stopPropagation();
          handleTraitClick(payload.value!);
        }}
        style={{ cursor: "pointer", pointerEvents: "all" }}
      >
        <rect
          x={newX - 45}
          y={newY - 20}
          width={90}
          height={40}
          fill="transparent"
        />
        <text
          x={newX}
          y={newY}
          textAnchor="middle"
          dominantBaseline="middle"
          className={cn(
            "text-[11px] font-medium transition-colors select-none outline-none",
            isSelected ? "fill-primary" : "fill-muted-foreground",
          )}
          style={{
            fill: isSelected ? primaryColor : "var(--muted-foreground)",
            fontWeight: isSelected ? 600 : 500,
          }}
        >
          {payload.value}
        </text>
        {isSelected && (
          <text
            x={newX}
            y={newY + 14}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-[10px] font-bold select-none outline-none"
            style={{ fill: primaryColor }}
          >
            {score}%
          </text>
        )}
      </g>
    );
  };

  const selectedInfo = selected
    ? getExtendedTraitInfo(selected, scores[selected])
    : null;

  return (
    <div className="space-y-3">
      {/* Chart */}
      <div className="w-full max-w-80 mx-auto aspect-square [&_svg]:outline-none [&_svg:focus]:outline-none [&_*:focus]:outline-none">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart
            data={chartData}
            margin={{ top: 32, right: 40, bottom: 32, left: 40 }}
          >
            <PolarGrid stroke={gridColor} strokeWidth={1} gridType="polygon" />

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
              dot={renderDot}
              isAnimationActive={false}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="border-t-2 -mt-4"></div>
      {/* Tap hint or selected trait detail */}
      {!selected ? (
        <p className="text-center text-xs text-muted-foreground">
          Tap any trait to learn more
        </p>
      ) : (
        selectedInfo && (
          <div className="text-popover-foreground space-y-3 animate-fade-up">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="font-semibold text-foreground">
                  {selectedInfo.label}
                </h5>
                <span className="text-xs text-muted-foreground">
                  {selectedInfo.level} ({selectedInfo.score}%)
                </span>
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
                <span className="font-medium text-foreground">
                  In activities:
                </span>{" "}
                {selectedInfo.inActivities}
              </p>
            </div>
          </div>
        )
      )}
    </div>
  );
}
