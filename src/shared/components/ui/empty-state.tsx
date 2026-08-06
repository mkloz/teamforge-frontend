import type { LucideIcon } from "lucide-react";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { IconTile } from "@/shared/components/ui/icon-tile";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps
  extends Omit<ComponentPropsWithoutRef<"div">, "title"> {
  action?: ReactNode;
  description?: ReactNode;
  icon: LucideIcon;
  title: ReactNode;
}

export function EmptyState({
  action,
  className,
  description,
  icon,
  title,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex min-h-28 w-full flex-col items-center justify-center gap-3 rounded-2xl border border-border/55 border-dashed bg-card/55 px-5 py-5 text-center sm:flex-row sm:justify-start sm:text-left",
        className,
      )}
      {...props}
    >
      <IconTile bordered icon={icon} shape="circle" size="lg" tone="neutral" />

      <div className="min-w-0 max-w-xl flex-1">
        <p className="font-bold text-foreground text-sm leading-5">{title}</p>
        {description ? (
          <p className="mt-1 font-medium text-muted-foreground text-xs leading-5">
            {description}
          </p>
        ) : null}
      </div>

      {action ? (
        <div className="mt-1 shrink-0 sm:mt-0 sm:ml-auto">{action}</div>
      ) : null}
    </div>
  );
}
