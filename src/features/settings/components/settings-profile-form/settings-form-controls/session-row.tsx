import { CalendarClock, Clock3, LogOut, Wifi } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";
import type { AuthSession } from "@/shared/schemas";
import { describeSessionDevice } from "./session-device";
import { formatSessionTime } from "./settings-control-formatters";

interface SessionRowProps {
  session: AuthSession;
  isOnline: boolean;
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}

export function SessionRow({
  session,
  isOnline,
  isRevoking,
  onRevoke,
}: SessionRowProps) {
  const device = describeSessionDevice(session);
  const DeviceIcon = device.icon;
  const actionTitle = session.isCurrent
    ? "Sign out of this browser?"
    : `Revoke ${device.label}?`;
  const actionDescription = session.isCurrent
    ? "This ends your current session and sends you back to login."
    : "This ends that device session. The next person using it will need to sign in again.";
  const actionLabel = session.isCurrent ? "Sign out here" : "Revoke session";

  return (
    <div
      className={cn(
        "md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center",
        session.isCurrent && "border-primary/25",
      )}
    >
      <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-4">
        <IconTile
          icon={DeviceIcon}
          shape="circle"
          size="lg"
          tone={session.isCurrent ? "teal" : "neutral"}
          className={session.isCurrent ? "bg-primary/8" : "bg-muted"}
          iconClassName="size-4"
        />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-base text-ink leading-6">
              {device.label}
            </p>
            {session.isCurrent && (
              <StatusPill size="xs" tone="teal" surface="soft">
                Current
              </StatusPill>
            )}
          </div>
          <div className="mt-3 grid gap-2 text-slate-muted text-xs sm:grid-cols-3">
            <span className="flex min-w-0 items-center gap-2">
              <CalendarClock size={14} className="shrink-0" />
              <span className="truncate">
                Started {formatSessionTime(session.createdAt)}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Clock3 size={14} className="shrink-0" />
              <span className="truncate">
                Expires {formatSessionTime(session.expiresAt)}
              </span>
            </span>
            <span className="flex min-w-0 items-center gap-2">
              <Wifi size={14} className="shrink-0" />
              <span className="truncate">
                {session.ipAddress ? `IP ${session.ipAddress}` : "IP unknown"}
              </span>
            </span>
          </div>
          {session.userAgent && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="mt-3 block max-w-3xl cursor-help truncate border-0 bg-transparent p-0 text-left text-slate-muted/75 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  {session.userAgent}
                </button>
              </TooltipTrigger>
              <TooltipContent>{session.userAgent}</TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>

      <ActionDialog
        cancelLabel="Keep session"
        confirmLabel={isRevoking ? "Signing out..." : actionLabel}
        description={actionDescription}
        details={[
          `Started ${formatSessionTime(session.createdAt)}`,
          `Expires ${formatSessionTime(session.expiresAt)}`,
          session.ipAddress ? `IP ${session.ipAddress}` : "IP unknown",
        ]}
        disabled={!isOnline || isRevoking}
        loading={isRevoking}
        onConfirm={() => onRevoke(session)}
        title={actionTitle}
        tone={session.isCurrent ? "danger" : "warning"}
        trigger={
          <Button
            type="button"
            variant={session.isCurrent ? "destructive" : "outline"}
            size="sm"
            className="w-full md:w-auto"
            disabled={!isOnline || isRevoking}
          >
            <LogOut size={14} />
            {isRevoking
              ? "Signing out..."
              : session.isCurrent
                ? "Sign out here"
                : "Revoke"}
          </Button>
        }
      />
    </div>
  );
}
