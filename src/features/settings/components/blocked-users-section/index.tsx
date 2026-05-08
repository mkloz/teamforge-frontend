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
        <h2 className="font-bold text-ink text-xl">Blocked users</h2>
        <p className="mt-1 text-slate-muted text-sm leading-relaxed">
          Review people you have blocked and restore access when you are ready.
        </p>
      </div>

      <div className="mt-6 border-border border-t">
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
