import { SettingsProfileForm } from "@/features/settings/components/settings-profile-form";
import type { useSettingsBlockedUsers } from "@/features/settings/hooks/use-settings-blocked-users";
import type { useSettingsProfileForm } from "@/features/settings/hooks/use-settings-profile-form";
import type { SettingsSection } from "@/features/settings/lib/settings-route";

interface SettingsFormBridgeProps {
  activeSection: SettingsSection;
  blockedUsersState: ReturnType<typeof useSettingsBlockedUsers>;
  profileFormState: ReturnType<typeof useSettingsProfileForm>;
}

export function SettingsFormBridge({
  activeSection,
  blockedUsersState,
  profileFormState,
}: SettingsFormBridgeProps) {
  const notificationPreferenceState = {
    notificationPreferences: profileFormState.notificationPreferences,
    isLoadingNotificationPreferences:
      profileFormState.isLoadingNotificationPreferences,
    isSavingNotificationPreferences:
      profileFormState.isSavingNotificationPreferences,
    message: profileFormState.notificationPreferencesMessage,
    error: profileFormState.notificationPreferencesError,
  };

  return (
    <SettingsProfileForm
      activeSection={activeSection}
      account={{
        currentUser: profileFormState.currentUser,
        form: profileFormState.form,
        onSubmit: profileFormState.onSubmit,
        onAvatarSelect: profileFormState.uploadAvatar,
        onAvatarDelete: profileFormState.deleteAvatar,
        isSaving: profileFormState.isSaving,
        isUploadingAvatar: profileFormState.isUploadingAvatar,
        isDeletingAvatar: profileFormState.isDeletingAvatar,
        saveMessage: profileFormState.saveMessage,
        saveError: profileFormState.saveError,
        avatarMessage: profileFormState.avatarMessage,
        avatarError: profileFormState.avatarError,
        profileSummary: profileFormState.profileSummary,
      }}
      matching={{
        ...notificationPreferenceState,
        currentUser: profileFormState.currentUser,
        onChange: profileFormState.updateMatchingPreference,
      }}
      privacy={{
        ...notificationPreferenceState,
        onChange: profileFormState.updatePrivacyPreference,
      }}
      security={{
        currentUser: profileFormState.currentUser,
        sessions: profileFormState.sessions,
        isLoadingSessions: profileFormState.isLoadingSessions,
        isSendingPasswordResetLink: profileFormState.isSendingPasswordResetLink,
        isRevokingOtherSessions: profileFormState.isRevokingOtherSessions,
        isDeletingAccount: profileFormState.isDeletingAccount,
        revokingSessionId: profileFormState.revokingSessionId,
        securityMessage: profileFormState.securityMessage,
        securityError: profileFormState.securityError,
        sessionsError: profileFormState.sessionsError,
        deleteAccountError: profileFormState.deleteAccountError,
        onSendPasswordResetLink: profileFormState.sendPasswordResetLink,
        onRevokeSession: profileFormState.revokeSession,
        onRevokeOtherSessions: profileFormState.revokeOtherSessions,
        onDeleteAccount: profileFormState.deleteAccount,
      }}
      safety={{
        blockedUsers: blockedUsersState.blockedUsers,
        isLoadingBlockedUsers: blockedUsersState.isLoadingBlockedUsers,
        blockedUsersError: blockedUsersState.blockedUsersError,
        unblockingUserId: blockedUsersState.unblockingBlockedUserId,
        onUnblockUser: blockedUsersState.unblockBlockedUser,
      }}
      notifications={{
        ...notificationPreferenceState,
        onChange: profileFormState.updateNotificationPreference,
      }}
    />
  );
}
