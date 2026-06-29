"use client";

import { domAnimation, LazyMotion, useReducedMotion } from "framer-motion";

import { cn } from "@/shared/lib/utils";

import { ForgeAnvilStage } from "./forge-anvil-stage";
import { FORGE_LOADING_LABELS } from "./forge-loading-anvil.constants";
import { ForgeLoadingLabel } from "./forge-loading-label";
import { ReducedMotionAnvil } from "./reduced-motion-anvil";
import type { ForgeLoadingAnvilProps } from "./types";

export function ForgeLoadingAnvil({
  label,
  className,
  size = 180,
  strikeCount = 0,
}: ForgeLoadingAnvilProps) {
  const shouldReduceMotion = useReducedMotion();
  const labelIndex = strikeCount % FORGE_LOADING_LABELS.length;
  const displayLabel = label ?? FORGE_LOADING_LABELS[labelIndex];

  if (shouldReduceMotion) {
    return (
      <ReducedMotionAnvil
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
        <ForgeAnvilStage size={size} />
        <ForgeLoadingLabel
          displayLabel={displayLabel}
          label={label}
          strikeCount={strikeCount}
        />
      </LazyMotion>
    </div>
  );
}
