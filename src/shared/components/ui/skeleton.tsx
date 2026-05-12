import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "@/shared/lib/utils";

const skeletonVariants = cva(
  "motion-safe:animate-pulse forced-colors:bg-slate-muted/40",
  {
    variants: {
      shape: {
        default: "rounded-md",
        card: "rounded-2xl",
        circle: "rounded-full",
        pill: "rounded-full",
        square: "rounded-lg",
      },
      tone: {
        default: "bg-slate-muted/12 dark:bg-slate-muted/18",
        muted: "bg-muted",
        teal: "bg-forge-teal/12 dark:bg-forge-teal/18",
        amber: "bg-spark-amber/14 dark:bg-spark-amber/20",
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
