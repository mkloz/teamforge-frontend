import { Link } from "@tanstack/react-router";
import { Check, MapPin, Plus, ShieldCheck } from "lucide-react";
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
        "group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150",
        selected ? "bg-forge-teal/8" : "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      {/* Full-surface profile link behind everything */}
      <Link
        {...buildProfileNavigation(friend.id)}
        aria-label={`View ${friend.name}'s profile`}
        className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45"
      >
        <span className="sr-only">View {friend.name}'s profile</span>
      </Link>

      {/* Avatar */}
      <div className="relative shrink-0">
        <Avatar
          src={friend.avatar}
          name={friend.name}
          className={cn(
            "size-10 ring-1",
            selected ? "ring-2 ring-forge-teal/40" : "ring-border/40",
          )}
        >
          {friend.onlineStatus ? (
            <AvatarStatus
              status={friend.onlineStatus}
              borderClassName="border-background"
              sizeClassName="size-3"
            />
          ) : null}
        </Avatar>
      </div>

      {/* Identity + meta */}
      <span className="flex min-w-0 flex-1 flex-col gap-1">
        <span
          className={cn(
            "truncate font-black text-sm leading-tight transition-colors",
            selected
              ? "text-forge-teal"
              : "text-foreground group-hover:text-forge-teal",
          )}
        >
          {friend.name}
        </span>

        <span className="flex min-w-0 flex-wrap items-center gap-1.5">
          {friend.city && (
            <span className="flex items-center gap-0.5 text-slate-muted text-xs">
              <MapPin
                className="size-3 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              {friend.city}
            </span>
          )}
          {friend.personalityType && (
            <StatusPill
              tone="teal"
              size="xs"
              surface="solid"
              className="h-4 px-1.5 py-0 font-semibold leading-4"
            >
              {friend.personalityType}
            </StatusPill>
          )}
          <StatusPill
            icon={ShieldCheck}
            tone="neutral"
            size="xs"
            surface="soft"
            className="h-4 px-1.5 py-0 leading-4"
          >
            {trustScore}
          </StatusPill>
        </span>
      </span>

      {/* Toggle button — raised above the link overlay */}
      <div className="relative z-20 shrink-0">
        <Button
          type="button"
          variant={selected ? "primary" : "ghost"}
          size="icon"
          disabled={disabled}
          onClick={() => onToggle(friend.id)}
          className={cn(
            "size-7 rounded-full",
            selected
              ? "bg-forge-teal text-white"
              : "text-muted-foreground hover:enabled:text-forge-teal",
          )}
          aria-label={`${selected ? "Remove" : "Invite"} ${friend.name}`}
        >
          {selected ? (
            <Check size={13} aria-hidden="true" />
          ) : (
            <Plus size={13} aria-hidden="true" />
          )}
        </Button>
      </div>
    </div>
  );
}
