import { Link } from "@tanstack/react-router";
import type { ActivityParticipant } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import {
  getParticipantDisplayName,
  getParticipantInitials,
} from "../participant-display";
import { senderAvatarTriggerClassName } from "./classnames";
import type { SenderAvatarSlotProps, SenderProfileTriggerProps } from "./types";

export function SenderAvatarSlot({
  onShowParticipantProfile,
  sender,
  shouldShowSenderAvatar,
}: SenderAvatarSlotProps) {
  if (!shouldShowSenderAvatar || !sender) {
    return null;
  }

  return (
    <div className="flex w-8 shrink-0 flex-col justify-end">
      <div className="sticky bottom-2 flex flex-col items-center">
        <SenderProfileTrigger
          onShowParticipantProfile={onShowParticipantProfile}
          sender={sender}
        />
      </div>
    </div>
  );
}

function SenderProfileTrigger({
  onShowParticipantProfile,
  sender,
}: SenderProfileTriggerProps) {
  const displayName = getParticipantDisplayName(sender);

  if (onShowParticipantProfile) {
    return (
      <button
        type="button"
        className={senderAvatarTriggerClassName}
        aria-label={`Open ${displayName} details`}
        onClick={() => onShowParticipantProfile(sender)}
      >
        <SenderAvatar sender={sender} />
      </button>
    );
  }

  return (
    <Link
      {...buildProfileNavigation(sender.id)}
      className={senderAvatarTriggerClassName}
      aria-label={`View ${displayName}'s profile`}
    >
      <SenderAvatar sender={sender} />
    </Link>
  );
}

function SenderAvatar({ sender }: { sender: ActivityParticipant }) {
  return (
    <Avatar
      src={sender.avatar}
      name={getParticipantDisplayName(sender)}
      fallback={getParticipantInitials(sender)}
      className="size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
      fallbackClassName="text-muted-foreground"
    />
  );
}
