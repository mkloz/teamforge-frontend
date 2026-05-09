import { Handshake } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";

interface CardHeaderProps {
  access: ExploreGroup["access"];
  groupName: string;
  imageSrc?: string;
  variant?: GroupPlanCardVariant;
}

export function CardHeader({
  access,
  groupName,
  imageSrc,
  variant = "default",
}: CardHeaderProps) {
  const isCompact = variant === "compact";

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        isCompact ? "mb-3" : "mb-3",
      )}
    >
      <div className="flex items-center gap-2.5">
        <Avatar
          src={imageSrc}
          name={groupName}
          className={cn(
            "border border-border bg-muted",
            isCompact ? "size-7" : "size-6",
          )}
          fallbackClassName="text-xs"
        />
        <span
          className={cn(
            "truncate font-semibold text-muted-foreground tracking-tight transition-colors group-hover:text-foreground",
            isCompact ? "text-xs" : "text-xs",
          )}
        >
          {groupName}
        </span>
      </div>

      {access === "BY_REQUEST" ? (
        <span className="flex shrink-0 items-center gap-1 rounded-full border border-border/80 bg-background/50 px-2 py-0.5 font-bold text-muted-foreground text-xs">
          <Handshake className="size-3" aria-hidden="true" />
          Request
        </span>
      ) : null}
    </div>
  );
}
