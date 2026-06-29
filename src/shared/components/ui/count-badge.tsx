import { cva, type VariantProps } from "class-variance-authority";
import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import { type HTMLAttributes, useState } from "react";

import { cn } from "@/shared/lib/utils";

const countBadgeVariants = cva(
  "inline-grid shrink-0 place-items-center rounded-full font-black text-micro tabular-nums leading-none",
  {
    variants: {
      tone: {
        amber:
          "border border-[color-mix(in_srgb,var(--accent)_35%,var(--color-canvas))] bg-[color-mix(in_srgb,var(--accent)_10%,var(--color-canvas))] text-[color-mix(in_srgb,var(--accent)_70%,var(--color-ink))]",
        muted:
          "bg-[color-mix(in_srgb,var(--color-slate-muted)_15%,var(--color-canvas))] text-[color-mix(in_srgb,var(--color-slate-muted)_85%,var(--color-ink))]",
        none: "",
        teal: "bg-primary text-primary-foreground shadow-primary/20 shadow-sm",
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

interface CountPreviousState {
  count: number;
  direction: CountDirection;
}

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
  const [previousState, setPreviousState] = useState<CountPreviousState>(
    () => ({
      count,
      direction: 1,
    }),
  );
  const prefersReducedMotion = useReducedMotion();
  let direction = previousState.direction;

  if (previousState.count !== count) {
    direction = count >= previousState.count ? 1 : -1;
    setPreviousState({ count, direction });
  }

  const motionState: CountMotionState = {
    direction,
    reducedMotion: Boolean(prefersReducedMotion),
  };

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
      <LazyMotion features={domAnimation}>
        <AnimatePresence custom={motionState} initial={false} mode="popLayout">
          <m.span
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
          </m.span>
        </AnimatePresence>
      </LazyMotion>
    </span>
  );
}
