import { Loader2, ShieldOff } from "lucide-react";

import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { FriendshipApi } from "@/shared/schemas";

interface BlockedUsersSectionProps {
  blockedUsers: FriendshipApi[];
  errorMessage: string | null;
  isLoading: boolean;
  unblockingUserId: string | null;
  onUnblockUser: (userId: string) => Promise<unknown>;
}

function formatBlockedDate(value: string) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function BlockedUsersSection({
  blockedUsers,
  errorMessage,
  isLoading,
  unblockingUserId,
  onUnblockUser,
}: BlockedUsersSectionProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-bold text-ink">Blocked Users</h2>
        <p className="text-sm leading-relaxed text-slate-muted">
          Review people you have blocked and restore access when you are ready.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading ? (
          <div className="flex items-center gap-2 rounded-2xl border border-border/70 bg-canvas p-4 text-sm text-slate-muted">
            <Loader2 size={16} className="animate-spin" />
            Loading blocked users...
          </div>
        ) : errorMessage ? (
          <p className="rounded-2xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            {errorMessage}
          </p>
        ) : blockedUsers.length ? (
          blockedUsers.map((friendship) => {
            const user = friendship.counterpart;
            const isUnblocking = unblockingUserId === user.id;

            return (
              <div
                key={`${friendship.requesterId}-${friendship.receiverId}`}
                className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-canvas p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    className="h-11 w-11 border border-border bg-card text-sm"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {user.name}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-muted">
                      <span>
                        Blocked {formatBlockedDate(friendship.updatedAt)}
                      </span>
                      {user.city && <span>{user.city}</span>}
                      {user.personalityType && (
                        <span>{user.personalityType}</span>
                      )}
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
          })
        ) : (
          <div className="rounded-2xl border border-border/70 bg-canvas p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full border border-border bg-card p-2 text-forge-teal">
                <ShieldOff size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">
                  No blocked users
                </p>
                <p className="mt-1 text-sm leading-relaxed text-slate-muted">
                  People you block from direct chats will appear here.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
