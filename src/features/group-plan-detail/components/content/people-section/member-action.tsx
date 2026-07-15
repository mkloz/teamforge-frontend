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
import { usePublicProfileActions } from "@/features/profile/public/public-profile-actions";
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
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

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
  const managedAction = getManagedConnectionAction({
    connectLabel,
    onUnfriend,
    onWithdraw,
    unfriendLoading,
    withdrawLoading,
  });

  if (managedAction) {
    return (
      <ManagedConnectionAction
        {...managedAction}
        connectLabel={connectLabel}
        connectTooltip={connectTooltip}
      />
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

function getManagedConnectionAction({
  connectLabel,
  onUnfriend,
  onWithdraw,
  unfriendLoading,
  withdrawLoading,
}: {
  connectLabel: string;
  onUnfriend: () => void;
  onWithdraw: () => void;
  unfriendLoading: boolean;
  withdrawLoading: boolean;
}) {
  if (connectLabel === "Connected") {
    return {
      buttonAriaLabel: "Manage connection",
      itemLabel: "Remove connection",
      loading: unfriendLoading,
      onSelect: onUnfriend,
    };
  }

  if (connectLabel === "Requested") {
    return {
      buttonAriaLabel: "Manage connection request",
      itemLabel: "Cancel request",
      loading: withdrawLoading,
      onSelect: onWithdraw,
    };
  }

  return null;
}

function ManagedConnectionAction({
  buttonAriaLabel,
  connectLabel,
  connectTooltip,
  itemLabel,
  loading,
  onSelect,
}: {
  buttonAriaLabel: string;
  connectLabel: string;
  connectTooltip: string;
  itemLabel: string;
  loading: boolean;
  onSelect: () => void;
}) {
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              loading={loading}
              className={memberActionClassName}
              aria-label={buttonAriaLabel}
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
            onSelect();
          }}
        >
          <UserMinus className="mr-2 size-4" />
          <span>{itemLabel}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
