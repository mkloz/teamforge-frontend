import { describeSessionDevice } from "./session-device";
import { formatSessionTime } from "./settings-control-formatters";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { AuthSession } from "@/shared/schemas";
import { CalendarClock, Clock3, LogOut, Wifi } from "lucide-react";

interface SessionRowProps {
  session: AuthSession;
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}

export function SessionRow({ session, isRevoking, onRevoke }: SessionRowProps) {
  const device = describeSessionDevice(session);
  const DeviceIcon = device.icon;

  return (
    <div
      className={cn(
        "grid gap-4 border-b border-border py-5 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto] md:items-center",
        session.isCurrent && "border-forge-teal/25",
      )}
    >
      <div className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-4">
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-full bg-muted text-slate-muted",
            session.isCurrent && "bg-forge-teal/8 text-forge-teal",
          )}
        >
          <DeviceIcon size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-base font-semibold leading-6 text-ink">
              {device.label}
            </p>
            {session.isCurrent && (
              <span className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2 py-0.5 text-[11px] font-semibold text-forge-teal">
                Current
              </span>
            )}
          </div>
          <div className="mt-3 grid gap-2 text-xs text-slate-muted sm:grid-cols-3">
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
            <p
              className="mt-3 max-w-3xl truncate text-xs text-slate-muted/75"
              title={session.userAgent}
            >
              {session.userAgent}
            </p>
          )}
        </div>
      </div>

      <Button
        type="button"
        variant={session.isCurrent ? "destructive" : "outline"}
        size="sm"
        className="w-full md:w-auto"
        disabled={isRevoking}
        onClick={() => {
          void onRevoke(session);
        }}
      >
        <LogOut size={14} />
        {isRevoking
          ? "Signing out..."
          : session.isCurrent
            ? "Sign out here"
            : "Revoke"}
      </Button>
    </div>
  );
}
