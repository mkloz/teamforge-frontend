import { X } from "lucide-react";
import type { Group } from "@/features/activity/lib/activity-contract";
import { getGroupAvatarUrl } from "@/features/activity/lib/group-identity";
import { Avatar } from "@/shared/components/common/avatar";
import { PlanCover } from "@/shared/components/common/plan-cover";
import { Button } from "@/shared/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface GroupCoverHeaderProps {
  group: Group;
  isCompactVisible: boolean;
  isMobile: boolean;
  onClose: () => void;
  onCompactHeaderClick: () => void;
}

interface GroupCoverHeaderState {
  avatarUrl: string | null;
  memberCount: number;
  memberLabel: string;
}

export function GroupCoverHeader({
  group,
  isCompactVisible,
  isMobile,
  onClose,
  onCompactHeaderClick,
}: GroupCoverHeaderProps) {
  const headerState = getGroupCoverHeaderState(group);

  return (
    <header className="pointer-events-none sticky top-0 z-30 h-(--collapsible-panel-expanded-height,10rem) overflow-visible [overflow-anchor:none]">
      <GroupCoverImageLayer group={group} />

      <div
        className="transform-[translate3d(0,var(--collapsible-panel-cover-y,0px),0)] absolute inset-x-0 top-0 h-(--collapsible-panel-expanded-height,10rem) bg-canvas opacity-(--collapsible-panel-compact-scrim-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none"
        aria-hidden="true"
      />
      <CompactGroupCoverHeader
        group={group}
        headerState={headerState}
        isCompactVisible={isCompactVisible}
        onCompactHeaderClick={onCompactHeaderClick}
      />

      <MobileGroupCoverCloseButton isMobile={isMobile} onClose={onClose} />
    </header>
  );
}

function getGroupCoverHeaderState(group: Group): GroupCoverHeaderState {
  const memberCount = group.members?.length ?? 0;

  return {
    avatarUrl: getGroupAvatarUrl(group),
    memberCount,
    memberLabel: memberCount === 1 ? "member" : "members",
  };
}

function GroupCoverImageLayer({ group }: { group: Group }) {
  return (
    <div
      className={cn(
        "transform-[translate3d(0,var(--collapsible-panel-cover-y,0px),0)] absolute inset-x-0 top-0 h-(--collapsible-panel-expanded-height,10rem) w-full overflow-hidden bg-canvas transition-transform duration-300 ease-out will-change-transform motion-reduce:transition-none",
      )}
    >
      <div className="size-full bg-canvas">
        <PlanCover
          value={group.plan?.coverImage}
          media={group.plan?.coverImageMedia ?? null}
          alt={`${group.name} cover`}
          imageClassName={cn(
            "transition-transform duration-300 ease-out motion-reduce:transition-none",
            "transform-[translate3d(0,var(--collapsible-panel-image-y,0px),0)_scale(var(--collapsible-panel-image-scale,1))] origin-[center_top]",
          )}
          loading="eager"
          showLoadingState={false}
        />
      </div>
    </div>
  );
}

function CompactGroupCoverHeader({
  group,
  headerState,
  isCompactVisible,
  onCompactHeaderClick,
}: {
  group: Group;
  headerState: GroupCoverHeaderState;
  isCompactVisible: boolean;
  onCompactHeaderClick: () => void;
}) {
  return (
    <div
      className={cn(
        "transform-[translate3d(0,var(--collapsible-panel-title-y,0px),0)] absolute inset-x-0 top-0 flex h-(--collapsible-panel-collapsed-height,4.5rem) items-center gap-3 pr-14 pl-4 opacity-(--collapsible-panel-compact-opacity) transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none",
        isCompactVisible ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!isCompactVisible}
    >
      <button
        type="button"
        aria-label="Scroll group panel to top"
        tabIndex={isCompactVisible ? 0 : -1}
        onClick={onCompactHeaderClick}
        className="absolute inset-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white focus-visible:ring-inset"
      />

      <Avatar
        src={headerState.avatarUrl}
        name={group.name}
        alt={`${group.name} avatar`}
        shape="rounded"
        className="pointer-events-none relative z-10 size-10 rounded-md bg-forge-teal/10 ring-1 ring-border/50"
        fallbackClassName="bg-forge-teal/10 text-foreground"
        loading="eager"
      />
      <div className="pointer-events-none relative z-10 min-w-0 flex-1">
        <p className="truncate font-bold text-ink text-sm leading-tight">
          {group.name}
        </p>
        <p className="truncate font-semibold text-slate-muted text-xs leading-tight">
          {headerState.memberCount} {headerState.memberLabel}
        </p>
      </div>
    </div>
  );
}

function MobileGroupCoverCloseButton({
  isMobile,
  onClose,
}: {
  isMobile: boolean;
  onClose: () => void;
}) {
  if (!isMobile) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="pointer-events-auto absolute top-3 right-3 z-20 rounded-full border-0 bg-ink/35 p-0 text-white backdrop-blur-sm hover:bg-ink/55"
          aria-label="Close group panel"
        >
          <X className="size-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Close group panel</TooltipContent>
    </Tooltip>
  );
}
