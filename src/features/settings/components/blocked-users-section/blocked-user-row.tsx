import { formatBlockedDate } from "./blocked-users-formatters";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { FriendshipApi } from "@/shared/schemas";
import { Loader2, ShieldOff } from "lucide-react";

interface BlockedUserRowProps {
  friendship: FriendshipApi;
  isUnblocking: boolean;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

export function BlockedUserRow({
  friendship,
  isUnblocking,
  onUnblockUser,
}: BlockedUserRowProps) {
  const user = friendship.counterpart;

  return (
    <div className="flex flex-col gap-4 border-b border-border py-4 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar
          src={user.avatar}
          name={user.name}
          className="h-11 w-11 border border-border bg-card text-sm"
        />

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-ink">{user.name}</p>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-muted">
            <span>Blocked {formatBlockedDate(friendship.updatedAt)}</span>
            {user.city && <span>{user.city}</span>}
            {user.personalityType && <span>{user.personalityType}</span>}
          </div>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        disabled={isUnblocking}
        className={cn(
          "w-full justify-center md:w-auto",
          "border-forge-teal/30 text-forge-teal hover:bg-forge-teal/8",
        )}
        onClick={() => {
          void onUnblockUser(user.id);
        }}
      >
        {isUnblocking ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <ShieldOff size={14} />
        )}
        {isUnblocking ? "Unblocking..." : "Unblock"}
      </Button>
    </div>
  );
}
