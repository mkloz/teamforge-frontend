import { SettingsProfileForm } from "@/features/settings/components/settings-profile-form";
import { useSettingsBlockedUsers } from "@/features/settings/hooks/use-settings-blocked-users";
import { useSettingsProfileForm } from "@/features/settings/hooks/use-settings-profile-form";
import { PageErrorState } from "@/shared/components/page-error-state";
import type { SettingsSection } from "@/shared/navigation/settings-navigation";
import { SettingsSectionContentLoading } from "./settings-page.loading";

interface SettingsFormBridgeProps {
  activeSection: SettingsSection;
}

export function SettingsFormBridge({ activeSection }: SettingsFormBridgeProps) {
  const profileFormState = useSettingsProfileForm({ activeSection });
  const blockedUsersState = useSettingsBlockedUsers(
    Boolean(profileFormState.currentUser) && activeSection === "safety",
  );

  if (profileFormState.isLoading) {
    return <SettingsSectionContentLoading activeSection={activeSection} />;
  }

  if (profileFormState.isError) {
    return (
      <PageErrorState
        className="w-full"
        title="Settings could not load"
        description="Check your connection and try again."
        onRetry={() => profileFormState.refetch()}
      />
    );
  }

  const notificationPreferenceState = {
    notificationPreferences: profileFormState.notificationPreferences,
    isLoadingNotificationPreferences:
      profileFormState.isLoadingNotificationPreferences,
    isSavingNotificationPreferences:
      profileFormState.isSavingNotificationPreferences,
    savingNotificationPreferenceKeys:
      profileFormState.savingNotificationPreferenceKeys,
    error: profileFormState.notificationPreferencesError,
    isOnline: profileFormState.isOnline,
  };

  return (
    <SettingsProfileForm
      activeSection={activeSection}
      account={{
        adultEligibilityCorrection: profileFormState.adultEligibilityCorrection,
        currentUser: profileFormState.currentUser,
        form: profileFormState.form,
        onSubmit: profileFormState.onSubmit,
        onAvatarSelect: profileFormState.uploadAvatar,
        onAvatarDelete: profileFormState.deleteAvatar,
        isOnline: profileFormState.isOnline,
        isSaving: profileFormState.isSaving,
        isUploadingAvatar: profileFormState.isUploadingAvatar,
        isDeletingAvatar: profileFormState.isDeletingAvatar,
        saveError: profileFormState.saveError,
        avatarError: profileFormState.avatarError,
        profileSummary: profileFormState.profileSummary,
      }}
      appearance={{
        ...notificationPreferenceState,
        onChange: profileFormState.updateAppearancePreference,
      }}
      matching={{
        ...notificationPreferenceState,
        activityInviteAvailability: profileFormState.activityInviteAvailability,
        candidateAvailability: profileFormState.candidateAvailability,
        currentUser: profileFormState.currentUser,
        onChange: profileFormState.updateMatchingPreference,
      }}
      privacy={{
        ...notificationPreferenceState,
        accountExport: profileFormState.accountExport,
        onChange: profileFormState.updatePrivacyPreference,
      }}
      security={{
        accountLifecycle: profileFormState.accountLifecycle,
        currentUser: profileFormState.currentUser,
        sessions: profileFormState.sessions,
        isOnline: profileFormState.isOnline,
        isLoadingSessions: profileFormState.isLoadingSessions,
        isSendingPasswordResetLink: profileFormState.isSendingPasswordResetLink,
        isRevokingOtherSessions: profileFormState.isRevokingOtherSessions,
        revokingSessionId: profileFormState.revokingSessionId,
        securityError: profileFormState.securityError,
        sessionsError: profileFormState.sessionsError,
        onSendPasswordResetLink: profileFormState.sendPasswordResetLink,
        onRevokeSession: profileFormState.revokeSession,
        onRevokeOtherSessions: profileFormState.revokeOtherSessions,
      }}
      safety={{
        blockedUsers: blockedUsersState.blockedUsers,
        isOnline: blockedUsersState.isOnline,
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
