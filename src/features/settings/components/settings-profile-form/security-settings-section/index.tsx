import { OfflineSettingsNotice } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { GroupedMenuList } from "@/shared/components/ui/grouped-menu";
import { Notice } from "@/shared/components/ui/notice";
import { AccountLifecycleSection } from "./account-lifecycle-section";
import { ActiveSessionsSection } from "./active-sessions-section";
import { GoogleConnectionSection } from "./google-connection-section";
import { PasswordRecoverySection } from "./password-recovery-section";
import { SecuritySummary } from "./security-summary";
import type { SecuritySettingsSectionProps } from "./types";

export function SecuritySettingsSection({
  currentUser,
  sessions,
  revokingSessionId,
  status,
  errors,
  onSendPasswordResetLink,
  onConnectGoogle,
  onGoogleConnectionIntent,
  onRevokeSession,
  onRevokeOtherSessions,
  accountLifecycle,
}: SecuritySettingsSectionProps) {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="px-1">
          <h2 className="font-bold text-ink text-xl">Sign-in and recovery</h2>
          <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
            Review the identity used to access TeamForge and recover your
            account.
          </p>
        </div>

        <GroupedMenuList aria-label="Sign-in and recovery" className="mt-5">
          <SecuritySummary currentUser={currentUser} />
          <GoogleConnectionSection
            currentUser={currentUser}
            isConnecting={status.isConnectingGoogle}
            isOnline={status.isOnline}
            onConnect={onConnectGoogle}
            onIntent={onGoogleConnectionIntent}
          />
          <PasswordRecoverySection
            currentUser={currentUser}
            isOnline={status.isOnline}
            isSendingPasswordResetLink={status.isSendingPasswordResetLink}
            onSendPasswordResetLink={onSendPasswordResetLink}
          />
        </GroupedMenuList>

        {!status.isOnline ? (
          <div className="mt-4">
            <OfflineSettingsNotice message="Reconnect before changing security settings." />
          </div>
        ) : null}

        {errors.securityError ? (
          <Notice className="mt-4" role="alert" tone="danger" size="md">
            {errors.securityError}
          </Notice>
        ) : null}
      </section>

      <ActiveSessionsSection
        sessions={sessions}
        isOnline={status.isOnline}
        isLoadingSessions={status.isLoadingSessions}
        isRevokingOtherSessions={status.isRevokingOtherSessions}
        revokingSessionId={revokingSessionId}
        sessionsError={errors.sessionsError}
        onRevokeSession={onRevokeSession}
        onRevokeOtherSessions={onRevokeOtherSessions}
      />

      <AccountLifecycleSection
        currentUser={currentUser}
        state={accountLifecycle}
      />
    </div>
  );
}
