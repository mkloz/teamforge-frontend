import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import { OCEAN_TRAITS, getExtendedTraitInfo } from "@/shared/lib/ocean-traits";
import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";

interface OceanDiagramProps {
  scores: OceanScores;
  onTraitSelect?: (key: OceanTraitKey | null) => void;
  selectedTrait?: OceanTraitKey | null;
  interactive?: boolean;
}

interface OceanChartProps extends OceanDiagramProps {
  showDetails?: boolean;
}

interface ChartDotProps {
  cx?: number | string;
  cy?: number | string;
  payload?: { trait?: string; value?: string | number };
  interactive?: boolean;
  selected?: OceanTraitKey | null;
  onTraitClick?: (label: string) => void;
}

interface ChartTickProps {
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

export function OceanDiagram({
  scores,
  onTraitSelect,
  selectedTrait,
  interactive = true,
}: OceanDiagramProps) {
  const chartData = OCEAN_TRAITS.map((trait) => ({
    trait: trait.label,
    key: trait.key,
    value: scores[trait.key],
    fullMark: 100,
  }));

  const handleTraitClick = (label: string) => {
    if (!interactive || !onTraitSelect) return;

    const trait = OCEAN_TRAITS.find((item) => item.label === label);
    if (trait) {
      onTraitSelect(selectedTrait === trait.key ? null : trait.key);
    }
  };

  return (
    <div className="w-full h-full [&_svg]:outline-none [&_svg:focus]:outline-none [&_*:focus]:outline-none">
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
    </div>
  );
}

function ChartDot({
  cx,
  cy,
  payload,
  interactive,
  selected,
  onTraitClick,
}: ChartDotProps) {
  if (cx === undefined || cy === undefined || !payload?.trait) return null;

  const trait = OCEAN_TRAITS.find((item) => item.label === payload.trait);
  const isSelected = trait && selected === trait.key;

  return (
    <g
      key={`dotgroup-${payload.trait}`}
      className={cn(interactive ? "cursor-pointer" : "pointer-events-none")}
      onClick={interactive ? () => onTraitClick?.(payload.trait!) : undefined}
    >
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 7 : 5}
        fill="var(--primary)"
        stroke="var(--card)"
        strokeWidth={2}
        className="transition-all duration-200"
      />
      {interactive && (
        <circle
          cx={cx}
          cy={cy}
          r={32}
          fill="transparent"
          stroke="transparent"
        />
      )}
    </g>
  );
}

function ChartTick({
  x,
  y,
  cx,
  cy,
  payload,
  interactive,
  selected,
  onTraitClick,
  scores,
}: ChartTickProps) {
  if (
    x === undefined ||
    y === undefined ||
    cx === undefined ||
    cy === undefined ||
    !payload?.value
  ) {
    return null;
  }

  const numX = Number(x);
  const numY = Number(y);
  const numCx = Number(cx);
  const numCy = Number(cy);

  const dx = numX - numCx;
  const dy = numY - numCy;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const pushOutOffset = 18;

  const newX =
    distance > 0 ? numCx + (dx / distance) * (distance + pushOutOffset) : numX;
  const newY =
    distance > 0 ? numCy + (dy / distance) * (distance + pushOutOffset) : numY;

  const trait = OCEAN_TRAITS.find((item) => item.label === payload.value);
  const isSelected = trait && selected === trait.key;
  const score = trait && scores ? scores[trait.key] : 0;

  return (
    <g
      className={cn(interactive ? "cursor-pointer" : "pointer-events-none")}
      onClick={interactive ? () => onTraitClick?.(payload.value!) : undefined}
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
          "text-[10px] font-bold transition-colors select-none",
          isSelected ? "fill-primary" : "fill-slate-muted/80",
        )}
      >
        {payload.value}
      </text>
      {isSelected && (
        <text
          x={newX}
          y={newY + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="text-[10px] font-black fill-primary select-none mt-1"
        >
          {score}%
        </text>
      )}
    </g>
  );
}

export function OceanChart({
  scores,
  onTraitSelect,
  selectedTrait,
  showDetails = true,
}: OceanChartProps) {
  const [internalSelected, setInternalSelected] =
    useState<OceanTraitKey | null>(null);

  const selected =
    selectedTrait !== undefined ? selectedTrait : internalSelected;
  const setSelected = onTraitSelect || setInternalSelected;
  const selectedInfo = selected
    ? getExtendedTraitInfo(selected, scores[selected])
    : null;

  return (
    <div className="space-y-4">
      <div className="w-full aspect-square max-w-80 mx-auto">
        <OceanDiagram
          scores={scores}
          selectedTrait={selected}
          onTraitSelect={setSelected}
        />
      </div>

      {showDetails && (
        <>
          <div className="border-t border-border/40 -mt-2" />
          {!selected ? (
            <p className="text-center text-[10px] font-bold text-slate-muted/60 uppercase tracking-widest">
              Tap any trait to explore
            </p>
          ) : (
            selectedInfo && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-sm font-black text-ink">
                      {selectedInfo.label}
                    </h5>
                    <span className="text-[10px] font-bold text-slate-muted uppercase tracking-tight">
                      {selectedInfo.level} ({selectedInfo.score}%)
                    </span>
                  </div>
                  <button
                    onClick={() => setSelected(null)}
                    className="text-[10px] font-black text-forge-teal uppercase tracking-widest hover:opacity-70 transition-opacity"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs text-ink/80 leading-relaxed font-medium">
                  {selectedInfo.description}
                </p>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-[10px] text-slate-muted font-medium">
                    <span className="font-bold text-ink">In activities:</span>{" "}
                    {selectedInfo.inActivities}
                  </p>
                </div>
              </div>
            )
          )}
        </>
      )}
    </div>
  );
}
