import { useCandidateAvailability } from "@/features/settings/hooks/use-candidate-availability";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import { useDeleteAccountAction } from "./use-delete-account-action";
import { useSettingsAvatarActions } from "./use-settings-avatar-actions";
import { useSettingsPreferencesActions } from "./use-settings-preferences-actions";
import { useSettingsProfileBase } from "./use-settings-profile-base";
import { useSettingsSecurityActions } from "./use-settings-security-actions";

interface UseSettingsProfileFormOptions {
  activeSection: SettingsSection;
}

export function useSettingsProfileForm({
  activeSection,
}: UseSettingsProfileFormOptions) {
  const profile = useSettingsProfileBase();
  const shouldLoadPreferences =
    activeSection === "appearance" ||
    activeSection === "matching" ||
    activeSection === "privacy" ||
    activeSection === "notifications";
  const avatar = useSettingsAvatarActions();
  const security = useSettingsSecurityActions({
    currentUser: profile.currentUser,
    enabled: activeSection === "security",
  });
  const preferences = useSettingsPreferencesActions({
    enabled: Boolean(profile.currentUser) && shouldLoadPreferences,
  });
  const candidateAvailability = useCandidateAvailability({
    enabled: Boolean(profile.currentUser) && activeSection === "matching",
  });
  const deleteAccount = useDeleteAccountAction();

  return {
    currentUser: profile.currentUser,
    form: profile.form,
    isLoading: profile.isLoading,
    isError: profile.isError,
    refetch: profile.refetch,
    onSubmit: profile.onSubmit,
    isOnline: profile.isOnline,
    isSaving: profile.isSaving,
    isUploadingAvatar: avatar.isUploadingAvatar,
    isDeletingAvatar: avatar.isDeletingAvatar,
    saveError: profile.saveError,
    avatarError: avatar.avatarError,
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
    updateNotificationPreference: preferences.updateNotificationPreference,
    updateMatchingPreference: preferences.updateMatchingPreference,
    updatePrivacyPreference: preferences.updatePrivacyPreference,
    updateAppearancePreference: preferences.updateAppearancePreference,
    isSavingNotificationPreferences:
      preferences.isSavingNotificationPreferences,
    savingNotificationPreferenceKeys:
      preferences.savingNotificationPreferenceKeys,
    candidateAvailability,
    deleteAccount: deleteAccount.deleteAccount,
    isDeletingAccount: deleteAccount.isDeletingAccount,
    deleteAccountError: deleteAccount.deleteAccountError,
  };
}
