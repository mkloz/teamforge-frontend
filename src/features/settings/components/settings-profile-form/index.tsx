import { BlockedUsersSection } from "@/features/settings/components/blocked-users-section";
import { AccountSettingsSection } from "./account-settings-section";
import { AppearanceSettingsSection } from "./appearance-settings-section";
import { MatchingSettingsSection } from "./matching-settings-section";
import { NotificationSettingsSection } from "./notification-settings-section";
import { PrivacySettingsSection } from "./privacy-settings-section";
import { SecuritySettingsSection } from "./security-settings-section";
import type { SettingsProfileFormProps } from "./settings-form-types";

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
          isSaving={account.isSaving}
          isUploadingAvatar={account.isUploadingAvatar}
          isDeletingAvatar={account.isDeletingAvatar}
          saveMessage={account.saveMessage}
          saveError={account.saveError}
          avatarMessage={account.avatarMessage}
          avatarError={account.avatarError}
          profileSummary={account.profileSummary}
        />
      )}

      {activeSection === "appearance" && <AppearanceSettingsSection />}

      {activeSection === "matching" && (
        <MatchingSettingsSection
          currentUser={matching.currentUser}
          notificationPreferences={matching.notificationPreferences}
          isLoadingNotificationPreferences={
            matching.isLoadingNotificationPreferences
          }
          isSavingNotificationPreferences={
            matching.isSavingNotificationPreferences
          }
          message={matching.message}
          error={matching.error}
          onChange={matching.onChange}
        />
      )}

      {activeSection === "privacy" && (
        <PrivacySettingsSection
          notificationPreferences={privacy.notificationPreferences}
          isLoadingNotificationPreferences={
            privacy.isLoadingNotificationPreferences
          }
          isSavingNotificationPreferences={
            privacy.isSavingNotificationPreferences
          }
          message={privacy.message}
          error={privacy.error}
          onChange={privacy.onChange}
        />
      )}

      {activeSection === "security" && (
        <SecuritySettingsSection
          currentUser={security.currentUser}
          sessions={security.sessions}
          isLoadingSessions={security.isLoadingSessions}
          isSendingPasswordResetLink={security.isSendingPasswordResetLink}
          isRevokingOtherSessions={security.isRevokingOtherSessions}
          isDeletingAccount={security.isDeletingAccount}
          revokingSessionId={security.revokingSessionId}
          securityMessage={security.securityMessage}
          securityError={security.securityError}
          sessionsError={security.sessionsError}
          deleteAccountError={security.deleteAccountError}
          onSendPasswordResetLink={security.onSendPasswordResetLink}
          onRevokeSession={security.onRevokeSession}
          onRevokeOtherSessions={security.onRevokeOtherSessions}
          onDeleteAccount={security.onDeleteAccount}
        />
      )}

      {activeSection === "safety" && (
        <BlockedUsersSection
          blockedUsers={safety.blockedUsers}
          errorMessage={safety.blockedUsersError}
          isLoading={safety.isLoadingBlockedUsers}
          unblockingUserId={safety.unblockingUserId}
          onUnblockUser={safety.onUnblockUser}
        />
      )}

      {activeSection === "notifications" && (
        <NotificationSettingsSection
          notificationPreferences={notifications.notificationPreferences}
          isLoadingNotificationPreferences={
            notifications.isLoadingNotificationPreferences
          }
          isSavingNotificationPreferences={
            notifications.isSavingNotificationPreferences
          }
          message={notifications.message}
          error={notifications.error}
          onChange={notifications.onChange}
        />
      )}
    </div>
  );
}
