import { OfflineSettingsNotice } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { BlockedUsersList } from "./blocked-users-list";
import type { BlockedUsersSectionProps } from "./types";

export function BlockedUsersSection({
  blockedUsers,
  errorMessage,
  isOnline,
  isLoading,
  unblockingUserId,
  onUnblockUser,
}: BlockedUsersSectionProps) {
  return (
    <section>
      <div className="flex max-w-2xl items-start gap-3">
        <div className="min-w-0">
          <h2 className="font-bold text-ink text-xl">Blocked users</h2>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            Review people you have blocked and restore access when you are
            ready.
          </p>
        </div>
      </div>

      {!isOnline ? (
        <div className="mt-6">
          <OfflineSettingsNotice message="Reconnect before changing your blocked users list." />
        </div>
      ) : null}

      <div className="mt-6 border-border border-t">
        <BlockedUsersList
          blockedUsers={blockedUsers}
          errorMessage={errorMessage}
          isOnline={isOnline}
          isLoading={isLoading}
          unblockingUserId={unblockingUserId}
          onUnblockUser={onUnblockUser}
        />
      </div>
    </section>
  );
}
