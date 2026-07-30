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
      <div className="px-1">
        <h2 className="font-bold text-ink text-xl">Blocked people</h2>
        <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
          Manage people who cannot contact you or interact with you in groups.
        </p>
      </div>

      {!isOnline ? (
        <div className="mt-4">
          <OfflineSettingsNotice message="Reconnect before changing your blocked users list." />
        </div>
      ) : null}

      <div className="mt-5">
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
