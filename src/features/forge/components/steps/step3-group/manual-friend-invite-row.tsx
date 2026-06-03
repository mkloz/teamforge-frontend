import { Link } from "@tanstack/react-router";
import { Check, MapPin, Plus, ShieldCheck, Sparkles } from "lucide-react";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { FriendshipApi } from "@/shared/schemas";
import { formatTrustScore } from "./step3-group.utils";

interface ManualFriendInviteRowProps {
  disabled?: boolean;
  friendship: FriendshipApi;
  onToggle: (userId: string) => void;
  selected: boolean;
}

export function ManualFriendInviteRow({
  disabled = false,
  friendship,
  onToggle,
  selected,
}: ManualFriendInviteRowProps) {
  const friend = friendship.counterpart;
  const trustScore = formatTrustScore(friend.trustScore);

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-3 overflow-hidden rounded-2xl border bg-card p-3 text-left transition-all duration-200",
        selected
          ? "border-forge-teal/40 bg-forge-teal/8 ring-1 ring-forge-teal/20"
          : "border-border/45 hover:border-forge-teal/25 hover:bg-forge-teal/4",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Link
        {...buildProfileNavigation(friend.id)}
        aria-label={`View ${friend.name}'s profile`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45"
      >
        <div
          className={cn(
            "rounded-full p-0.5 transition-colors duration-200",
            selected ? "bg-forge-teal/18" : "bg-muted/45",
          )}
        >
          <Avatar
            src={friend.avatar}
            name={friend.name}
            className="size-12 border border-background/70 transition-transform group-hover:scale-105"
          >
            {friend.onlineStatus ? (
              <AvatarStatus
                status={friend.onlineStatus}
                borderClassName="border-card"
                sizeClassName="size-3.5"
              />
            ) : null}
          </Avatar>
        </div>

        <span className="flex min-w-0 flex-1 flex-col gap-2">
          <span
            className={cn(
              "truncate font-bold text-base leading-tight transition-colors",
              selected
                ? "text-forge-teal"
                : "text-foreground group-hover:text-forge-teal",
            )}
          >
            {friend.name}
          </span>

          <span className="flex min-w-0 flex-wrap items-center gap-1.5">
            {friend.city && (
              <StatusPill
                icon={MapPin}
                tone="neutral"
                className="max-w-32 bg-muted/35 font-medium"
                iconClassName="shrink-0"
              >
                <span className="truncate">{friend.city}</span>
              </StatusPill>
            )}
            {friend.personalityType && (
              <StatusPill
                icon={Sparkles}
                tone="teal"
                className="border-forge-teal/15 bg-forge-teal/7 font-semibold"
              >
                {friend.personalityType}
              </StatusPill>
            )}
            <StatusPill
              icon={ShieldCheck}
              tone="amber"
              className="border-spark-amber/18 bg-spark-amber/8 font-semibold"
            >
              Trust {trustScore}
            </StatusPill>
          </span>
        </span>
      </Link>

      <Button
        type="button"
        variant={selected ? "primary" : "subtle"}
        size="xs"
        disabled={disabled}
        onClick={() => onToggle(friend.id)}
        className={cn(
          "shrink-0 rounded-full px-3",
          selected
            ? "border-forge-teal bg-forge-teal text-white"
            : "border border-border/55 bg-background/60 text-muted-foreground hover:enabled:border-forge-teal/35 hover:enabled:bg-forge-teal/8 hover:enabled:text-forge-teal",
        )}
        aria-label={`${selected ? "Remove" : "Invite"} ${friend.name}`}
      >
        {selected ? (
          <>
            <Check size={14} aria-hidden="true" />
            Added
          </>
        ) : (
          <>
            <Plus size={14} aria-hidden="true" />
            Add
          </>
        )}
      </Button>
    </div>
  );
}
