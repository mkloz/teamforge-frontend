import { cva, type VariantProps } from "class-variance-authority";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { type HTMLAttributes, useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

const countBadgeVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-full font-black text-micro tabular-nums leading-none",
  {
    variants: {
      tone: {
        amber:
          "border border-[color-mix(in_srgb,var(--color-spark-amber)_35%,var(--color-canvas))] bg-[color-mix(in_srgb,var(--color-spark-amber)_10%,var(--color-canvas))] text-[color-mix(in_srgb,var(--color-spark-amber)_70%,var(--color-ink))]",
        muted:
          "bg-[color-mix(in_srgb,var(--color-slate-muted)_15%,var(--color-canvas))] text-[color-mix(in_srgb,var(--color-slate-muted)_85%,var(--color-ink))]",
        none: "",
        teal: "bg-forge-teal text-white shadow-forge-teal/20 shadow-sm",
      },
      size: {
        xs: "h-3.5 min-w-3.5 px-1",
        sm: "h-4.5 min-w-4.5 px-1.5",
        md: "h-5 min-w-5 px-1.5 text-xs",
      },
    },
    defaultVariants: {
      size: "sm",
      tone: "teal",
    },
  },
);

export interface CountBadgeProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof countBadgeVariants> {
  count: number;
  max?: 9 | 99;
}

type CountDirection = -1 | 1;

interface CountMotionState {
  direction: CountDirection;
  reducedMotion: boolean;
}

const COUNT_VARIANTS = {
  enter: ({ direction, reducedMotion }: CountMotionState) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.96,
    y: reducedMotion ? 0 : direction > 0 ? "65%" : "-65%",
  }),
  center: {
    opacity: 1,
    scale: 1,
    y: "0%",
  },
  exit: ({ direction, reducedMotion }: CountMotionState) => ({
    opacity: 0,
    scale: reducedMotion ? 1 : 0.96,
    y: reducedMotion ? 0 : direction > 0 ? "-65%" : "65%",
  }),
};

export function CountBadge({
  className,
  count,
  max = 99,
  size,
  tone,
  ...props
}: CountBadgeProps) {
  const [previousCount, setPreviousCount] = useState(count);
  const prefersReducedMotion = useReducedMotion();
  const direction: CountDirection = count >= previousCount ? 1 : -1;
  const motionState: CountMotionState = {
    direction,
    reducedMotion: Boolean(prefersReducedMotion),
  };

  useEffect(() => {
    setPreviousCount(count);
  }, [count]);

  if (count <= 0) {
    return null;
  }

  const displayValue = count > max ? `${max}+` : count;

  return (
    <span
      className={cn(
        countBadgeVariants({ size, tone }),
        "relative overflow-hidden",
        className,
      )}
      {...props}
    >
      <AnimatePresence custom={motionState} initial={false} mode="popLayout">
        <motion.span
          key={displayValue}
          animate="center"
          className="col-start-1 row-start-1 flex h-full items-center justify-center leading-none"
          custom={motionState}
          exit="exit"
          initial="enter"
          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
          variants={COUNT_VARIANTS}
        >
          {displayValue}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
