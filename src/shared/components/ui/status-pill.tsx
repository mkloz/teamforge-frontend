import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

const statusPillVariants = cva(
  "inline-flex shrink-0 items-center rounded-full border font-bold leading-none transition-colors",
  {
    variants: {
      tone: {
        amber: "border-spark-amber/25 bg-spark-amber/10 text-spark-amber",
        destructive: "border-destructive/25 bg-destructive/10 text-destructive",
        muted: "border-slate-muted/15 bg-slate-muted/10 text-slate-muted",
        none: "",
        neutral: "border-border/55 bg-muted text-muted-foreground",
        teal: "border-forge-teal/20 bg-forge-teal/10 text-forge-teal",
      },
      size: {
        "2xs": "gap-0.5 px-1.5 py-0.5 text-micro",
        signature:
          "type-signature-label h-4 min-w-4 justify-center gap-0.5 px-1.5 py-0",
        xs: "gap-1 px-2 py-0.5 text-micro",
        sm: "gap-1.5 px-2.5 py-1 text-xs",
        md: "gap-1.5 px-3 py-1.5 text-xs",
      },
      surface: {
        ghost: "border-0 bg-transparent",
        outline: "",
        soft: "border-0",
        solid: "border-0",
      },
      textCase: {
        normal: "",
        upper: "uppercase tracking-widest",
      },
      numeric: {
        true: "tabular-nums",
        false: "",
      },
    },
    compoundVariants: [
      {
        surface: "soft",
        tone: "amber",
        className: "bg-spark-amber/10 text-spark-amber",
      },
      {
        surface: "soft",
        tone: "destructive",
        className: "bg-destructive/10 text-destructive",
      },
      {
        surface: "soft",
        tone: "muted",
        className: "bg-slate-muted/10 text-slate-muted",
      },
      {
        surface: "soft",
        tone: "neutral",
        className: "bg-muted/35 text-muted-foreground",
      },
      {
        surface: "soft",
        tone: "teal",
        className: "bg-forge-teal/8 text-forge-teal",
      },
      {
        surface: "solid",
        tone: "amber",
        className: "bg-spark-amber text-white",
      },
      {
        surface: "solid",
        tone: "destructive",
        className: "bg-destructive text-white",
      },
      {
        surface: "solid",
        tone: "muted",
        className: "bg-slate-muted text-white",
      },
      {
        surface: "solid",
        tone: "neutral",
        className: "bg-muted text-muted-foreground",
      },
      {
        surface: "solid",
        tone: "teal",
        className: "bg-forge-teal text-white",
      },
    ],
    defaultVariants: {
      numeric: false,
      size: "xs",
      surface: "outline",
      textCase: "normal",
      tone: "teal",
    },
  },
);

const iconSizeClassNames = {
  "2xs": "size-2.5",
  signature: "size-2.5",
  xs: "size-3",
  sm: "size-3.5",
  md: "size-4",
} as const;

export type StatusPillTone = NonNullable<
  VariantProps<typeof statusPillVariants>["tone"]
>;
export type StatusPillSize = NonNullable<
  VariantProps<typeof statusPillVariants>["size"]
>;

export interface StatusPillProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusPillVariants> {
  children: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
  iconStrokeWidth?: number;
}

export function StatusPill({
  children,
  className,
  icon: Icon,
  iconClassName,
  iconStrokeWidth = 2,
  numeric,
  size = "xs",
  surface,
  textCase,
  tone,
  ...props
}: StatusPillProps) {
  const resolvedSize = size ?? "xs";

  return (
    <span
      className={cn(
        statusPillVariants({
          numeric,
          size,
          surface,
          textCase,
          tone,
        }),
        className,
      )}
      {...props}
    >
      {Icon ? (
        <Icon
          className={cn(iconSizeClassNames[resolvedSize], iconClassName)}
          aria-hidden="true"
          strokeWidth={iconStrokeWidth}
        />
      ) : null}
      {children}
    </span>
  );
}
