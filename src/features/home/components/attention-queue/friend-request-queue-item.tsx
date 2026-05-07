import { motion } from "framer-motion";
import { Check, UserPlus, X } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { AttentionQueueFriendRequest } from "./attention-queue.types";

interface FriendRequestQueueItemProps {
  request: AttentionQueueFriendRequest;
  index: number;
  isFocused: boolean;
  acceptingRequestId: string | null;
  decliningRequestId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: (requesterId: string) => Promise<void>;
  onDecline: (requesterId: string) => Promise<void>;
}

export function FriendRequestQueueItem({
  acceptingRequestId,
  decliningRequestId,
  index,
  isAccepting,
  isDeclining,
  isFocused,
  onAccept,
  onDecline,
  request,
}: FriendRequestQueueItemProps) {
  return (
    <motion.article
      role="listitem"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "flex min-w-0 items-center gap-3 border-b border-border/55 px-1 py-4 transition-colors duration-150 last:border-b-0 sm:px-3",
        isFocused ? "bg-forge-teal/8" : "hover:bg-forge-teal/5",
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Avatar
          src={request.counterpart.avatar}
          name={request.counterpart.name}
          fallback={<UserPlus className="size-4 text-muted-foreground" />}
          className="size-11 shrink-0 border border-border/60 bg-canvas"
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-2">
            <p className="truncate text-sm font-black text-foreground">
              {request.counterpart.name}
            </p>
            {request.counterpart.personalityType ? (
              <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-black text-muted-foreground">
                {request.counterpart.personalityType}
              </span>
            ) : null}
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-medium text-muted-foreground">
            {getFirstName(request.counterpart.name)} wants to connect.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="xs"
          className="h-11 px-3 text-xs sm:h-8"
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
          className="size-11 rounded-lg sm:size-8"
          loading={decliningRequestId === request.requesterId}
          disabled={isAccepting || isDeclining}
          onClick={() => void onDecline(request.requesterId)}
          aria-label={`Decline ${request.counterpart.name}'s friend request`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </motion.article>
  );
}

function getFirstName(name: string) {
  return name.trim().split(/\s+/)[0] ?? name;
}
