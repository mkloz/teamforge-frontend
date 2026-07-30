import { MonitorX, Shield } from "lucide-react";
import { SessionRow } from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { SettingsActiveSessionsSkeleton } from "@/features/settings/components/settings-section-skeletons";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  GroupedMenuItem,
  GroupedMenuList,
} from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { Notice } from "@/shared/components/ui/notice";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
    <section>
      <div className="flex flex-col gap-4 px-1 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-ink text-xl">Active devices</h2>
            {!isLoadingSessions && !sessionsError ? (
              <StatusPill size="xs" surface="soft" tone="neutral" numeric>
                {sessions.length}
              </StatusPill>
            ) : null}
          </div>
          <p className="mt-1 text-slate-muted text-sm leading-relaxed">
            Review browsers and devices that can currently access your account.
          </p>
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
          size="sm"
          className="w-full sm:w-auto"
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
    <div className="mt-5">
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

  return (
    <GroupedMenuList aria-label="Active account sessions">
      {orderedSessions.map((session) => (
        <SessionRow
          key={session.id}
          session={session}
          isOnline={isOnline}
          isRevoking={revokingSessionId === session.id}
          onRevoke={onRevokeSession}
        />
      ))}
    </GroupedMenuList>
  );
}

function ActiveSessionsErrorMessage({
  sessionsError,
}: {
  sessionsError: string;
}) {
  return (
    <Notice role="alert" tone="danger" size="md">
      {sessionsError}
    </Notice>
  );
}

function ActiveSessionsEmptyState() {
  return (
    <GroupedMenuList aria-label="Active account sessions">
      <GroupedMenuItem>
        <div className="flex min-h-20 items-center gap-3 px-3 py-3 sm:px-5">
          <IconTile icon={MonitorX} size="lg" shape="circle" tone="neutral" />
          <p className="text-slate-muted text-sm">
            No active sessions are available right now.
          </p>
        </div>
      </GroupedMenuItem>
    </GroupedMenuList>
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
