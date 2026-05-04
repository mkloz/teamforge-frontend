import { formatShortSessionTime } from "./security-formatters";
import {
  SessionRow,
  StatPill,
} from "@/features/settings/components/settings-profile-form/settings-form-controls";
import { Button } from "@/shared/components/ui/button";
import type { AuthSession } from "@/shared/schemas";
import { Shield } from "lucide-react";

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
    <section className="border-t border-border pt-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="max-w-2xl">
          <h3 className="text-lg font-semibold text-ink">Active sessions</h3>
          <p className="mt-1 text-sm leading-relaxed text-slate-muted">
            Keep the current browser active and remove devices you no longer
            use.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full md:w-auto"
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

      <div className="mt-6 grid gap-5 border-y border-border py-5 md:grid-cols-3">
        <StatPill label="Active now" value={sessions.length} />
        <StatPill label="Other devices" value={otherSessionCount} />
        <StatPill
          label="Current expires"
          value={formatShortSessionTime(currentSession?.expiresAt)}
        />
      </div>

      <div>
        {isLoadingSessions ? (
          <p className="py-4 text-sm text-slate-muted">Loading sessions...</p>
        ) : sessionsError ? (
          <p className="py-4 text-sm text-destructive">{sessionsError}</p>
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
          <p className="py-4 text-sm text-slate-muted">
            No active sessions are available right now.
          </p>
        )}
      </div>
    </section>
  );
}
