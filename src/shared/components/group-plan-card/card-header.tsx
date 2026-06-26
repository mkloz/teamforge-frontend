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

interface CardHeaderViewState {
  avatarClassName: string;
  groupNameClassName: string;
  isCompact: boolean;
  shouldShowRequestPill: boolean;
  statusPillClassName: string;
}

export function CardHeader({
  access,
  groupName,
  imageMedia,
  imageSrc,
  variant = "default",
}: CardHeaderProps) {
  const viewState = getCardHeaderViewState({ access, variant });

  return (
    <div className="mb-3 flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Avatar
          src={imageSrc}
          media={imageMedia}
          name={groupName}
          imageSize={64}
          className={viewState.avatarClassName}
          fallbackClassName="text-xs"
        />
        <span className={viewState.groupNameClassName}>{groupName}</span>
      </div>

      {viewState.shouldShowRequestPill ? (
        <StatusPill
          icon={Handshake}
          size="xs"
          tone="neutral"
          className={viewState.statusPillClassName}
        >
          <span className={cn(viewState.isCompact && "sr-only")}>Request</span>
        </StatusPill>
      ) : null}
    </div>
  );
}

function getCardHeaderViewState({
  access,
  variant,
}: Pick<CardHeaderProps, "access" | "variant">): CardHeaderViewState {
  const isCompact = variant === "compact";

  return {
    avatarClassName: cn(
      "border border-border bg-muted",
      isCompact ? "size-7" : "size-6",
    ),
    groupNameClassName:
      "truncate font-semibold text-muted-foreground text-xs tracking-tight transition-colors group-hover:text-foreground",
    isCompact,
    shouldShowRequestPill: access === "BY_REQUEST",
    statusPillClassName: cn(
      "border-border/80 bg-background/50 py-0.5 text-xs",
      isCompact ? "px-1.5" : "px-2",
    ),
  };
}
