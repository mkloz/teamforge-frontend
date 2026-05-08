import { DeleteAccountSection } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { ActiveSessionsSection } from "./active-sessions-section";
import { PasswordRecoverySection } from "./password-recovery-section";
import { SecuritySummary } from "./security-summary";
import type { SecuritySettingsSectionProps } from "./types";

export function SecuritySettingsSection({
  currentUser,
  sessions,
  isLoadingSessions,
  isSendingPasswordResetLink,
  isRevokingOtherSessions,
  isDeletingAccount,
  revokingSessionId,
  securityMessage,
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
        <div className="max-w-2xl">
          <h2 className="text-xl font-bold text-ink">Security & Access</h2>
          <p className="mt-1 text-sm leading-relaxed text-slate-muted">
            Review how this account signs in, recover access, and manage active
            sessions.
          </p>
        </div>

        <SecuritySummary currentUser={currentUser} />

        <PasswordRecoverySection
          currentUser={currentUser}
          isSendingPasswordResetLink={isSendingPasswordResetLink}
          securityMessage={securityMessage}
          securityError={securityError}
          onSendPasswordResetLink={onSendPasswordResetLink}
        />
      </section>

      <ActiveSessionsSection
        sessions={sessions}
        isLoadingSessions={isLoadingSessions}
        isRevokingOtherSessions={isRevokingOtherSessions}
        revokingSessionId={revokingSessionId}
        sessionsError={sessionsError}
        onRevokeSession={onRevokeSession}
        onRevokeOtherSessions={onRevokeOtherSessions}
      />

      <DeleteAccountSection
        currentUser={currentUser}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
        onDelete={onDeleteAccount}
      />
    </div>
  );
}
