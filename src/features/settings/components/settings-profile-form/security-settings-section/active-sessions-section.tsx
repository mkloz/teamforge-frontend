import { Shield } from "lucide-react";
import { EmptyActiveSessionsVisual } from "@/features/settings/assets/empty-active-sessions";
import { SessionRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { SettingsActiveSessionsSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import type { AuthSession } from "@/shared/schemas";

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
          <h3 className="font-semibold text-ink text-lg">
            Active sessions
            {!isLoadingSessions && !sessionsError ? (
              <span className="ml-2 font-medium text-slate-muted text-sm">
                {sessions.length}
              </span>
            ) : null}
          </h3>
        </div>

        <RevokeOtherSessionsAction
          isRevokingOtherSessions={isRevokingOtherSessions}
          onConfirm={onRevokeOtherSessions}
          viewState={viewState}
        />
      </div>

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
    <div className="mt-5 border-border border-t">
      {isLoadingSessions ? (
        <SettingsActiveSessionsSkeleton />
      ) : sessionsError ? (
        <ActiveSessionsErrorMessage sessionsError={sessionsError} />
      ) : sessions.length ? (
        <SessionRows
          sessions={sessions}
          isOnline={isOnline}
          revokingSessionId={revokingSessionId}
          onRevokeSession={onRevokeSession}
        />
      ) : (
        <ActiveSessionsEmptyState />
      )}
    </div>
  );
}

const INITIAL_SESSION_COUNT = 5;

function SessionRows({
  isOnline,
  onRevokeSession,
  revokingSessionId,
  sessions,
}: {
  isOnline: boolean;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  revokingSessionId: string | null;
  sessions: AuthSession[];
}) {
  const orderedSessions = [...sessions].sort(
    (left, right) => Number(right.isCurrent) - Number(left.isCurrent),
  );
  const initialSessions = orderedSessions.slice(0, INITIAL_SESSION_COUNT);
  const remainingSessions = orderedSessions.slice(INITIAL_SESSION_COUNT);

  return (
    <>
      {initialSessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          isOnline={isOnline}
          isRevoking={revokingSessionId === session.id}
          onRevoke={onRevokeSession}
        />
      ))}

      {remainingSessions.length ? (
        <details className="border-border border-b py-4">
          <summary className="cursor-pointer font-semibold text-primary text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30">
            Show {remainingSessions.length} more sessions
          </summary>
          <div className="mt-3 border-border border-t">
            {remainingSessions.map((session) => (
              <SessionRow
                key={session.id}
                session={session}
                isOnline={isOnline}
                isRevoking={revokingSessionId === session.id}
                onRevoke={onRevokeSession}
              />
            ))}
          </div>
        </details>
      ) : null}
    </>
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
  const otherSessionCount = sessions.filter(
    (session) => !session.isCurrent,
  ).length;

  return {
    otherDeviceWord: otherSessionCount === 1 ? "device" : "devices",
    otherSessionCount,
    revokeOtherDisabled:
      !isOnline || isRevokingOtherSessions || sessions.length <= 1,
  };
}
