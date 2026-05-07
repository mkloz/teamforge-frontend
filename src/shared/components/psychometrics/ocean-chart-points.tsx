import { cn } from "@/shared/lib/utils";

import {
  getOceanTraitByLabel,
  getPushedOutTickPosition,
} from "./ocean-chart-model";
import type { ChartDotProps, ChartTickProps } from "./psychometrics-types";

export function ChartDot({
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
      {interactive ? (
        <circle
          cx={cx}
          cy={cy}
          r={32}
          fill="transparent"
          stroke="transparent"
        />
      ) : null}
    </g>
  );
}

export function ChartTick({
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

  const { x: labelX, y: labelY } = getPushedOutTickPosition({ cx, cy, x, y });
  const trait = getOceanTraitByLabel(payload.value);
  const isSelected = trait && selected === trait.key;
  const score = trait && scores ? scores[trait.key] : 0;

  return (
    <g
      className={cn(interactive ? "cursor-pointer" : "pointer-events-none")}
      onClick={interactive ? () => onTraitClick?.(payload.value!) : undefined}
    >
      <rect
        x={labelX - 45}
        y={labelY - 20}
        width={90}
        height={40}
        fill="transparent"
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="middle"
        dominantBaseline="middle"
        className={cn(
          "psychometric-chart-label font-bold transition-colors select-none",
          isSelected ? "fill-primary" : "fill-slate-muted/80",
        )}
      >
        {payload.value}
      </text>
      {isSelected ? (
        <text
          x={labelX}
          y={labelY + 12}
          textAnchor="middle"
          dominantBaseline="middle"
          className="psychometric-chart-label mt-1 fill-primary font-black select-none"
        >
          {score}%
        </text>
      ) : null}
    </g>
  );
}
