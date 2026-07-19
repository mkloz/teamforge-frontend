import { OfflineSettingsNotice } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { AccountLifecycleSection } from "./account-lifecycle-section";
import { ActiveSessionsSection } from "./active-sessions-section";
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
  onRevokeSession,
  onRevokeOtherSessions,
  accountLifecycle,
}: SecuritySettingsSectionProps) {
  return (
    <div className="flex flex-col gap-10">
      <section>
        <div className="flex max-w-2xl items-start gap-3">
          <div className="min-w-0">
            <h2 className="font-bold text-ink text-xl">Security & Access</h2>
            <p className="mt-1 text-slate-muted text-sm leading-relaxed">
              Review how this account signs in, recover access, and manage
              active sessions.
            </p>
          </div>
        </div>

        <SecuritySummary currentUser={currentUser} />

        {!status.isOnline ? (
          <div className="mt-6">
            <OfflineSettingsNotice message="Reconnect before changing security settings." />
          </div>
        ) : null}

        <PasswordRecoverySection
          currentUser={currentUser}
          isOnline={status.isOnline}
          isSendingPasswordResetLink={status.isSendingPasswordResetLink}
          securityError={errors.securityError}
          onSendPasswordResetLink={onSendPasswordResetLink}
        />
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
