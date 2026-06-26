import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  type LucideIcon,
  MessageCircle,
  UserCheck,
  UserMinus,
  UserRoundPlus,
} from "lucide-react";
import { type ReactNode, type RefObject, useEffect, useRef } from "react";
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

type PublicProfileActionState = ReturnType<typeof usePublicProfileActions>;
type ManagedConnectionLabel = "Connected" | "Requested";
type ManagedConnectionMenu = (props: {
  actionState: PublicProfileActionState;
  ConnectIcon: LucideIcon;
}) => ReactNode;

const CONNECT_SPOTLIGHT_LABELS = new Set(["Connect", "Accept"]);
const CONNECT_ICON_BY_LABEL = new Map<string, LucideIcon>([
  ["Accept", UserCheck],
  ["Connected", UserCheck],
  ["Requested", CircleDashed],
  ["Blocked", Ban],
]);
const PROFILE_ACTION_GROUP_CLASS_NAME =
  "grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3";
const MANAGED_CONNECTION_MENUS = {
  Connected: ConnectedConnectionMenu,
  Requested: RequestedConnectionMenu,
} satisfies Record<ManagedConnectionLabel, ManagedConnectionMenu>;

export function PublicProfileActions({
  spotlightConnect = false,
  user,
}: PublicProfileActionsProps) {
  const connectButtonRef = useRef<HTMLButtonElement | null>(null);
  const actionState = usePublicProfileActions(user);
  const ConnectIcon = getConnectIcon(actionState.connectLabel);
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
        ConnectIcon={ConnectIcon}
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
  ConnectIcon: LucideIcon;
  connectButtonRef: RefObject<HTMLButtonElement | null>;
  shouldSpotlightConnect: boolean;
  user: User;
}

function ConnectionAction({
  actionState,
  ConnectIcon,
  connectButtonRef,
  shouldSpotlightConnect,
  user,
}: ConnectionActionProps) {
  const ManagedConnectionMenu = getManagedConnectionMenu(
    actionState.connectLabel,
  );

  if (ManagedConnectionMenu) {
    return (
      <ManagedConnectionMenu
        ConnectIcon={ConnectIcon}
        actionState={actionState}
      />
    );
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
      <ConnectIcon className="shrink-0" />
      <span>{actionState.connectLabel}</span>
    </Button>
  );
}

function ConnectedConnectionMenu({
  actionState,
  ConnectIcon,
}: {
  actionState: PublicProfileActionState;
  ConnectIcon: LucideIcon;
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
          <ConnectIcon className="shrink-0" />
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
  ConnectIcon,
}: {
  actionState: PublicProfileActionState;
  ConnectIcon: LucideIcon;
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
          <ConnectIcon className="shrink-0" />
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

function getManagedConnectionMenu(label: string) {
  if (!isManagedConnectionLabel(label)) {
    return null;
  }

  return MANAGED_CONNECTION_MENUS[label];
}

function isManagedConnectionLabel(
  label: string,
): label is ManagedConnectionLabel {
  return label === "Connected" || label === "Requested";
}

function getConnectIcon(label: string) {
  return CONNECT_ICON_BY_LABEL.get(label) ?? UserRoundPlus;
}
