import type { LucideIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";

import {
  IconTile,
  type IconTileShape,
  type IconTileSize,
  type IconTileTone,
} from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

export interface FactItemProps extends HTMLAttributes<HTMLDivElement> {
  href?: string | null;
  icon: LucideIcon;
  iconClassName?: string;
  iconShape?: IconTileShape;
  iconSize?: IconTileSize;
  iconTileClassName?: string;
  iconTone?: IconTileTone;
  label: ReactNode;
  labelClassName?: string;
  linkClassName?: string;
  meta?: ReactNode;
  value: ReactNode;
  valueClassName?: string;
}

export function FactItem({
  className,
  href,
  icon,
  iconClassName,
  iconShape = "square",
  iconSize = "md",
  iconTileClassName,
  iconTone = "teal",
  label,
  labelClassName,
  linkClassName,
  meta,
  value,
  valueClassName,
  ...props
}: FactItemProps) {
  return (
    <div
      className={cn("flex min-w-0 items-center gap-2", className)}
      {...props}
    >
      <IconTile
        icon={icon}
        iconClassName={iconClassName}
        shape={iconShape}
        size={iconSize}
        tone={iconTone}
        className={iconTileClassName}
      />
      <div className="min-w-0 flex-1">
        <dt className={cn("text-slate-muted text-xs", labelClassName)}>
          {label}
        </dt>
        <dd
          className={cn(
            "wrap-break-word font-semibold text-ink text-sm leading-snug",
            valueClassName,
          )}
        >
          {href ? (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn("text-forge-teal hover:underline", linkClassName)}
            >
              {value}
            </a>
          ) : (
            value
          )}
          {meta ? (
            <span className="ml-1 font-medium text-slate-muted">{meta}</span>
          ) : null}
        </dd>
      </div>
    </div>
  );
}
