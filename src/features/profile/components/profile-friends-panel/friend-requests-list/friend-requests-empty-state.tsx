import { UserPlus } from "lucide-react";

export function FriendRequestsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border border-dashed py-16 text-center">
      <div className="rounded-full bg-muted/50 p-3">
        <UserPlus className="size-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-bold text-foreground">No pending requests</h3>
      <p className="mt-1 max-w-sm text-muted-foreground text-sm">
        You don't have any pending friend requests.
      </p>
    </div>
  );
}
