import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

export interface EmptyStateProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  action?: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  size?: "compact" | "default";
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  size = "default",
  title,
  ...props
}: EmptyStateProps) {
  const isCompact = size === "compact";

  return (
    <div
      className={cn(
        isCompact
          ? "flex w-full items-start justify-start text-left"
          : "flex min-h-32 w-full items-center justify-center rounded-2xl border border-border/55 border-dashed bg-card/55 px-5 py-5 text-left",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "grid max-w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-3",
          isCompact &&
            "w-full rounded-md bg-card px-3 py-3 shadow-soft-sm sm:w-fit",
          !isCompact &&
            action &&
            "w-full sm:w-fit sm:grid-cols-[auto_auto_auto]",
          !isCompact && !action && "w-full sm:w-fit",
        )}
      >
        <IconTile
          bordered={!isCompact}
          icon={icon}
          shape="circle"
          size={isCompact ? "lg" : "2xl"}
          tone="neutral"
        />

        <div className="min-w-0 max-w-xl">
          <p className="font-bold text-foreground text-sm leading-5">{title}</p>
          {description ? (
            <p className="mt-1 font-medium text-muted-foreground text-xs leading-5">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="col-start-2 flex shrink-0 flex-wrap items-center gap-2 sm:col-start-3 sm:row-start-1">
            {action}
          </div>
        ) : null}
      </div>
    </div>
  );
}
