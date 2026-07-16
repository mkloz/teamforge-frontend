import { Link } from "@tanstack/react-router";
import { ArrowRight, UserPlus } from "lucide-react";

import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";
import { AttentionQueueItemActions } from "./attention-queue-item-actions";
import { AttentionQueueMetaList } from "./attention-queue-meta-list";
import {
  type FriendRequestQueueItemState,
  getFriendRequestQueueItemRenderState,
} from "./friend-request-queue-item-render-state";

interface FriendRequestQueueItemProps {
  request: AttentionQueueFriendRequest;
  state: FriendRequestQueueItemState;
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
}

export function FriendRequestQueueItem({
  onAccept,
  onDecline,
  request,
  state,
}: FriendRequestQueueItemProps) {
  const {
    acceptButtonDisabled,
    acceptButtonLoading,
    actionButtonTitle,
    declineButtonDisabled,
    declineButtonLoading,
    firstName,
    profileNavigation,
    requestMeta,
    rowClassName,
  } = getFriendRequestQueueItemRenderState({
    request,
    state,
  });

  return (
    <li className={rowClassName}>
      <div className="flex min-w-0 items-center justify-between gap-3">
        <Link
          {...profileNavigation}
          className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <AvatarWithBadge
            src={request.counterpart.avatar}
            name={request.counterpart.name}
            fallback={<UserPlus className="size-4 text-muted-foreground" />}
            imageSize={96}
            avatarClassName="size-10 border-border/60"
            icon={UserPlus}
            badgeTone="teal"
          />
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <p className="truncate font-bold text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
                {request.counterpart.name}
              </p>
              <ArrowRight
                className="size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition duration-150 group-focus-within:translate-x-0.5 group-focus-within:text-forge-teal group-focus-within:opacity-100 group-hover:translate-x-0.5 group-hover:text-forge-teal group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 truncate font-medium text-muted-foreground text-xs">
              {firstName} wants to connect with you.
            </p>
            <AttentionQueueMetaList items={requestMeta} />
          </div>
        </Link>
        <AttentionQueueItemActions
          accept={{
            ariaLabel: `Accept ${request.counterpart.name}'s friend request`,
            disabled: acceptButtonDisabled,
            label: "Accept",
            loading: acceptButtonLoading,
            onClick: () => void onAccept(request.requesterId),
            title: actionButtonTitle,
          }}
          decline={{
            ariaLabel: `Decline ${request.counterpart.name}'s friend request`,
            disabled: declineButtonDisabled,
            loading: declineButtonLoading,
            onClick: () => void onDecline(request.requesterId),
            title: actionButtonTitle,
          }}
        />
      </div>
    </li>
  );
}
