import { lazy, type ReactNode, Suspense } from "react";
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

type SettingsSectionRenderer = (props: SettingsProfileFormProps) => ReactNode;

const SETTINGS_SECTION_RENDERERS = {
  account: renderAccountSettingsSection,
  appearance: renderAppearanceSettingsSection,
  matching: renderMatchingSettingsSection,
  notifications: renderNotificationSettingsSection,
  privacy: renderPrivacySettingsSection,
  safety: renderSafetySettingsSection,
  security: renderSecuritySettingsSection,
} satisfies Record<
  SettingsProfileFormProps["activeSection"],
  SettingsSectionRenderer
>;

export function SettingsProfileForm(props: SettingsProfileFormProps) {
  const renderActiveSection = SETTINGS_SECTION_RENDERERS[props.activeSection];

  return (
    <div className="flex flex-col gap-6">{renderActiveSection(props)}</div>
  );
}

function renderAccountSettingsSection({ account }: SettingsProfileFormProps) {
  return (
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
  );
}

function renderAppearanceSettingsSection({
  appearance,
}: SettingsProfileFormProps) {
  return (
    <Suspense fallback={<SettingsPanelSkeleton />}>
      <AppearanceSettingsSection
        notificationPreferences={appearance.notificationPreferences}
        isLoadingNotificationPreferences={
          appearance.isLoadingNotificationPreferences
        }
        isSavingNotificationPreferences={
          appearance.isSavingNotificationPreferences
        }
        savingNotificationPreferenceKeys={
          appearance.savingNotificationPreferenceKeys
        }
        error={appearance.error}
        isOnline={appearance.isOnline}
        onChange={appearance.onChange}
      />
    </Suspense>
  );
}

function renderMatchingSettingsSection({ matching }: SettingsProfileFormProps) {
  return (
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
  );
}

function renderPrivacySettingsSection({ privacy }: SettingsProfileFormProps) {
  return (
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
  );
}

function renderSecuritySettingsSection({ security }: SettingsProfileFormProps) {
  return (
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
  );
}

function renderSafetySettingsSection({ safety }: SettingsProfileFormProps) {
  return (
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
  );
}

function renderNotificationSettingsSection({
  notifications,
}: SettingsProfileFormProps) {
  return (
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
