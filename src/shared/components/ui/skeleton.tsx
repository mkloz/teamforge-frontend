import { cva, type VariantProps } from "class-variance-authority";
import type React from "react";

import { cn } from "@/shared/lib/utils";

const skeletonVariants = cva(
  "relative isolate overflow-hidden bg-clip-padding after:absolute after:inset-0 after:animate-skeleton-shimmer after:bg-[linear-gradient(105deg,transparent_22%,color-mix(in_srgb,var(--color-canvas)_82%,transparent)_46%,color-mix(in_srgb,var(--color-canvas)_44%,transparent)_54%,transparent_78%)] after:bg-size-[240%_100%] after:bg-no-repeat after:opacity-90 after:content-[''] motion-reduce:after:hidden dark:after:bg-[linear-gradient(105deg,transparent_22%,color-mix(in_srgb,var(--color-foreground)_13%,transparent)_46%,color-mix(in_srgb,var(--color-foreground)_7%,transparent)_54%,transparent_78%)] forced-colors:bg-slate-muted/40 forced-colors:after:hidden",
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
          "bg-muted-soft ring-1 ring-ink/5 dark:bg-slate-muted/18 dark:ring-slate-muted/10",
        muted: "bg-muted/90 ring-1 ring-ink/5 dark:ring-slate-muted/10",
        teal: "bg-primary-soft ring-1 ring-primary/10 dark:bg-primary/16",
        amber: "bg-accent/16 ring-1 ring-accent/10 dark:bg-accent/20",
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

export { Skeleton };
