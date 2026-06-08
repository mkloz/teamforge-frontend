import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  ExternalLink,
  UserCheck,
  UserMinus,
  UserRoundPlus,
} from "lucide-react";
import type { GroupPlanDetailMember } from "@/features/group-plan-detail/lib/group-plan-detail-contract";
import { usePublicProfileActions } from "@/features/profile/hooks/use-public-profile-actions";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

const memberActionClassName =
  "flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-80 transition-colors duration-150 hover:bg-forge-teal/10 hover:text-forge-teal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/30 group-hover:opacity-100";

export function MemberAction({ member }: { member: GroupPlanDetailMember }) {
  if (member.knownConnection) {
    return <KnownConnectionAction member={member} />;
  }

  return <ConnectMemberAction member={member} />;
}

function KnownConnectionAction({ member }: { member: GroupPlanDetailMember }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          {...buildProfileNavigation(member.userId)}
          className={memberActionClassName}
          aria-label={`Open ${member.name}'s profile`}
        >
          <ExternalLink className="size-4" />
        </Link>
      </TooltipTrigger>
      <TooltipContent side="top">Open {member.name}'s profile</TooltipContent>
    </Tooltip>
  );
}

function ConnectMemberAction({ member }: { member: GroupPlanDetailMember }) {
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    onConnect,
    unfriendLoading,
    onUnfriend,
    withdrawLoading,
    onWithdraw,
  } = usePublicProfileActions({ id: member.userId });
  const canConnect = !connectDisabled && !connectLoading;
  const connectTooltip = getConnectTooltip(connectLabel, member.name);

  if (connectLabel === "Connected") {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                loading={unfriendLoading}
                className={memberActionClassName}
                aria-label="Manage connection"
              >
                <ConnectIcon label={connectLabel} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">{connectTooltip}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onUnfriend();
            }}
          >
            <UserMinus className="mr-2 size-4" />
            <span>Remove Connection</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (connectLabel === "Requested") {
    return (
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                loading={withdrawLoading}
                className={memberActionClassName}
                aria-label="Manage connection request"
              >
                <ConnectIcon label={connectLabel} />
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">{connectTooltip}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            className="text-destructive focus:bg-destructive/10"
            onClick={(e) => {
              e.stopPropagation();
              onWithdraw();
            }}
          >
            <UserMinus className="mr-2 size-4" />
            <span>Cancel Request</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          loading={connectLoading}
          className={cn(
            memberActionClassName,
            !canConnect &&
              "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-foreground",
          )}
          aria-disabled={!canConnect}
          aria-label={connectTooltip}
          onClick={(event) => {
            event.stopPropagation();

            if (canConnect) {
              onConnect();
            }
          }}
        >
          <ConnectIcon label={connectLabel} />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top">{connectTooltip}</TooltipContent>
    </Tooltip>
  );
}

function ConnectIcon({ label }: { label: string }) {
  if (label === "Accept" || label === "Connected") {
    return <UserCheck className="size-4" />;
  }

  if (label === "Requested") {
    return <CircleDashed className="size-4" />;
  }

  if (label === "Blocked") {
    return <Ban className="size-4" />;
  }

  return <UserRoundPlus className="size-4" />;
}

function getConnectTooltip(label: string, memberName: string) {
  if (label === "Accept") {
    return `Accept ${memberName}'s request`;
  }

  if (label === "Requested") {
    return `Request sent to ${memberName}`;
  }

  if (label === "Connected") {
    return `Connected with ${memberName}`;
  }

  if (label === "Blocked") {
    return `${memberName} is blocked`;
  }

  return `Connect with ${memberName}`;
}
