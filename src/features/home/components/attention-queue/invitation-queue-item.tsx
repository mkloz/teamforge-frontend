import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";

import type { AttentionQueueInvitation } from "./attention-queue.types";
import { AttentionQueueItemActions } from "./attention-queue-item-actions";
import { AttentionQueueMetaList } from "./attention-queue-meta-list";
import {
  getInvitationQueueItemRenderState,
  type InvitationQueueItemState,
} from "./invitation-queue-item-render-state";

interface InvitationQueueItemProps {
  invite: AttentionQueueInvitation;
  state: InvitationQueueItemState;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function InvitationQueueItem({
  invite,
  onAccept,
  onDecline,
  state,
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
    invite,
    state,
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
              {getInvitationQueueDescription(invite)}
            </p>
            <AttentionQueueMetaList items={inviteMeta} />
          </div>
        </Link>
        <AttentionQueueItemActions
          accept={{
            ariaLabel: getInvitationAcceptLabel(invite),
            disabled: acceptButtonDisabled,
            label: invite.type === "JOIN_REQUEST" ? "Approve" : "Join",
            loading: acceptButtonLoading,
            onClick: () => void onAccept(invite.id),
            title: acceptButtonTitle,
          }}
          decline={{
            ariaLabel: getInvitationDeclineLabel(invite),
            disabled: declineButtonDisabled,
            loading: declineButtonLoading,
            onClick: () => void onDecline(invite.id),
            title: declineButtonTitle,
          }}
        />
      </div>
    </li>
  );
}

function getInvitationQueueDescription(invite: AttentionQueueInvitation) {
  if (invite.type === "JOIN_REQUEST") {
    return "A request to join this group needs review.";
  }

  return `${invite.inviter?.name ?? "Someone"} invited you to join.`;
}

function getInvitationAcceptLabel(invite: AttentionQueueInvitation) {
  return invite.type === "JOIN_REQUEST"
    ? `Approve request to join ${invite.group.name}`
    : `Join ${invite.group.name}`;
}

function getInvitationDeclineLabel(invite: AttentionQueueInvitation) {
  return invite.type === "JOIN_REQUEST"
    ? `Decline request to join ${invite.group.name}`
    : `Decline invitation to ${invite.group.name}`;
}
