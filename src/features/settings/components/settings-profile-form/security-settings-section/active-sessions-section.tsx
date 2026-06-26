import { Shield } from "lucide-react";
import { EmptyActiveSessionsVisual } from "@/features/settings/assets/empty-active-sessions";
import {
  SessionRow,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { SettingsActiveSessionsSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { AuthSession } from "@/shared/schemas";
import { formatShortSessionTime } from "./security-formatters";

interface ActiveSessionsSectionProps {
  sessions: AuthSession[];
  isOnline: boolean;
  isLoadingSessions: boolean;
  isRevokingOtherSessions: boolean;
  revokingSessionId: string | null;
  sessionsError: string | null;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
}

interface ActiveSessionsViewState {
  currentSession: AuthSession | undefined;
  otherDeviceWord: "device" | "devices";
  otherSessionCount: number;
  revokeOtherDisabled: boolean;
}

export function ActiveSessionsSection({
  sessions,
  isOnline,
  isLoadingSessions,
  isRevokingOtherSessions,
  revokingSessionId,
  sessionsError,
  onRevokeSession,
  onRevokeOtherSessions,
}: ActiveSessionsSectionProps) {
  const viewState = getActiveSessionsViewState({
    isOnline,
    isRevokingOtherSessions,
    sessions,
  });

  return (
    <section className="border-border border-t pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h3 className="font-semibold text-ink text-lg">Active sessions</h3>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            Keep the current browser active and remove devices you no longer
            use.
          </p>
        </div>

        <RevokeOtherSessionsAction
          isRevokingOtherSessions={isRevokingOtherSessions}
          onConfirm={onRevokeOtherSessions}
          viewState={viewState}
        />
      </div>

      <ActiveSessionsStats sessions={sessions} viewState={viewState} />

      <ActiveSessionsContent
        isLoadingSessions={isLoadingSessions}
        isOnline={isOnline}
        onRevokeSession={onRevokeSession}
        revokingSessionId={revokingSessionId}
        sessions={sessions}
        sessionsError={sessionsError}
      />
    </section>
  );
}

function RevokeOtherSessionsAction({
  isRevokingOtherSessions,
  onConfirm,
  viewState,
}: {
  isRevokingOtherSessions: boolean;
  onConfirm: () => Promise<void>;
  viewState: ActiveSessionsViewState;
}) {
  return (
    <ActionDialog
      cancelLabel="Keep devices"
      confirmLabel={
        isRevokingOtherSessions ? "Signing out..." : "Sign out other devices"
      }
      description={`This signs out ${viewState.otherSessionCount} other ${viewState.otherDeviceWord}. Your current browser stays active.`}
      details={[
        "Anyone using those sessions will need to sign in again.",
        "This is useful after using a shared computer or losing a device.",
      ]}
      disabled={viewState.revokeOtherDisabled}
      loading={isRevokingOtherSessions}
      onConfirm={onConfirm}
      title="Sign out other devices?"
      tone="warning"
      trigger={
        <Button
          type="button"
          variant="outline"
          className="w-full md:w-auto"
          disabled={viewState.revokeOtherDisabled}
        >
          <Shield size={14} />
          {isRevokingOtherSessions
            ? "Signing out others..."
            : "Sign out other devices"}
        </Button>
      }
    />
  );
}

function ActiveSessionsStats({
  sessions,
  viewState,
}: {
  sessions: AuthSession[];
  viewState: ActiveSessionsViewState;
}) {
  return (
    <div className="mt-6 grid gap-5 border-border border-y py-5 md:grid-cols-3">
      <StatPill label="Active now" value={sessions.length} />
      <StatPill label="Other devices" value={viewState.otherSessionCount} />
      <StatPill
        label="Current expires"
        value={formatShortSessionTime(viewState.currentSession?.expiresAt)}
      />
    </div>
  );
}

function ActiveSessionsContent({
  isLoadingSessions,
  isOnline,
  onRevokeSession,
  revokingSessionId,
  sessions,
  sessionsError,
}: {
  isLoadingSessions: boolean;
  isOnline: boolean;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  revokingSessionId: string | null;
  sessions: AuthSession[];
  sessionsError: string | null;
}) {
  return (
    <div>
      {isLoadingSessions ? (
        <SettingsActiveSessionsSkeleton />
      ) : sessionsError ? (
        <ActiveSessionsErrorMessage sessionsError={sessionsError} />
      ) : sessions.length ? (
        sessions.map((session) => (
          <SessionRow
            key={session.id}
            session={session}
            isOnline={isOnline}
            isRevoking={revokingSessionId === session.id}
            onRevoke={onRevokeSession}
          />
        ))
      ) : (
        <ActiveSessionsEmptyState />
      )}
    </div>
  );
}

function ActiveSessionsErrorMessage({
  sessionsError,
}: {
  sessionsError: string;
}) {
  return (
    <div className="flex min-h-32 items-center justify-center py-4 text-center">
      <p className="text-destructive text-sm">{sessionsError}</p>
    </div>
  );
}

function ActiveSessionsEmptyState() {
  return (
    <div className="flex min-h-36 flex-col items-center justify-center gap-3 py-5 text-center sm:flex-row sm:gap-4 sm:text-left">
      <EmptyActiveSessionsVisual className="h-6 w-auto shrink-0 text-foreground" />
      <p className="text-slate-muted text-sm">
        No active sessions are available right now.
      </p>
    </div>
  );
}

function getActiveSessionsViewState({
  isOnline,
  isRevokingOtherSessions,
  sessions,
}: Pick<
  ActiveSessionsSectionProps,
  "isOnline" | "isRevokingOtherSessions" | "sessions"
>): ActiveSessionsViewState {
  const currentSession = sessions.find((session) => session.isCurrent);
  const otherSessionCount = sessions.filter(
    (session) => !session.isCurrent,
  ).length;

  return {
    currentSession,
    otherDeviceWord: otherSessionCount === 1 ? "device" : "devices",
    otherSessionCount,
    revokeOtherDisabled:
      !isOnline || isRevokingOtherSessions || sessions.length <= 1,
  };
}
