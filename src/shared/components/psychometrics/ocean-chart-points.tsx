import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/shared/lib/utils";

import {
  getOceanTraitByLabel,
  getPushedOutTickPosition,
} from "./ocean-chart-model";
import type { ChartDotProps, ChartTickProps } from "./psychometrics-types";

interface ReadyChartDotProps extends ChartDotProps {
  cx: number | string;
  cy: number | string;
  payload: { trait: string; value?: string | number };
}

interface ReadyChartTickProps extends ChartTickProps {
  cx: number | string;
  cy: number | string;
  payload: { trait?: string; value: string };
  x: number | string;
  y: number | string;
}

interface TraitInteractionGroupProps {
  children: ReactNode;
  groupKey?: string;
  interactive?: boolean;
  isSelected: boolean;
  onActivate: () => void;
  traitLabel: string;
}

function hasChartDotRenderData(
  props: ChartDotProps,
): props is ReadyChartDotProps {
  return (
    hasRenderableCoordinate(props.cx) &&
    hasRenderableCoordinate(props.cy) &&
    hasTraitPayload(props.payload?.trait)
  );
}

function hasChartTickRenderData(
  props: ChartTickProps,
): props is ReadyChartTickProps {
  return (
    [props.x, props.y, props.cx, props.cy].every(hasRenderableCoordinate) &&
    hasTraitPayload(props.payload?.value)
  );
}

function hasRenderableCoordinate(value: number | string | undefined) {
  return value !== undefined;
}

function hasTraitPayload(value: string | number | undefined) {
  return Boolean(value);
}

function isTraitActivationKey(key: string) {
  return key === "Enter" || key === " ";
}

function handleTraitKeyDown(
  event: KeyboardEvent<SVGGElement>,
  onActivate: () => void,
) {
  if (!isTraitActivationKey(event.key)) {
    return;
  }

  event.preventDefault();
  onActivate();
}

function getTraitSelectionState(
  traitLabel: string,
  selected: ChartDotProps["selected"],
) {
  const trait = getOceanTraitByLabel(traitLabel);

  return {
    isSelected: Boolean(trait && selected === trait.key),
    trait,
  };
}

function getTraitScore({
  scores,
  trait,
}: Pick<ChartTickProps, "scores"> & {
  trait: ReturnType<typeof getOceanTraitByLabel>;
}) {
  return trait && scores ? scores[trait.key] : 0;
}

function TraitInteractionGroup({
  children,
  groupKey,
  interactive,
  isSelected,
  onActivate,
  traitLabel,
}: TraitInteractionGroupProps) {
  if (!interactive) {
    return (
      <g key={groupKey} className="pointer-events-none">
        {children}
      </g>
    );
  }

  return (
    // biome-ignore lint/a11y/useSemanticElements: SVG chart groups cannot be replaced by HTML buttons inside an SVG.
    <g
      key={groupKey}
      className="cursor-pointer"
      aria-label={`Select ${traitLabel} trait`}
      aria-pressed={isSelected}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(event) => handleTraitKeyDown(event, onActivate)}
    >
      {children}
    </g>
  );
}

function ChartDotGlyph({
  cx,
  cy,
  includeHitArea,
  isSelected,
}: Pick<ReadyChartDotProps, "cx" | "cy"> & {
  includeHitArea: boolean;
  isSelected: boolean;
}) {
  return (
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
      {includeHitArea ? (
        <circle
          cx={cx}
          cy={cy}
          r={32}
          fill="transparent"
          stroke="transparent"
        />
      ) : null}
    </>
  );
}

export function ChartDot(props: ChartDotProps) {
  if (!hasChartDotRenderData(props)) return null;

  const { cx, cy, payload, interactive, selected, onTraitClick } = props;
  const traitLabel = payload.trait;
  const { isSelected } = getTraitSelectionState(traitLabel, selected);
  const handleActivate = () => onTraitClick?.(traitLabel);
  const groupKey = `dotgroup-${payload.trait}`;

  return (
    <TraitInteractionGroup
      key={groupKey}
      groupKey={groupKey}
      interactive={interactive}
      isSelected={isSelected}
      onActivate={handleActivate}
      traitLabel={traitLabel}
    >
      <ChartDotGlyph
        cx={cx}
        cy={cy}
        includeHitArea={Boolean(interactive)}
        isSelected={isSelected}
      />
    </TraitInteractionGroup>
  );
}

export function ChartTick(props: ChartTickProps) {
  if (!hasChartTickRenderData(props)) {
    return null;
  }

  const { x, y, cx, cy, payload, interactive, selected, onTraitClick, scores } =
    props;
  const { x: labelX, y: labelY } = getPushedOutTickPosition({ cx, cy, x, y });
  const traitLabel = payload.value;
  const { isSelected, trait } = getTraitSelectionState(traitLabel, selected);
  const score = getTraitScore({ scores, trait });
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
          "type-signature-label select-none font-bold transition-colors",
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
          className="type-signature-label mt-1 select-none fill-primary font-black"
        >
          {score}%
        </text>
      ) : null}
    </>
  );

  return (
    <TraitInteractionGroup
      interactive={interactive}
      isSelected={isSelected}
      onActivate={handleActivate}
      traitLabel={traitLabel}
    >
      {content}
    </TraitInteractionGroup>
  );
}
