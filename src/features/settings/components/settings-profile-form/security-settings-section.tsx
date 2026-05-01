import { Link } from "@tanstack/react-router";

import { Button } from "@/shared/components/ui/button";
import { buildProfileNavigation } from "@/shared/lib/app-route";
import type { AuthSession, User } from "@/shared/schemas";
import {
  DeleteAccountSection,
  SessionRow,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { Shield } from "lucide-react";

interface SecuritySettingsSectionProps {
  currentUser: User | undefined;
  sessions: AuthSession[];
  isLoadingSessions: boolean;
  isSendingPasswordResetLink: boolean;
  isRevokingOtherSessions: boolean;
  isDeletingAccount: boolean;
  revokingSessionId: string | null;
  securityMessage: string | null;
  securityError: string | null;
  sessionsError: string | null;
  deleteAccountError: string | null;
  onSendPasswordResetLink: () => Promise<unknown>;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
  onDeleteAccount: () => Promise<void>;
}

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
    <div className="flex flex-col gap-6">
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-2">
          <h2 className="text-xl font-bold text-ink">Security & Access</h2>
          <p className="text-sm text-slate-muted">
            Review how this account signs in, recover access, and manage active
            sessions.
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StatPill label="Email" value={currentUser?.email ?? "Not set"} />
          <StatPill
            label="Provider"
            value={currentUser?.authProvider === "GOOGLE" ? "Google" : "Email"}
          />
          <StatPill
            label="Verification"
            value={currentUser?.emailVerified ? "Verified" : "Pending"}
          />
          <StatPill
            label="Profile Complete"
            value={currentUser?.profileComplete ? "Complete" : "In progress"}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-border/70 bg-canvas p-5">
          <h3 className="text-base font-semibold text-ink">
            Password & recovery
          </h3>
          <p className="mt-1 text-sm text-slate-muted">
            {currentUser?.authProvider === "GOOGLE"
              ? "This account signs in with Google, so password changes are managed by Google instead of TeamForge."
              : "Send a secure password reset link to your email if you want to rotate your password."}
          </p>

          {(securityMessage || securityError) && (
            <p
              className={`mt-4 text-sm ${securityError ? "text-destructive" : "text-forge-teal"}`}
            >
              {securityError ?? securityMessage}
            </p>
          )}

          <div className="mt-5 flex flex-wrap gap-3">
            {currentUser?.authProvider === "EMAIL" ? (
              <Button
                type="button"
                variant="primary"
                disabled={isSendingPasswordResetLink}
                onClick={() => {
                  void onSendPasswordResetLink();
                }}
              >
                {isSendingPasswordResetLink
                  ? "Sending link..."
                  : "Send reset link"}
              </Button>
            ) : (
              <Button type="button" variant="outline" disabled>
                Password managed by Google
              </Button>
            )}

            <Button asChild variant="outline">
              <Link {...buildProfileNavigation()}>Review public profile</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink">
              Active sessions
            </h3>
            <p className="mt-1 text-sm text-slate-muted">
              Revoke devices you no longer trust and keep the current one in
              view.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={isRevokingOtherSessions || sessions.length <= 1}
            onClick={() => {
              void onRevokeOtherSessions();
            }}
          >
            <Shield size={14} />
            {isRevokingOtherSessions
              ? "Signing out others..."
              : "Sign out other devices"}
          </Button>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          {isLoadingSessions ? (
            <p className="text-sm text-slate-muted">Loading sessions...</p>
          ) : sessionsError ? (
            <p className="text-sm text-destructive">{sessionsError}</p>
          ) : sessions.length ? (
            sessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isRevoking={revokingSessionId === session.id}
                onRevoke={onRevokeSession}
              />
            ))
          ) : (
            <p className="text-sm text-slate-muted">
              No active sessions are available right now.
            </p>
          )}
        </div>
      </section>

      <DeleteAccountSection
        currentUser={currentUser}
        isDeleting={isDeletingAccount}
        error={deleteAccountError}
        onDelete={onDeleteAccount}
      />
    </div>
  );
}
