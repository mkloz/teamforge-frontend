import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  MessageCircle,
  UserCheck,
  UserRoundPlus,
} from "lucide-react";
import { buildActivityDmNavigation } from "@/features/activity/lib/activity-route";
import { usePublicProfileActions } from "@/features/profile/hooks/use-public-profile-actions";
import { Button } from "@/shared/components/ui/button";
import type { User } from "@/shared/schemas";

interface PublicProfileActionsProps {
  user: User;
}

export function PublicProfileActions({ user }: PublicProfileActionsProps) {
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    isOnline,
    messageChatId,
    messageDisabled,
    onConnect,
  } = usePublicProfileActions(user);
  const ConnectIcon = getConnectIcon(connectLabel);

  return (
    <div className="grid w-full grid-cols-1 xxs:grid-cols-2 items-center gap-2 pr-0 sm:flex sm:w-auto sm:flex-row sm:gap-3">
      <Button
        className="w-full shrink-0 sm:w-auto"
        disabled={connectDisabled}
        loading={connectLoading}
        onClick={() => onConnect()}
        aria-label={`${connectLabel} with ${user.name}`}
        title={isOnline ? undefined : "Reconnect before changing connections."}
      >
        <ConnectIcon className="shrink-0" />
        <span>{connectLabel}</span>
      </Button>
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
