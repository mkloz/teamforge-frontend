import { Link } from "@tanstack/react-router";
import { Check, Plus } from "lucide-react";
import { buildProfileNavigation } from "@/features/profile/lib/profile-route";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
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

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border bg-card p-3 text-left transition-colors duration-150",
        selected
          ? "border-spark-amber/35 bg-spark-amber/10 ring-1 ring-spark-amber/20"
          : "border-border/45 hover:border-spark-amber/25 hover:bg-spark-amber/5",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <Link
        {...buildProfileNavigation(friend.id)}
        aria-label={`View ${friend.name}'s profile`}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Avatar
          src={friend.avatar}
          name={friend.name}
          className="size-11 transition-transform group-hover:scale-105"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-foreground text-sm transition-colors group-hover:text-forge-teal">
            {friend.name}
          </span>
          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-micro text-muted-foreground/65">
            {friend.city && <span>{friend.city}</span>}
            {friend.personalityType && <span>{friend.personalityType}</span>}
            <span>Trust {formatTrustScore(friend.trustScore)}</span>
          </span>
        </span>
      </Link>

      <Button
        type="button"
        variant={selected ? "secondary" : "outline"}
        size="icon-sm"
        disabled={disabled}
        onClick={() => onToggle(friend.id)}
        className={cn(
          "size-8 shrink-0 rounded-full border transition-colors",
          selected
            ? "border-spark-amber bg-spark-amber text-ink"
            : "border-border/60 bg-background text-muted-foreground",
        )}
        aria-label={`${selected ? "Remove" : "Invite"} ${friend.name}`}
      >
        {selected ? <Check size={15} /> : <Plus size={15} />}
      </Button>
    </div>
  );
}
