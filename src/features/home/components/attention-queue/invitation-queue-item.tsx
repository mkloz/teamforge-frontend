import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";

import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";

import type { AttentionQueueInvitation } from "./attention-queue.types";
import { AttentionQueueMeta } from "./attention-queue-meta";
import { getInvitationQueueItemRenderState } from "./invitation-queue-item-render-state";

interface InvitationQueueItemProps {
  invite: AttentionQueueInvitation;
  isFocused: boolean;
  acceptingInviteId: string | null;
  decliningInviteId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isOnline: boolean;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function InvitationQueueItem({
  acceptingInviteId,
  decliningInviteId,
  invite,
  isAccepting,
  isDeclining,
  isFocused,
  isOnline,
  onAccept,
  onDecline,
}: InvitationQueueItemProps) {
  const {
    acceptButtonDisabled,
    acceptButtonLoading,
    acceptButtonTitle,
    declineButtonDisabled,
    declineButtonLoading,
    declineButtonTitle,
    detailsNavigation,
    InviteBadgeIcon,
    inviteMeta,
    rowClassName,
  } = getInvitationQueueItemRenderState({
    acceptingInviteId,
    decliningInviteId,
    invite,
    isAccepting,
    isDeclining,
    isFocused,
    isOnline,
  });

  return (
    <li className={rowClassName}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link
          {...detailsNavigation}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AvatarWithBadge
            src={invite.group.avatar}
            name={invite.group.name}
            imageSize={96}
            avatarShape="rounded"
            avatarClassName="size-10 border-border/60"
            fallbackClassName="text-xs"
            icon={InviteBadgeIcon}
            badgeTone="teal"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-bold text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
                {invite.group.name}
              </p>
              <ArrowRight
                className="size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition duration-150 group-focus-within:translate-x-0.5 group-focus-within:text-forge-teal group-focus-within:opacity-100 group-hover:translate-x-0.5 group-hover:text-forge-teal group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 truncate font-medium text-muted-foreground text-xs">
              {invite.inviter?.name ?? "Someone"} invited you to join.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              {inviteMeta.map((item) => (
                <AttentionQueueMeta key={item.label} icon={item.icon}>
                  {item.label}
                </AttentionQueueMeta>
              ))}
            </div>
          </div>
        </Link>
        <div className="flex shrink-0 items-center justify-end gap-1.5">
          <Button
            size="icon-xs"
            className="sm:w-auto sm:px-3"
            loading={acceptButtonLoading}
            disabled={acceptButtonDisabled}
            onClick={() => void onAccept(invite.id)}
            aria-label={`Join ${invite.group.name}`}
            title={acceptButtonTitle}
          >
            <Check className="size-3" />
            <span className="hidden sm:inline">Join</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            loading={declineButtonLoading}
            disabled={declineButtonDisabled}
            onClick={() => void onDecline(invite.id)}
            aria-label={`Decline invitation to ${invite.group.name}`}
            title={declineButtonTitle}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
