import { OfflineSettingsNotice } from "@/features/settings/components/settings-profile-form/preference-section-parts";
import { DeleteAccountSection } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { ActiveSessionsSection } from "./active-sessions-section";
import { PasswordRecoverySection } from "./password-recovery-section";
import { SecuritySummary } from "./security-summary";
import type { SecuritySettingsSectionProps } from "./types";

export function SecuritySettingsSection({
  currentUser,
  sessions,
  isOnline,
  isLoadingSessions,
  isSendingPasswordResetLink,
  isRevokingOtherSessions,
  isDeletingAccount,
  revokingSessionId,
  securityError,
  sessionsError,
  deleteAccountError,
  onSendPasswordResetLink,
  onRevokeSession,
  onRevokeOtherSessions,
  onDeleteAccount,
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

        {!isOnline ? (
          <div className="mt-6">
            <OfflineSettingsNotice message="Reconnect before changing security settings." />
          </div>
        ) : null}

        <PasswordRecoverySection
          currentUser={currentUser}
          isOnline={isOnline}
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          securityError={securityError}
          onSendPasswordResetLink={onSendPasswordResetLink}
        />
      </section>

      <ActiveSessionsSection
        sessions={sessions}
        isOnline={isOnline}
        isLoadingSessions={isLoadingSessions}
        isRevokingOtherSessions={isRevokingOtherSessions}
        revokingSessionId={revokingSessionId}
        sessionsError={sessionsError}
        onRevokeSession={onRevokeSession}
        onRevokeOtherSessions={onRevokeOtherSessions}
      />

      <DeleteAccountSection
        currentUser={currentUser}
        isOnline={isOnline}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
        onDelete={onDeleteAccount}
      />
    </div>
  );
}
