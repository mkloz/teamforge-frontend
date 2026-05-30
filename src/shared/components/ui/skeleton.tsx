import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "@/shared/lib/utils";

const skeletonVariants = cva(
  "relative isolate overflow-hidden bg-clip-padding after:absolute after:inset-0 after:animate-skeleton-shimmer after:bg-[linear-gradient(105deg,transparent_25%,color-mix(in_srgb,var(--color-canvas)_62%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_28%,transparent)_52%,transparent_74%)] after:bg-size-[240%_100%] after:bg-no-repeat after:opacity-80 after:content-[''] motion-reduce:after:hidden dark:after:bg-[linear-gradient(105deg,transparent_25%,color-mix(in_srgb,var(--color-canvas)_10%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_5%,transparent)_52%,transparent_74%)] forced-colors:bg-slate-muted/40 forced-colors:after:hidden",
  {
    variants: {
      shape: {
        default: "rounded-lg",
        card: "rounded-xl",
        circle: "rounded-full",
        pill: "rounded-full",
        square: "rounded-xl",
      },
      tone: {
        default:
          "bg-slate-muted/12 ring-1 ring-ink/5 dark:bg-slate-muted/18 dark:ring-slate-muted/10",
        muted: "bg-muted/90 ring-1 ring-ink/5 dark:ring-slate-muted/10",
        teal: "bg-forge-teal/12 ring-1 ring-forge-teal/10 dark:bg-forge-teal/16",
        amber:
          "bg-spark-amber/16 ring-1 ring-spark-amber/10 dark:bg-spark-amber/20",
      },
    },
    defaultVariants: {
      shape: "default",
      tone: "default",
    },
  },
);

export interface SkeletonProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof skeletonVariants> {}

function Skeleton({
  "aria-hidden": ariaHidden = true,
  className,
  shape,
  tone,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden={ariaHidden}
      className={cn(skeletonVariants({ shape, tone }), className)}
      {...props}
    />
  );
}

export { Skeleton, skeletonVariants };
