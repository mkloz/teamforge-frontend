import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

import { Avatar } from "./avatar";

export type AvatarBadgeTone = "amber" | "muted" | "teal";

interface AvatarWithBadgeProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children"> {
  alt?: string;
  avatarClassName?: string;
  avatarShape?: "circle" | "rounded";
  badgeTone?: AvatarBadgeTone;
  fallback?: ReactNode;
  fallbackClassName?: string;
  icon: LucideIcon;
  iconClassName?: string;
  imageClassName?: string;
  imageSize?: number;
  loading?: ImgHTMLAttributes<HTMLImageElement>["loading"];
  name?: string | null;
  src?: string | null;
}

const badgeToneClassNames: Record<AvatarBadgeTone, string> = {
  amber:
    "border-spark-amber/40 bg-canvas text-spark-amber shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-spark-amber)_16%,transparent)] ring-2 ring-canvas",
  muted:
    "border-slate-muted/25 bg-canvas text-slate-muted shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--slate-muted)_10%,transparent)] ring-2 ring-canvas",
  teal: "border-forge-teal/35 bg-canvas text-foreground shadow-[inset_0_0_0_999px_color-mix(in_srgb,var(--color-forge-teal)_14%,transparent)] ring-2 ring-canvas",
};

export function AvatarWithBadge({
  alt,
  avatarClassName,
  avatarShape = "circle",
  badgeTone = "teal",
  className,
  fallback,
  fallbackClassName,
  icon: Icon,
  iconClassName,
  imageClassName,
  imageSize,
  loading,
  name,
  src,
  ...props
}: AvatarWithBadgeProps) {
  return (
    <span
      className={cn("relative shrink-0", className)}
      aria-hidden="true"
      {...props}
    >
      <Avatar
        src={src}
        name={name}
        alt={alt}
        fallback={fallback}
        fallbackClassName={fallbackClassName}
        imageClassName={imageClassName}
        imageSize={imageSize}
        loading={loading}
        shape={avatarShape}
        className={cn(
          "size-10 border border-border/70 bg-canvas",
          avatarClassName,
        )}
      />
      <span
        className={cn(
          "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-canvas",
          badgeToneClassNames[badgeTone],
        )}
      >
        <Icon
          className={cn("size-3 shrink-0", iconClassName)}
          strokeWidth={2}
        />
      </span>
    </span>
  );
}
