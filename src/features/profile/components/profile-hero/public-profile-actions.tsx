import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  MessageCircle,
  UserCheck,
  UserMinus,
  UserRoundPlus,
} from "lucide-react";
import { type RefObject, useEffect, useRef } from "react";
import { usePublicProfileActions } from "@/features/profile/public/public-profile-actions";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { buildActivityDmNavigation } from "@/shared/navigation/activity-navigation";
import type { User } from "@/shared/schemas";

interface PublicProfileActionsProps {
  spotlightConnect?: boolean;
  user: User;
}

type PublicProfileActionState = ReturnType<typeof usePublicProfileActions>;

const CONNECT_SPOTLIGHT_LABELS = new Set(["Connect", "Accept"]);
const PROFILE_ACTION_GROUP_CLASS_NAME =
  "grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3";

export function PublicProfileActions({
  spotlightConnect = false,
  user,
}: PublicProfileActionsProps) {
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionState = usePublicProfileActions(user);
  const shouldSpotlightConnect = getShouldSpotlightConnect({
    connectLabel: actionState.connectLabel,
    isViewerProfile: actionState.isViewerProfile,
    spotlightConnect,
  });

  useSpotlightConnectButton(connectButtonRef, shouldSpotlightConnect);

  if (actionState.isViewerProfile) {
    return <ViewerProfileActions />;
  }

  return (
    <div className={PROFILE_ACTION_GROUP_CLASS_NAME}>
      <ConnectionAction
        actionState={actionState}
        connectButtonRef={connectButtonRef}
        shouldSpotlightConnect={shouldSpotlightConnect}
        user={user}
      />
      <MessageAction actionState={actionState} user={user} />
    </div>
  );
}

function ViewerProfileActions() {
  return (
    <div className={PROFILE_ACTION_GROUP_CLASS_NAME}>
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link to="/profile">Edit Profile</Link>
      </Button>
    </div>
  );
}

interface ConnectionActionProps {
  actionState: PublicProfileActionState;
  connectButtonRef: RefObject<HTMLButtonElement | null>;
  shouldSpotlightConnect: boolean;
  user: User;
}

function ConnectionAction({
  actionState,
  connectButtonRef,
  shouldSpotlightConnect,
  user,
}: ConnectionActionProps) {
  if (actionState.connectLabel === "Connected") {
    return <ConnectedConnectionMenu actionState={actionState} />;
  }

  if (actionState.connectLabel === "Requested") {
    return <RequestedConnectionMenu actionState={actionState} />;
  }

  return (
    <Button
      ref={connectButtonRef}
      className={cn(
        "w-full shrink-0 sm:w-auto",
        shouldSpotlightConnect &&
          "shadow-lg shadow-spark-amber/20 ring-2 ring-spark-amber ring-offset-2 ring-offset-canvas",
      )}
      disabled={actionState.connectDisabled}
      loading={actionState.connectLoading}
      onClick={() => actionState.onConnect()}
      aria-label={`${actionState.connectLabel} with ${user.name}`}
      title={
        actionState.isOnline
          ? undefined
          : "Reconnect before changing connections."
      }
      data-connect-intent={shouldSpotlightConnect ? "true" : undefined}
    >
      <ConnectionActionIcon label={actionState.connectLabel} />
      <span>{actionState.connectLabel}</span>
    </Button>
  );
}

function ConnectionActionIcon({ label }: { label: string }) {
  if (label === "Accept" || label === "Connected") {
    return <UserCheck className="shrink-0" aria-hidden="true" />;
  }

  if (label === "Requested") {
    return <CircleDashed className="shrink-0" aria-hidden="true" />;
  }

  if (label === "Blocked") {
    return <Ban className="shrink-0" aria-hidden="true" />;
  }

  return <UserRoundPlus className="shrink-0" aria-hidden="true" />;
}

function ConnectedConnectionMenu({
  actionState,
}: {
  actionState: PublicProfileActionState;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className="w-full shrink-0 sm:w-auto"
          variant="outline"
          disabled={actionState.unfriendLoading}
          loading={actionState.unfriendLoading}
          aria-label="Manage connection"
        >
          <ConnectionActionIcon label="Connected" />
          <span>Connected</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10"
          onClick={() => actionState.onUnfriend()}
        >
          <UserMinus className="mr-2 size-4" />
          <span>Remove Connection</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RequestedConnectionMenu({
  actionState,
}: {
  actionState: PublicProfileActionState;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full shrink-0 sm:w-auto"
          loading={actionState.withdrawLoading}
          aria-label="Manage connection request"
        >
          <ConnectionActionIcon label="Requested" />
          <span>Requested</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          className="text-destructive focus:bg-destructive/10"
          onClick={() => actionState.onWithdraw()}
        >
          <UserMinus className="mr-2 size-4" />
          <span>Cancel Request</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MessageAction({
  actionState,
  user,
}: {
  actionState: PublicProfileActionState;
  user: User;
}) {
  if (actionState.messageChatId) {
    return (
      <Button asChild variant="outline" className="w-full sm:w-auto">
        <Link
          {...buildActivityDmNavigation(actionState.messageChatId)}
          aria-label={`Message ${user.name}`}
        >
          <MessageCircle className="shrink-0" />
          <span>Message</span>
        </Link>
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      className="w-full sm:w-auto"
      disabled={actionState.messageDisabled}
      aria-label={`Message ${user.name}`}
    >
      <MessageCircle className="shrink-0" />
      <span>Message</span>
    </Button>
  );
}

function useSpotlightConnectButton(
  connectButtonRef: RefObject<HTMLButtonElement | null>,
  shouldSpotlightConnect: boolean,
) {
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
  }, [connectButtonRef, shouldSpotlightConnect]);
}

function getShouldSpotlightConnect({
  connectLabel,
  isViewerProfile,
  spotlightConnect,
}: {
  connectLabel: string;
  isViewerProfile: boolean;
  spotlightConnect: boolean;
}) {
  return (
    spotlightConnect &&
    !isViewerProfile &&
    isConnectSpotlightLabel(connectLabel)
  );
}

function isConnectSpotlightLabel(label: string) {
  return CONNECT_SPOTLIGHT_LABELS.has(label);
}
