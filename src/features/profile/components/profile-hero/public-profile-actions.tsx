import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  MessageCircle,
  UserCheck,
  UserMinus,
  UserRoundPlus,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { usePublicProfileActions } from "@/features/profile/hooks/use-public-profile-actions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import type { User } from "@/shared/schemas";

interface PublicProfileActionsProps {
  spotlightConnect?: boolean;
  user: User;
}

export function PublicProfileActions({
  spotlightConnect = false,
  user,
}: PublicProfileActionsProps) {
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    isOnline,
    messageChatId,
    messageDisabled,
    onConnect,
    unfriendLoading,
    onUnfriend,
    withdrawLoading,
    onWithdraw,
    isViewerProfile,
  } = usePublicProfileActions(user);
  const ConnectIcon = getConnectIcon(connectLabel);
  const shouldSpotlightConnect =
    spotlightConnect &&
    !isViewerProfile &&
    (connectLabel === "Connect" || connectLabel === "Accept");

  useEffect(() => {
    if (!shouldSpotlightConnect || !connectButtonRef.current) {
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => {
      const button = connectButtonRef.current;

      if (!button || button.getClientRects().length === 0) {
        return;
      }

      button.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      button.focus({ preventScroll: true });
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, [shouldSpotlightConnect]);

  if (isViewerProfile) {
    return (
      <div className="grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link to="/profile">Edit Profile</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3">
      {connectLabel === "Connected" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              className="w-full shrink-0 sm:w-auto"
              variant="outline"
              disabled={unfriendLoading}
              loading={unfriendLoading}
              aria-label="Manage connection"
            >
              <ConnectIcon className="shrink-0" />
              <span>Connected</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={() => onUnfriend()}
            >
              <UserMinus className="mr-2 size-4" />
              <span>Remove Connection</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : connectLabel === "Requested" ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="w-full shrink-0 sm:w-auto"
              loading={withdrawLoading}
              aria-label="Manage connection request"
            >
              <ConnectIcon className="shrink-0" />
              <span>Requested</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              className="text-destructive focus:bg-destructive/10"
              onClick={() => onWithdraw()}
            >
              <UserMinus className="mr-2 size-4" />
              <span>Cancel Request</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          ref={connectButtonRef}
          className={cn(
            "w-full shrink-0 sm:w-auto",
            shouldSpotlightConnect &&
              "shadow-lg shadow-spark-amber/20 ring-2 ring-spark-amber ring-offset-2 ring-offset-canvas",
          )}
          disabled={connectDisabled}
          loading={connectLoading}
          onClick={() => onConnect()}
          aria-label={`${connectLabel} with ${user.name}`}
          title={
            isOnline ? undefined : "Reconnect before changing connections."
          }
          data-connect-intent={shouldSpotlightConnect ? "true" : undefined}
        >
          <ConnectIcon className="shrink-0" />
          <span>{connectLabel}</span>
        </Button>
      )}
      {messageChatId ? (
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link
            {...buildActivityDmNavigation(messageChatId)}
            aria-label={`Message ${user.name}`}
          >
            <MessageCircle className="shrink-0" />
            <span>Message</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          disabled={messageDisabled}
          aria-label={`Message ${user.name}`}
        >
          <MessageCircle className="shrink-0" />
          <span>Message</span>
        </Button>
      )}
    </div>
  );
}

function getConnectIcon(label: string) {
  if (label === "Accept" || label === "Connected") {
    return UserCheck;
  }

  if (label === "Requested") {
    return CircleDashed;
  }

  if (label === "Blocked") {
    return Ban;
  }

  return UserRoundPlus;
}
