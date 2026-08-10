import { lazy, type ReactNode, Suspense } from "react";
import { AdultEligibilitySection } from "@/features/settings/components/adult-eligibility-section";
import {
  SafetySettingsOverviewSkeleton,
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
const SafetySettingsOverview = lazy(() =>
  import("@/features/safety/public/safety-settings-overview").then(
    (module) => ({
      default: module.SafetySettingsOverview,
    }),
  ),
);
const NotificationSettingsSection = lazy(() =>
  import("./notification-settings-section").then((module) => ({
    default: module.NotificationSettingsSection,
  })),
);

export function SettingsProfileForm(props: SettingsProfileFormProps) {
  return (
    <div className="flex flex-col gap-6">
      <SettingsActiveSection {...props} />
    </div>
  );
}

type SettingsPanelRenderer = (props: SettingsProfileFormProps) => ReactNode;

const SETTINGS_PANEL_RENDERERS = {
  account: ({ account }) => <AccountSettingsPanel account={account} />,
  appearance: ({ appearance }) => (
    <AppearanceSettingsPanel appearance={appearance} />
  ),
  matching: ({ matching }) => <MatchingSettingsPanel matching={matching} />,
  notifications: ({ notifications }) => (
    <NotificationSettingsPanel notifications={notifications} />
  ),
  privacy: ({ privacy }) => <PrivacySettingsPanel privacy={privacy} />,
  safety: ({ safety }) => <SafetySettingsPanel safety={safety} />,
  security: ({ security }) => <SecuritySettingsPanel security={security} />,
} satisfies Record<
  SettingsProfileFormProps["activeSection"],
  SettingsPanelRenderer
>;

function SettingsActiveSection(props: SettingsProfileFormProps) {
  return SETTINGS_PANEL_RENDERERS[props.activeSection](props);
}

function AccountSettingsPanel({
  account,
}: Pick<SettingsProfileFormProps, "account">) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <AccountSettingsSection
        currentUser={account.currentUser}
        form={account.form}
        onSubmit={account.onSubmit}
        onAvatarSelect={account.onAvatarSelect}
        onAvatarDelete={account.onAvatarDelete}
        profileSummary={account.profileSummary}
        status={{
          isOnline: account.isOnline,
          isSaving: account.isSaving,
          isUploadingAvatar: account.isUploadingAvatar,
          isDeletingAvatar: account.isDeletingAvatar,
        }}
        errors={{
          saveError: account.saveError,
          avatarError: account.avatarError,
        }}
      />
      <AdultEligibilitySection
        adultEligibility={account.currentUser?.adultEligibility}
        correctionState={account.adultEligibilityCorrection}
      />
    </div>
  );
}

function AppearanceSettingsPanel({
  appearance,
}: Pick<SettingsProfileFormProps, "appearance">) {
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

function MatchingSettingsPanel({
  matching,
}: Pick<SettingsProfileFormProps, "matching">) {
  return (
    <Suspense fallback={<SettingsPreferencesSkeleton />}>
      <MatchingSettingsSection
        activityInviteAvailability={matching.activityInviteAvailability}
        groupProposalAvailability={matching.groupProposalAvailability}
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

function PrivacySettingsPanel({
  privacy,
}: Pick<SettingsProfileFormProps, "privacy">) {
  return (
    <Suspense fallback={<SettingsPreferencesSkeleton />}>
      <PrivacySettingsSection
        accountExport={privacy.accountExport}
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

function SecuritySettingsPanel({
  security,
}: Pick<SettingsProfileFormProps, "security">) {
  return (
    <Suspense fallback={<SettingsActiveSessionsSkeleton />}>
      <SecuritySettingsSection
        accountLifecycle={security.accountLifecycle}
        currentUser={security.currentUser}
        sessions={security.sessions}
        revokingSessionId={security.revokingSessionId}
        status={{
          isOnline: security.isOnline,
          isLoadingSessions: security.isLoadingSessions,
          isSendingPasswordResetLink: security.isSendingPasswordResetLink,
          isConnectingGoogle: security.isConnectingGoogle,
          isRevokingOtherSessions: security.isRevokingOtherSessions,
        }}
        errors={{
          securityError: security.securityError,
          sessionsError: security.sessionsError,
        }}
        onSendPasswordResetLink={security.onSendPasswordResetLink}
        onConnectGoogle={security.onConnectGoogle}
        onGoogleConnectionIntent={security.onGoogleConnectionIntent}
        onRevokeSession={security.onRevokeSession}
        onRevokeOtherSessions={security.onRevokeOtherSessions}
      />
    </Suspense>
  );
}

function SafetySettingsPanel({
  safety,
}: Pick<SettingsProfileFormProps, "safety">) {
  return (
    <div className="grid gap-10">
      <Suspense fallback={<SafetySettingsOverviewSkeleton />}>
        <SafetySettingsOverview />
      </Suspense>
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
    </div>
  );
}

function NotificationSettingsPanel({
  notifications,
}: Pick<SettingsProfileFormProps, "notifications">) {
  return (
    <Suspense fallback={<SettingsPreferencesSkeleton />}>
      <NotificationSettingsSection
        notificationPreferences={notifications.notificationPreferences}
        isLoadingNotificationPreferences={
          notifications.isLoadingNotificationPreferences
        }
        savingNotificationPreferenceKeys={
          notifications.savingNotificationPreferenceKeys
        }
        error={notifications.error}
        isOnline={notifications.isOnline}
        onChange={notifications.onChange}
        onScheduleChange={notifications.onScheduleChange}
      />
    </Suspense>
  );
}

function SettingsPanelSkeleton() {
  return <SettingsPreferencesSkeleton />;
}
