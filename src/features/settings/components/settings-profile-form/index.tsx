import { lazy, Suspense } from "react";
import {
  SettingsActiveSessionsSkeleton,
  SettingsBlockedUsersSkeleton,
  SettingsPreferencesSkeleton,
} from "@/features/settings/components/settings-section-skeletons";
import { AccountSettingsSection } from "./account-settings-section";
import type { SettingsProfileFormProps } from "./settings-form-types";

const AppearanceSettingsSection = lazy(() =>
  import("./appearance-settings-section").then((module) => ({
    default: module.AppearanceSettingsSection,
  })),
);
const MatchingSettingsSection = lazy(() =>
  import("./matching-settings-section").then((module) => ({
    default: module.MatchingSettingsSection,
  })),
);
const PrivacySettingsSection = lazy(() =>
  import("./privacy-settings-section").then((module) => ({
    default: module.PrivacySettingsSection,
  })),
);
const SecuritySettingsSection = lazy(() =>
  import("./security-settings-section").then((module) => ({
    default: module.SecuritySettingsSection,
  })),
);
const BlockedUsersSection = lazy(() =>
  import("@/features/settings/components/blocked-users-section").then(
    (module) => ({
      default: module.BlockedUsersSection,
    }),
  ),
);
const NotificationSettingsSection = lazy(() =>
  import("./notification-settings-section").then((module) => ({
    default: module.NotificationSettingsSection,
  })),
);

export function SettingsProfileForm({
  activeSection,
  account,
  matching,
  privacy,
  security,
  safety,
  notifications,
}: SettingsProfileFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {activeSection === "account" && (
        <AccountSettingsSection
          currentUser={account.currentUser}
          form={account.form}
          onSubmit={account.onSubmit}
          onAvatarSelect={account.onAvatarSelect}
          onAvatarDelete={account.onAvatarDelete}
          isOnline={account.isOnline}
          isSaving={account.isSaving}
          isUploadingAvatar={account.isUploadingAvatar}
          isDeletingAvatar={account.isDeletingAvatar}
          saveError={account.saveError}
          avatarError={account.avatarError}
          profileSummary={account.profileSummary}
        />
      )}

      {activeSection === "appearance" && (
        <Suspense fallback={<SettingsPanelSkeleton />}>
          <AppearanceSettingsSection />
        </Suspense>
      )}

      {activeSection === "matching" && (
        <Suspense fallback={<SettingsPreferencesSkeleton />}>
          <MatchingSettingsSection
            currentUser={matching.currentUser}
            notificationPreferences={matching.notificationPreferences}
            isLoadingNotificationPreferences={
              matching.isLoadingNotificationPreferences
            }
            isSavingNotificationPreferences={
              matching.isSavingNotificationPreferences
            }
            savingNotificationPreferenceKeys={
              matching.savingNotificationPreferenceKeys
            }
            error={matching.error}
            isOnline={matching.isOnline}
            onChange={matching.onChange}
          />
        </Suspense>
      )}

      {activeSection === "privacy" && (
        <Suspense fallback={<SettingsPreferencesSkeleton />}>
          <PrivacySettingsSection
            notificationPreferences={privacy.notificationPreferences}
            isLoadingNotificationPreferences={
              privacy.isLoadingNotificationPreferences
            }
            isSavingNotificationPreferences={
              privacy.isSavingNotificationPreferences
            }
            savingNotificationPreferenceKeys={
              privacy.savingNotificationPreferenceKeys
            }
            error={privacy.error}
            isOnline={privacy.isOnline}
            onChange={privacy.onChange}
          />
        </Suspense>
      )}

      {activeSection === "security" && (
        <Suspense fallback={<SettingsActiveSessionsSkeleton />}>
          <SecuritySettingsSection
            currentUser={security.currentUser}
            sessions={security.sessions}
            isOnline={security.isOnline}
            isLoadingSessions={security.isLoadingSessions}
            isSendingPasswordResetLink={security.isSendingPasswordResetLink}
            isRevokingOtherSessions={security.isRevokingOtherSessions}
            isDeletingAccount={security.isDeletingAccount}
            revokingSessionId={security.revokingSessionId}
            securityError={security.securityError}
            sessionsError={security.sessionsError}
            deleteAccountError={security.deleteAccountError}
            onSendPasswordResetLink={security.onSendPasswordResetLink}
            onRevokeSession={security.onRevokeSession}
            onRevokeOtherSessions={security.onRevokeOtherSessions}
            onDeleteAccount={security.onDeleteAccount}
          />
        </Suspense>
      )}

      {activeSection === "safety" && (
        <Suspense fallback={<SettingsBlockedUsersSkeleton />}>
          <BlockedUsersSection
            blockedUsers={safety.blockedUsers}
            errorMessage={safety.blockedUsersError}
            isOnline={safety.isOnline}
            isLoading={safety.isLoadingBlockedUsers}
            unblockingUserId={safety.unblockingUserId}
            onUnblockUser={safety.onUnblockUser}
          />
        </Suspense>
      )}

      {activeSection === "notifications" && (
        <Suspense fallback={<SettingsPreferencesSkeleton />}>
          <NotificationSettingsSection
            notificationPreferences={notifications.notificationPreferences}
            isLoadingNotificationPreferences={
              notifications.isLoadingNotificationPreferences
            }
            isSavingNotificationPreferences={
              notifications.isSavingNotificationPreferences
            }
            savingNotificationPreferenceKeys={
              notifications.savingNotificationPreferenceKeys
            }
            error={notifications.error}
            isOnline={notifications.isOnline}
            onChange={notifications.onChange}
          />
        </Suspense>
      )}
    </div>
  );
}

function SettingsPanelSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading settings panel" role="status">
      <span className="sr-only">Loading settings panel</span>
      <SettingsPreferencesSkeleton />
    </div>
  );
}
