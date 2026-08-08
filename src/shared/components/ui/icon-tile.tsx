import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

const iconTileVariants = cva(
  "flex shrink-0 items-center justify-center transition-colors",
  {
    variants: {
      tone: {
        amber: "bg-accent/10 text-accent",
        destructive: "bg-destructive/10 text-destructive",
        muted: "bg-slate-muted/10 text-slate-muted",
        neutral: "bg-muted text-muted-foreground",
        none: "",
        teal: "bg-primary text-primary-foreground",
      },
      size: {
        "2xs": "size-4",
        xs: "size-5",
        marker: "size-6",
        sm: "size-7",
        md: "size-8",
        lg: "size-10",
        xl: "size-12",
        "2xl": "size-14",
      },
      shape: {
        circle: "rounded-full",
        square: "rounded-lg",
      },
      bordered: {
        true: "border",
        false: "",
      },
    },
    compoundVariants: [
      {
        bordered: true,
        tone: "amber",
        className: "border-accent/25",
      },
      {
        bordered: true,
        tone: "destructive",
        className: "border-destructive/25",
      },
      {
        bordered: true,
        tone: "muted",
        className: "border-slate-muted/20",
      },
      {
        bordered: true,
        tone: "neutral",
        className: "border-border/55",
      },
      {
        bordered: true,
        tone: "none",
        className: "border-border/55",
      },
      {
        bordered: true,
        tone: "teal",
        className: "border-primary/20",
      },
      {
        shape: "square",
        size: "marker",
        className: "rounded-md",
      },
      {
        shape: "square",
        size: "sm",
        className: "rounded-sm",
      },
      {
        shape: "square",
        size: "md",
        className: "rounded-md",
      },
    ],
    defaultVariants: {
      bordered: false,
      shape: "square",
      size: "md",
      tone: "neutral",
    },
  },
);

const iconSizeClassNames = {
  "2xs": "size-2.5",
  xs: "size-3",
  marker: "size-3.5",
  sm: "size-3.5",
  md: "size-4",
  lg: "size-5",
  xl: "size-6",
  "2xl": "size-6",
} as const;

export type IconTileTone = NonNullable<
  VariantProps<typeof iconTileVariants>["tone"]
>;
export type IconTileSize = NonNullable<
  VariantProps<typeof iconTileVariants>["size"]
>;
export type IconTileShape = NonNullable<
  VariantProps<typeof iconTileVariants>["shape"]
>;

export interface IconTileProps
  extends HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof iconTileVariants> {
  children?: ReactNode;
  icon?: LucideIcon;
  iconClassName?: string;
}

export function IconTile({
  "aria-hidden": ariaHidden = true,
  bordered,
  children,
  className,
  icon: Icon,
  iconClassName,
  shape,
  size = "md",
  tone,
  ...props
}: IconTileProps) {
  const resolvedSize = size ?? "md";

  return (
    <span
      aria-hidden={ariaHidden}
      className={cn(
        iconTileVariants({ bordered, shape, size, tone }),
        className,
      )}
      {...props}
    >
      {Icon ? (
        <Icon
          className={cn(iconSizeClassNames[resolvedSize], iconClassName)}
          strokeWidth={2}
        />
      ) : (
        children
      )}
    </span>
  );
}
