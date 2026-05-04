import { useDeleteAccountAction } from "./use-delete-account-action";
import { useSettingsAvatarActions } from "./use-settings-avatar-actions";
import { useSettingsPreferencesActions } from "./use-settings-preferences-actions";
import { useSettingsProfileBase } from "./use-settings-profile-base";
import { useSettingsSecurityActions } from "./use-settings-security-actions";

export function useSettingsProfileForm() {
  const profile = useSettingsProfileBase();
  const avatar = useSettingsAvatarActions();
  const security = useSettingsSecurityActions({
    currentUser: profile.currentUser,
  });
  const preferences = useSettingsPreferencesActions({
    enabled: Boolean(profile.currentUser),
  });
  const deleteAccount = useDeleteAccountAction();

  return {
    currentUser: profile.currentUser,
    form: profile.form,
    isLoading: profile.isLoading,
    isError: profile.isError,
    refetch: profile.refetch,
    onSubmit: profile.onSubmit,
    isSaving: profile.isSaving,
    isUploadingAvatar: avatar.isUploadingAvatar,
    isDeletingAvatar: avatar.isDeletingAvatar,
    saveMessage: profile.saveMessage,
    saveError: profile.saveError,
    avatarMessage: avatar.avatarMessage,
    avatarError: avatar.avatarError,
    securityMessage: security.securityMessage,
    securityError: security.securityError,
    profileSummary: profile.profileSummary,
    uploadAvatar: avatar.uploadAvatar,
    deleteAvatar: avatar.deleteAvatar,
    sendPasswordResetLink: security.sendPasswordResetLink,
    isSendingPasswordResetLink: security.isSendingPasswordResetLink,
    sessions: security.sessions,
    isLoadingSessions: security.isLoadingSessions,
    sessionsError: security.sessionsError,
    revokeSession: security.revokeSession,
    revokingSessionId: security.revokingSessionId,
    revokeOtherSessions: security.revokeOtherSessions,
    isRevokingOtherSessions: security.isRevokingOtherSessions,
    notificationPreferences: preferences.notificationPreferences,
    isLoadingNotificationPreferences:
      preferences.isLoadingNotificationPreferences,
    notificationPreferencesError: preferences.notificationPreferencesError,
    notificationPreferencesMessage: preferences.notificationPreferencesMessage,
    updateNotificationPreference: preferences.updateNotificationPreference,
    updateMatchingPreference: preferences.updateMatchingPreference,
    updatePrivacyPreference: preferences.updatePrivacyPreference,
    isSavingNotificationPreferences:
      preferences.isSavingNotificationPreferences,
    deleteAccount: deleteAccount.deleteAccount,
    isDeletingAccount: deleteAccount.isDeletingAccount,
    deleteAccountError: deleteAccount.deleteAccountError,
  };
}
