import { BlockedUsersList } from "./blocked-users-list";
import type { BlockedUsersSectionProps } from "./types";

export function BlockedUsersSection({
  blockedUsers,
  errorMessage,
  isLoading,
  unblockingUserId,
  onUnblockUser,
}: BlockedUsersSectionProps) {
  return (
    <section>
      <div className="max-w-2xl">
        <h2 className="text-xl font-bold text-ink">Blocked users</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-muted">
          Review people you have blocked and restore access when you are ready.
        </p>
      </div>

      <div className="mt-6 border-t border-border">
        <BlockedUsersList
          blockedUsers={blockedUsers}
          errorMessage={errorMessage}
          isLoading={isLoading}
          unblockingUserId={unblockingUserId}
          onUnblockUser={onUnblockUser}
        />
      </div>
    </section>
  );
}
