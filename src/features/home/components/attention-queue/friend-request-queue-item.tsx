import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, UserPlus, X } from "lucide-react";

import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";
import { getAttentionQueueItemMotion } from "./attention-queue-motion";

interface FriendRequestQueueItemProps {
  request: AttentionQueueFriendRequest;
  isFocused: boolean;
  acceptingRequestId: string | null;
  animateOnInsert: boolean;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
}

export function FriendRequestQueueItem({
  acceptingRequestId,
  animateOnInsert,
  decliningRequestId,
  isAccepting,
  isDeclining,
  isFocused,
  onAccept,
  onDecline,
  request,
}: FriendRequestQueueItemProps) {
  const profileNavigation = buildProfileNavigation(request.counterpart.id);
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.li
      {...getAttentionQueueItemMotion({ animateOnInsert, shouldReduceMotion })}
      className={cn(
        "group flex min-w-0 items-center gap-3 border-border/55 border-b px-1 py-4 transition-colors duration-150 last:border-b-0 sm:px-3",
        isFocused ? "bg-forge-teal/8" : "hover:bg-forge-teal/5",
      )}
    >
      <Link
        {...profileNavigation}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={request.counterpart.avatar}
          name={request.counterpart.name}
          fallback={<UserPlus className="size-4 text-muted-foreground" />}
          imageSize={96}
          className="size-11 shrink-0 border border-border/60 bg-canvas"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate font-black text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
              {request.counterpart.name}
            </p>
            {request.counterpart.personalityType ? (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 font-black text-muted-foreground text-xs">
                {request.counterpart.personalityType}
              </span>
            ) : null}
            <ArrowRight
              className="size-3.5 shrink-0 text-muted-foreground/70 opacity-0 transition duration-150 group-focus-within:translate-x-0.5 group-focus-within:text-forge-teal group-focus-within:opacity-100 group-hover:translate-x-0.5 group-hover:text-forge-teal group-hover:opacity-100"
              aria-hidden="true"
            />
          </div>
          <p className="mt-1 line-clamp-2 font-medium text-muted-foreground text-xs leading-relaxed">
            {getFirstName(request.counterpart.name)} wants to connect.
          </p>
        </div>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="xs"
          loading={acceptingRequestId === request.requesterId}
          disabled={isAccepting || isDeclining}
          onClick={() => void onAccept(request.requesterId)}
        >
          <Check className="size-3" />
          Accept
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          loading={decliningRequestId === request.requesterId}
          disabled={isAccepting || isDeclining}
          onClick={() => void onDecline(request.requesterId)}
          aria-label={`Decline ${request.counterpart.name}'s friend request`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </motion.li>
  );
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
