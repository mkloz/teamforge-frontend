import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "@/shared/lib/utils";

const skeletonVariants = cva(
  "skeleton-shimmer forced-colors:bg-slate-muted/40",
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
          "bg-slate-muted/10 ring-1 ring-ink/5 dark:bg-slate-muted/20 dark:ring-slate-muted/10",
        muted: "bg-muted ring-1 ring-ink/5 dark:ring-slate-muted/10",
        teal: "bg-forge-teal/10 ring-1 ring-forge-teal/10 dark:bg-forge-teal/15",
        amber:
          "bg-spark-amber/15 ring-1 ring-spark-amber/10 dark:bg-spark-amber/20",
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
