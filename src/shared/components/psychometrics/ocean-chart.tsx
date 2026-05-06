import { cn } from "@/shared/lib/utils";
import { useEffect, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";
import type { OceanScores, OceanTraitKey } from "@/shared/types/psychometrics";
import {
  getOceanChartData,
  getOceanTraitByLabel,
  getOceanTraitDetails,
} from "@/shared/components/psychometrics/ocean-chart-model";
import { OceanTraitDetails } from "@/shared/components/psychometrics/ocean-trait-details";

interface OceanDiagramProps {
  className?: string;
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
  className,
  scores,
  onTraitSelect,
  selectedTrait,
  interactive = true,
}: OceanDiagramProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerSize, setContainerSize] = useState({
    width: 0,
    height: 0,
  });

  const chartData = getOceanChartData(scores);

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const width = element.clientWidth;
      const height = element.clientHeight;

      setContainerSize((current) => {
        if (current.width === width && current.height === height) {
          return current;
        }

        return { width, height };
      });
    };

    updateSize();

    if (typeof ResizeObserver === "undefined") {
      return;
    }

    const observer = new ResizeObserver(() => {
      updateSize();
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleTraitClick = (label: string) => {
    if (!interactive || !onTraitSelect) return;

    const trait = getOceanTraitByLabel(label);
    if (trait) {
      onTraitSelect(selectedTrait === trait.key ? null : trait.key);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full min-h-56 [&_svg]:outline-none [&_svg:focus]:outline-none [&_*:focus]:outline-none",
        className,
      )}
    >
      {containerSize.width > 0 && containerSize.height > 0 ? (
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

function ChartDot({
  cx,
  cy,
  payload,
  interactive,
  selected,
  onTraitClick,
}: ChartDotProps) {
  if (cx === undefined || cy === undefined || !payload?.trait) return null;

  const trait = getOceanTraitByLabel(payload.trait);
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

  const trait = getOceanTraitByLabel(payload.value);
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
      <div className="w-full aspect-square max-w-80 mx-auto">
        <OceanDiagram
          scores={scores}
          selectedTrait={selected}
          onTraitSelect={setSelected}
          interactive={interactive}
        />
      </div>

      {showDetails && (
        <>
          <div className="border-t border-border/40 -mt-2" />
          <OceanTraitDetails
            selectedInfo={selectedInfo}
            onClear={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}
