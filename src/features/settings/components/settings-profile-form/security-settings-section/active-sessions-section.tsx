import { Shield } from "lucide-react";
import { EmptyActiveSessionsVisual } from "@/assets/empty-state/empty-active-sessions";
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
  isLoadingSessions: boolean;
  isRevokingOtherSessions: boolean;
  revokingSessionId: string | null;
  sessionsError: string | null;
  onRevokeSession: (session: AuthSession) => Promise<void>;
  onRevokeOtherSessions: () => Promise<void>;
}

export function ActiveSessionsSection({
  sessions,
  isLoadingSessions,
  isRevokingOtherSessions,
  revokingSessionId,
  sessionsError,
  onRevokeSession,
  onRevokeOtherSessions,
}: ActiveSessionsSectionProps) {
  const currentSession = sessions.find((session) => session.isCurrent);
  const otherSessionCount = sessions.filter(
    (session) => !session.isCurrent,
  ).length;

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

        <ActionDialog
          cancelLabel="Keep devices"
          confirmLabel={
            isRevokingOtherSessions
              ? "Signing out..."
              : "Sign out other devices"
          }
          description={`This signs out ${otherSessionCount} other ${
            otherSessionCount === 1 ? "device" : "devices"
          }. Your current browser stays active.`}
          details={[
            "Anyone using those sessions will need to sign in again.",
            "This is useful after using a shared computer or losing a device.",
          ]}
          disabled={isRevokingOtherSessions || sessions.length <= 1}
          loading={isRevokingOtherSessions}
          onConfirm={onRevokeOtherSessions}
          title="Sign out other devices?"
          tone="warning"
          trigger={
            <Button
              type="button"
              variant="outline"
              className="w-full md:w-auto"
              disabled={isRevokingOtherSessions || sessions.length <= 1}
            >
              <Shield size={14} />
              {isRevokingOtherSessions
                ? "Signing out others..."
                : "Sign out other devices"}
            </Button>
          }
        />
      </div>

      <div className="mt-6 grid gap-5 border-border border-y py-5 md:grid-cols-3">
        <StatPill label="Active now" value={sessions.length} />
        <StatPill label="Other devices" value={otherSessionCount} />
        <StatPill
          label="Current expires"
          value={formatShortSessionTime(currentSession?.expiresAt)}
        />
      </div>

      <div>
        {isLoadingSessions ? (
          <SettingsActiveSessionsSkeleton />
        ) : sessionsError ? (
          <p className="py-4 text-destructive text-sm">{sessionsError}</p>
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
          <div className="flex flex-col items-start gap-3 py-5 sm:flex-row sm:items-center sm:gap-4">
            <EmptyActiveSessionsVisual className="h-6 w-auto shrink-0 text-foreground" />
            <p className="text-slate-muted text-sm">
              No active sessions are available right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
