"use client";

import { domAnimation, LazyMotion } from "framer-motion";

import { usePrefersReducedMotion as useReducedMotion } from "@/shared/hooks/use-prefers-reduced-motion";
import { cn } from "@/shared/lib/utils";
import { PlanLoadingLabel } from "./plan-loading-label";
import { PLAN_CREATION_LOADING_LABELS } from "./plan-loading-mark.constants";
import { PlanLoadingStage } from "./plan-loading-stage";
import { ReducedMotionLoadingMark } from "./reduced-motion-loading-mark";
import type { PlanLoadingMarkProps } from "./types";

export function PlanLoadingMark({
  label,
  className,
  size = 180,
  strikeCount = 0,
}: PlanLoadingMarkProps) {
  const shouldReduceMotion = useReducedMotion();
  const labelIndex = strikeCount % PLAN_CREATION_LOADING_LABELS.length;
  const displayLabel = label ?? PLAN_CREATION_LOADING_LABELS[labelIndex];

  if (shouldReduceMotion) {
    return (
      <ReducedMotionLoadingMark
        className={className}
        displayLabel={displayLabel}
        size={size}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex select-none flex-col items-center justify-center gap-4",
        className,
      )}
      aria-busy="true"
    >
      <output className="sr-only">{displayLabel}</output>
      <LazyMotion features={domAnimation}>
        <PlanLoadingStage size={size} />
        <PlanLoadingLabel
          displayLabel={displayLabel}
          label={label}
          strikeCount={strikeCount}
        />
      </LazyMotion>
    </div>
  );
}
