import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";

import { cn } from "@/shared/lib/utils";

const countBadgeVariants = cva(
  "inline-flex shrink-0 items-center justify-center rounded-full font-black text-micro tabular-nums leading-none",
  {
    variants: {
      tone: {
        amber:
          "border border-spark-amber/35 bg-spark-amber/10 text-spark-amber",
        muted: "bg-slate-muted/15 text-slate-muted",
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

export function CountBadge({
  className,
  count,
  max = 99,
  size,
  tone,
  ...props
}: CountBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      className={cn(countBadgeVariants({ size, tone }), className)}
      {...props}
    >
      {count > max ? `${max}+` : count}
    </span>
  );
}
