import { Link } from "@tanstack/react-router";
import { Check, MapPin, Plus } from "lucide-react";
import { Avatar, AvatarStatus } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import type { FriendshipApi } from "@/shared/schemas";

interface ManualFriendInviteRowProps {
  disabled?: boolean;
  friendship: FriendshipApi;
  onToggle: (userId: string) => void;
  selected: boolean;
}

type FriendProfile = FriendshipApi["counterpart"];

export function ManualFriendInviteRow({
  disabled = false,
  friendship,
  onToggle,
  selected,
}: ManualFriendInviteRowProps) {
  const friend = friendship.counterpart;

  return (
    <div
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors duration-150",
        selected ? "bg-forge-teal/8" : "hover:bg-muted/50",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <FriendProfileLink friend={friend} />
      <FriendAvatar friend={friend} selected={selected} />
      <FriendIdentityMeta friend={friend} selected={selected} />
      <InviteToggleButton
        disabled={disabled}
        friend={friend}
        onToggle={onToggle}
        selected={selected}
      />
    </div>
  );
}

function FriendProfileLink({ friend }: { friend: FriendProfile }) {
  return (
    <Link
      {...buildProfileNavigation(friend.id)}
      aria-label={`View ${friend.name}'s profile`}
      className="absolute inset-0 z-10 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/45"
    >
      <span className="sr-only">View {friend.name}'s profile</span>
    </Link>
  );
}

function FriendAvatar({
  friend,
  selected,
}: {
  friend: FriendProfile;
  selected: boolean;
}) {
  return (
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
  );
}

function FriendIdentityMeta({
  friend,
  selected,
}: {
  friend: FriendProfile;
  selected: boolean;
}) {
  return (
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
        {friend.city && <FriendCity city={friend.city} />}
      </span>
    </span>
  );
}

function FriendCity({ city }: { city: string }) {
  return (
    <span className="flex items-center gap-0.5 text-slate-muted text-xs">
      <MapPin className="size-3 shrink-0" strokeWidth={2} aria-hidden="true" />
      {city}
    </span>
  );
}

function InviteToggleButton({
  disabled,
  friend,
  onToggle,
  selected,
}: {
  disabled: boolean;
  friend: FriendProfile;
  onToggle: (userId: string) => void;
  selected: boolean;
}) {
  return (
    <div className="relative z-20 shrink-0">
      <Button
        type="button"
        variant={selected ? "primary" : "ghost"}
        size="icon"
        disabled={disabled}
        onClick={() => onToggle(friend.id)}
        className={cn(
          "size-11 rounded-full md:size-7",
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
  );
}
