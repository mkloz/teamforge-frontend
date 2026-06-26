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
import {
  getSessionActionState,
  getSessionRowViewState,
  type SessionActionState,
  type SessionRowViewState,
} from "./session-action-state";
import { describeSessionDevice } from "./session-device";
import { formatSessionTime } from "./settings-control-formatters";

interface SessionRowProps {
  session: AuthSession;
  isOnline: boolean;
  isRevoking: boolean;
  onRevoke: (session: AuthSession) => Promise<void>;
}

type SessionDevice = ReturnType<typeof describeSessionDevice>;

export function SessionRow({
  session,
  isOnline,
  isRevoking,
  onRevoke,
}: SessionRowProps) {
  const device = describeSessionDevice(session);
  const viewState = getSessionRowViewState(session);
  const actionState = getSessionActionState({
    deviceLabel: device.label,
    isOnline,
    isRevoking,
    session,
  });

  return (
    <div
      className={cn(
        "md:main-action-grid grid gap-4 border-border border-b py-5 last:border-b-0 md:items-center",
        viewState.rowHighlightClassName,
      )}
    >
      <SessionDeviceSummary
        device={device}
        session={session}
        viewState={viewState}
      />

      <SessionRevokeDialog
        actionState={actionState}
        isRevoking={isRevoking}
        onConfirm={() => onRevoke(session)}
      />
    </div>
  );
}

function SessionDeviceSummary({
  device,
  session,
  viewState,
}: {
  device: SessionDevice;
  session: AuthSession;
  viewState: SessionRowViewState;
}) {
  const DeviceIcon = device.icon;

  return (
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-4">
      <IconTile
        icon={DeviceIcon}
        shape="circle"
        size="lg"
        tone={viewState.deviceTone}
        className={viewState.deviceClassName}
        iconClassName="size-4"
      />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-semibold text-base text-ink leading-6">
            {device.label}
          </p>
          {viewState.isCurrentSession && (
            <StatusPill size="xs" tone="teal" surface="soft">
              Current
            </StatusPill>
          )}
        </div>
        <SessionTimestampFacts session={session} />
        <SessionUserAgentTooltip userAgent={session.userAgent} />
      </div>
    </div>
  );
}

function SessionTimestampFacts({ session }: { session: AuthSession }) {
  return (
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
  );
}

function SessionUserAgentTooltip({
  userAgent,
}: {
  userAgent: string | null | undefined;
}) {
  if (!userAgent) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="mt-3 block max-w-3xl cursor-help truncate border-0 bg-transparent p-0 text-left text-slate-muted/75 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        >
          {userAgent}
        </button>
      </TooltipTrigger>
      <TooltipContent>{userAgent}</TooltipContent>
    </Tooltip>
  );
}

function SessionRevokeDialog({
  actionState,
  isRevoking,
  onConfirm,
}: {
  actionState: SessionActionState;
  isRevoking: boolean;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ActionDialog
      cancelLabel="Keep session"
      confirmLabel={isRevoking ? "Signing out..." : actionState.actionLabel}
      description={actionState.actionDescription}
      details={actionState.details}
      disabled={actionState.disabled}
      loading={isRevoking}
      onConfirm={onConfirm}
      title={actionState.actionTitle}
      tone={actionState.tone}
      trigger={
        <Button
          type="button"
          variant={actionState.triggerVariant}
          size="sm"
          className="w-full md:w-auto"
          disabled={actionState.disabled}
        >
          <LogOut size={14} />
          {actionState.triggerLabel}
        </Button>
      }
    />
  );
}
