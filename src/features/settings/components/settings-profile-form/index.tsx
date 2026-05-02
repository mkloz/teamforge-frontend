import { BlockedUsersSection } from "@/features/settings/components/blocked-users-section";
import { AccountSettingsSection } from "./account-settings-section";
import { MatchingSettingsSection } from "./matching-settings-section";
import { NotificationSettingsSection } from "./notification-settings-section";
import { PrivacySettingsSection } from "./privacy-settings-section";
import { SecuritySettingsSection } from "./security-settings-section";
import type { SettingsProfileFormProps } from "./settings-form-types";

export function SettingsProfileForm({
  activeSection,
  currentUser,
  form,
  onSubmit,
  onAvatarSelect,
  onSendPasswordResetLink,
  onRevokeSession,
  onRevokeOtherSessions,
  onUnblockUser,
  onNotificationPreferenceChange,
  onMatchingPreferenceChange,
  onPrivacyPreferenceChange,
  onDeleteAccount,
  isSaving,
  isUploadingAvatar,
  isSendingPasswordResetLink,
  isRevokingOtherSessions,
  isLoadingSessions,
  isLoadingBlockedUsers,
  isLoadingNotificationPreferences,
  isSavingNotificationPreferences,
  isDeletingAccount,
  revokingSessionId,
  saveMessage,
  saveError,
  avatarMessage,
  avatarError,
  securityMessage,
  securityError,
  notificationPreferencesMessage,
  notificationPreferencesError,
  deleteAccountError,
  sessionsError,
  blockedUsersError,
  profileSummary,
  sessions,
  blockedUsers,
  unblockingUserId,
  notificationPreferences,
}: SettingsProfileFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {activeSection === "account" && (
        <AccountSettingsSection
          currentUser={currentUser}
          form={form}
          onSubmit={onSubmit}
          onAvatarSelect={onAvatarSelect}
          isSaving={isSaving}
          isUploadingAvatar={isUploadingAvatar}
          saveMessage={saveMessage}
          saveError={saveError}
          avatarMessage={avatarMessage}
          avatarError={avatarError}
          profileSummary={profileSummary}
        />
      )}

      {activeSection === "matching" && (
        <MatchingSettingsSection
          currentUser={currentUser}
          notificationPreferences={notificationPreferences}
          isLoadingNotificationPreferences={isLoadingNotificationPreferences}
          isSavingNotificationPreferences={isSavingNotificationPreferences}
          message={notificationPreferencesMessage}
          error={notificationPreferencesError}
          onChange={onMatchingPreferenceChange}
        />
      )}

      {activeSection === "privacy" && (
        <PrivacySettingsSection
          notificationPreferences={notificationPreferences}
          isLoadingNotificationPreferences={isLoadingNotificationPreferences}
          isSavingNotificationPreferences={isSavingNotificationPreferences}
          message={notificationPreferencesMessage}
          error={notificationPreferencesError}
          onChange={onPrivacyPreferenceChange}
        />
      )}

      {activeSection === "security" && (
        <SecuritySettingsSection
          currentUser={currentUser}
          sessions={sessions}
          isLoadingSessions={isLoadingSessions}
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          isRevokingOtherSessions={isRevokingOtherSessions}
          isDeletingAccount={isDeletingAccount}
          revokingSessionId={revokingSessionId}
          securityMessage={securityMessage}
          securityError={securityError}
          sessionsError={sessionsError}
          deleteAccountError={deleteAccountError}
          onSendPasswordResetLink={onSendPasswordResetLink}
          onRevokeSession={onRevokeSession}
          onRevokeOtherSessions={onRevokeOtherSessions}
          onDeleteAccount={onDeleteAccount}
        />
      )}

      {activeSection === "safety" && (
        <BlockedUsersSection
          blockedUsers={blockedUsers}
          errorMessage={blockedUsersError}
          isLoading={isLoadingBlockedUsers}
          unblockingUserId={unblockingUserId}
          onUnblockUser={onUnblockUser}
        />
      )}

      {activeSection === "notifications" && (
        <NotificationSettingsSection
          notificationPreferences={notificationPreferences}
          isLoadingNotificationPreferences={isLoadingNotificationPreferences}
          isSavingNotificationPreferences={isSavingNotificationPreferences}
          message={notificationPreferencesMessage}
          error={notificationPreferencesError}
          onChange={onNotificationPreferenceChange}
        />
      )}
    </div>
  );
}
