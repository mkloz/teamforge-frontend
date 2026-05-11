import { Check, Plus } from "lucide-react";
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
    <Button
      type="button"
      variant="ghost"
      disabled={disabled}
      onClick={() => onToggle(friend.id)}
      className={cn(
        "h-auto w-full justify-start rounded-lg border bg-card p-3 text-left transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50",
        selected
          ? "border-spark-amber/35 bg-spark-amber/10 ring-1 ring-spark-amber/20"
          : "border-border/45 hover:border-spark-amber/25 hover:bg-spark-amber/5",
      )}
      contentClassName="w-full items-center justify-start gap-3"
    >
      <Avatar src={friend.avatar} name={friend.name} className="size-11" />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground text-sm">
          {friend.name}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-micro text-muted-foreground/65">
          {friend.city && <span>{friend.city}</span>}
          {friend.personalityType && <span>{friend.personalityType}</span>}
          <span>Trust {formatTrustScore(friend.trustScore)}</span>
        </div>
      </div>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-spark-amber bg-spark-amber text-ink"
            : "border-border/60 bg-background text-muted-foreground",
        )}
      >
        {selected ? <Check size={15} /> : <Plus size={15} />}
      </span>
    </Button>
  );
}
