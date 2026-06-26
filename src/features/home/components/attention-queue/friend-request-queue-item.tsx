import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, UserPlus, X } from "lucide-react";

import { AvatarWithBadge } from "@/shared/components/common/avatar-with-badge";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";
import { AttentionQueueMeta } from "./attention-queue-meta";
import { getFriendRequestQueueItemRenderState } from "./friend-request-queue-item-render-state";

interface FriendRequestQueueItemProps {
  request: AttentionQueueFriendRequest;
  isFocused: boolean;
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  isOnline: boolean;
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
}

export function FriendRequestQueueItem({
  acceptingRequestId,
  decliningRequestId,
  isAccepting,
  isDeclining,
  isFocused,
  isOnline,
  onAccept,
  onDecline,
  request,
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
    acceptingRequestId,
    decliningRequestId,
    isAccepting,
    isDeclining,
    isFocused,
    isOnline,
    request,
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
              {request.counterpart.personalityType ? (
                <StatusPill
                  tone="teal"
                  size="xs"
                  surface="soft"
                  className="text-micro"
                >
                  {request.counterpart.personalityType}
                </StatusPill>
              ) : null}
              <ArrowRight
                className="size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition duration-150 group-focus-within:translate-x-0.5 group-focus-within:text-forge-teal group-focus-within:opacity-100 group-hover:translate-x-0.5 group-hover:text-forge-teal group-hover:opacity-100"
                aria-hidden="true"
              />
            </div>
            <p className="mt-1 truncate font-medium text-muted-foreground text-xs">
              {firstName} wants to connect with you.
            </p>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1.5">
              {requestMeta.map((item) => (
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
            onClick={() => void onAccept(request.requesterId)}
            aria-label={`Accept ${request.counterpart.name}'s friend request`}
            title={actionButtonTitle}
          >
            <Check className="size-3" />
            <span className="hidden sm:inline">Accept</span>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="icon-xs"
            loading={declineButtonLoading}
            disabled={declineButtonDisabled}
            onClick={() => void onDecline(request.requesterId)}
            aria-label={`Decline ${request.counterpart.name}'s friend request`}
            title={actionButtonTitle}
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
