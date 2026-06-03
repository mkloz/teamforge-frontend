import { Handshake } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import type { GroupPlanCardVariant } from "@/shared/components/group-plan-card/group-plan-card-types";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { ExploreGroup } from "@/shared/schemas";
import type { ImageMedia } from "@/shared/schemas/media";

interface CardHeaderProps {
  access: ExploreGroup["access"];
  groupName: string;
  imageMedia?: ImageMedia | null;
  imageSrc?: string;
  variant?: GroupPlanCardVariant;
}

export function CardHeader({
  access,
  groupName,
  imageMedia,
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
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar
          src={imageSrc}
          media={imageMedia}
          name={groupName}
          imageSize={64}
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
        <StatusPill
          icon={Handshake}
          size="xs"
          tone="neutral"
          className={cn(
            "border-border/80 bg-background/50 py-0.5 text-xs",
            isCompact ? "px-1.5" : "px-2",
          )}
        >
          <span className={cn(isCompact && "sr-only")}>Request</span>
        </StatusPill>
      ) : null}
    </div>
  );
}
