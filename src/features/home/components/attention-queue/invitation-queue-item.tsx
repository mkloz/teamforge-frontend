import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, X } from "lucide-react";

import { buildGroupPlanDetailNavigation } from "@/features/group-plan-detail/lib/group-plan-detail-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

import type { AttentionQueueInvitation } from "./attention-queue.types";

interface InvitationQueueItemProps {
  invite: AttentionQueueInvitation;
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
  invite,
  isAccepting,
  isDeclining,
  isFocused,
  onAccept,
  onDecline,
}: InvitationQueueItemProps) {
  const detailsNavigation = buildGroupPlanDetailNavigation(invite.group.id, {
    source: "invite",
  });

  return (
    <li
      className={cn(
        "group flex min-w-0 items-center gap-3 border-border/55 border-b px-1 py-4 transition-colors duration-150 last:border-b-0 sm:px-3",
        isFocused ? "bg-forge-teal/8" : "hover:bg-forge-teal/5",
      )}
    >
      <Link
        {...detailsNavigation}
        aria-label={`Review invitation to ${invite.group.name}`}
        className="flex min-w-0 flex-1 items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={invite.group.avatar}
          name={invite.group.name}
          className="size-11 shrink-0 border border-border/60 bg-canvas"
          fallbackClassName="text-xs"
        />
        <div className="min-w-0 flex-1">
          <p className="line-clamp-1 font-black text-foreground text-sm transition-colors duration-150 group-hover:text-forge-teal">
            {invite.group.name}
          </p>
          <p className="mt-1 line-clamp-2 font-medium text-muted-foreground text-xs leading-relaxed">
            {invite.inviter?.name ?? "Someone"} invited you.{" "}
            {invite.group.activeMembersCount} people inside.
          </p>
        </div>
        <ArrowRight
          className="mt-1 size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-150 group-hover:translate-x-0.5 group-hover:opacity-70"
          aria-hidden="true"
        />
      </Link>
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
    </li>
  );
}
