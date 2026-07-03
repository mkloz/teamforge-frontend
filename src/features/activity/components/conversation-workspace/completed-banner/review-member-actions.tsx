import { Link } from "@tanstack/react-router";
import {
  Ban,
  CircleDashed,
  ExternalLink,
  MessageCircle,
  UserCheck,
  UserRoundPlus,
} from "lucide-react";
import type { GroupMember } from "@/features/activity/lib/activity-contract";
import { usePublicProfileActions } from "@/features/profile/public/public-profile-actions";
import { Button } from "@/shared/components/ui/button";
import { buildActivityDmNavigation } from "@/shared/navigation/activity-navigation";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";

export function ReviewMemberActions({ member }: { member: GroupMember }) {
  const {
    connectDisabled,
    connectLabel,
    connectLoading,
    isOnline,
    messageChatId,
    messageDisabled,
    onConnect,
  } = usePublicProfileActions({ id: member.userId });
  const memberName = member.user?.name ?? "teammate";

  return (
    <div className="flex flex-wrap gap-2 sm:justify-end">
      <Button
        variant="subtle"
        size="xs"
        disabled={connectDisabled}
        loading={connectLoading}
        onClick={() => onConnect()}
        aria-label={`${connectLabel} with ${memberName}`}
        title={isOnline ? undefined : "Reconnect before changing connections."}
      >
        <ConnectActionIcon label={connectLabel} />
        <span>{connectLabel}</span>
      </Button>

      {messageChatId ? (
        <Button asChild variant="subtle" size="xs">
          <Link
            {...buildActivityDmNavigation(messageChatId)}
            aria-label={`Message ${memberName}`}
          >
            <MessageCircle className="size-3.5" />
            <span>Message</span>
          </Link>
        </Button>
      ) : (
        <Button
          variant="subtle"
          size="xs"
          disabled={messageDisabled}
          aria-label={`Message ${memberName}`}
        >
          <MessageCircle className="size-3.5" />
          <span>Message</span>
        </Button>
      )}

      <Button asChild variant="subtle" size="xs">
        <Link
          {...buildProfileNavigation(member.userId)}
          aria-label={`Open ${memberName}'s profile`}
        >
          <ExternalLink className="size-3.5" />
          <span>Profile</span>
        </Link>
      </Button>
    </div>
  );
}

function ConnectActionIcon({ label }: { label: string }) {
  if (label === "Accept" || label === "Connected") {
    return <UserCheck className="size-3.5" />;
  }

  if (label === "Requested") {
    return <CircleDashed className="size-3.5" />;
  }

  if (label === "Blocked") {
    return <Ban className="size-3.5" />;
  }

  return <UserRoundPlus className="size-3.5" />;
}
