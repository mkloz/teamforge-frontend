import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { AttentionQueueInvitation } from "./attention-queue.types";

interface InvitationQueueItemProps {
  invite: AttentionQueueInvitation;
  index: number;
  isFocused: boolean;
  acceptingInviteId: string | null;
  decliningInviteId: string | null;
  isAccepting: boolean;
  isDeclining: boolean;
  onAccept: (inviteId: string) => Promise<void>;
  onDecline: (inviteId: string) => Promise<void>;
}

export function InvitationQueueItem({
  acceptingInviteId,
  decliningInviteId,
  index,
  invite,
  isAccepting,
  isDeclining,
  isFocused,
  onAccept,
  onDecline,
}: InvitationQueueItemProps) {
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
          src={invite.group.avatar}
          name={invite.group.name}
          className="size-11 shrink-0 border border-border/60 bg-canvas"
          fallbackClassName="text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 text-sm font-black text-foreground">
            {invite.group.name}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed font-medium text-muted-foreground">
            {invite.inviter?.name ?? "Someone"} invited you.{" "}
            {invite.group.activeMembersCount} people inside.
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="xs"
          className="px-3 text-xs"
          loading={acceptingInviteId === invite.id}
          disabled={isAccepting || isDeclining}
          onClick={() => void onAccept(invite.id)}
        >
          <Check className="size-3" />
          Join
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="icon-xs"
          className="size-11 rounded-lg sm:size-8"
          loading={decliningInviteId === invite.id}
          disabled={isAccepting || isDeclining}
          onClick={() => void onDecline(invite.id)}
          aria-label={`Decline invitation to ${invite.group.name}`}
        >
          <X className="size-3.5" />
        </Button>
      </div>
    </motion.article>
  );
}
