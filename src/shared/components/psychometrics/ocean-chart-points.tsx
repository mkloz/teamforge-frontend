import type { KeyboardEvent } from "react";
import { cn } from "@/shared/lib/utils";

import {
  getOceanTraitByLabel,
  getPushedOutTickPosition,
} from "./ocean-chart-model";
import type { ChartDotProps, ChartTickProps } from "./psychometrics-types";

function handleTraitKeyDown(
  event: KeyboardEvent<SVGGElement>,
  onActivate: () => void,
) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }

  event.preventDefault();
  onActivate();
}

export function ChartDot({
  cx,
  cy,
  payload,
  interactive,
  selected,
  onTraitClick,
}: ChartDotProps) {
  if (cx === undefined || cy === undefined || !payload?.trait) return null;

  const traitLabel = payload.trait;
  const trait = getOceanTraitByLabel(payload.trait);
  const isSelected = trait && selected === trait.key;
  const handleActivate = () => onTraitClick?.(traitLabel);
  const content = (
    <>
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 7 : 5}
        fill="var(--primary)"
        stroke="var(--card)"
        strokeWidth={2}
        className="transition-all duration-200"
      />
      <circle cx={cx} cy={cy} r={32} fill="transparent" stroke="transparent" />
    </>
  );

  if (interactive) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: SVG chart groups cannot be replaced by HTML buttons inside an SVG.
      <g
        key={`dotgroup-${payload.trait}`}
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={(event) => handleTraitKeyDown(event, handleActivate)}
      >
        {content}
      </g>
    );
  }

  return (
    <g key={`dotgroup-${payload.trait}`} className="pointer-events-none">
      <circle
        cx={cx}
        cy={cy}
        r={isSelected ? 7 : 5}
        fill="var(--primary)"
        stroke="var(--card)"
        strokeWidth={2}
        className="transition-all duration-200"
      />
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
  const traitLabel = payload.value;
  const trait = getOceanTraitByLabel(traitLabel);
  const isSelected = trait && selected === trait.key;
  const score = trait && scores ? scores[trait.key] : 0;
  const handleActivate = () => onTraitClick?.(traitLabel);
  const content = (
    <>
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
    </>
  );

  if (interactive) {
    return (
      // biome-ignore lint/a11y/useSemanticElements: SVG chart groups cannot be replaced by HTML buttons inside an SVG.
      <g
        className="cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleActivate}
        onKeyDown={(event) => handleTraitKeyDown(event, handleActivate)}
      >
        {content}
      </g>
    );
  }

  return <g className="pointer-events-none">{content}</g>;
}
