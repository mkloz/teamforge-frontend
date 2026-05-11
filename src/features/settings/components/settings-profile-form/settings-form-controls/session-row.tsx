import { CalendarClock, Clock3, LogOut, Wifi } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}

export function SessionRow({ session, isRevoking, onRevoke }: SessionRowProps) {
  const device = describeSessionDevice(session);
  const DeviceIcon = device.icon;

  return (
    <div
      className={cn(
        "md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center",
        session.isCurrent && "border-forge-teal/25",
      )}
    >
      <div className="icon-body-grid grid min-w-0 gap-4">
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
            <p className="font-semibold text-base text-ink leading-6">
              {device.label}
            </p>
            {session.isCurrent && (
              <span className="rounded-full border border-forge-teal/20 bg-forge-teal/8 px-2 py-0.5 font-semibold text-forge-teal text-micro">
                Current
              </span>
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
                  className="mt-3 block max-w-3xl cursor-help truncate border-0 bg-transparent p-0 text-left text-slate-muted/75 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/35"
                >
                  {session.userAgent}
                </button>
              </TooltipTrigger>
              <TooltipContent>{session.userAgent}</TooltipContent>
            </Tooltip>
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
