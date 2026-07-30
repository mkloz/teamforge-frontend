import { CalendarClock, Clock3, LogOut, Wifi } from "lucide-react";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { GroupedMenuItem } from "@/shared/components/ui/grouped-menu";
import { IconTile } from "@/shared/components/ui/icon-tile";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
    <GroupedMenuItem className={cn(viewState.rowHighlightClassName)}>
      <div className="lg:main-action-grid grid gap-4 px-3 py-3 sm:px-5 sm:py-4 lg:items-center">
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
    </GroupedMenuItem>
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
    <div className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-3">
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
          <p className="font-semibold text-ink text-sm leading-6">
            {device.label}
          </p>
          {viewState.isCurrentSession && (
            <StatusPill size="xs" tone="teal" surface="soft">
              Current
            </StatusPill>
          )}
        </div>
        <SessionTimestampFacts session={session} />
        <SessionTechnicalDetails session={session} />
      </div>
    </div>
  );
}

function SessionTimestampFacts({ session }: { session: AuthSession }) {
  return (
    <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1.5 text-slate-muted text-xs">
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
    </div>
  );
}

function SessionTechnicalDetails({ session }: { session: AuthSession }) {
  return (
    <CollapsibleSection
      className="mt-2 text-xs"
      summary="Technical details"
      triggerClassName="text-slate-muted"
    >
      <dl className="grid gap-2 text-slate-muted">
        <div className="flex items-start gap-2">
          <Wifi size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <div>
            <dt className="sr-only">IP address</dt>
            <dd>{session.ipAddress ?? "IP unknown"}</dd>
          </div>
        </div>
        {session.userAgent ? (
          <div>
            <dt className="sr-only">Browser details</dt>
            <dd className="break-all">{session.userAgent}</dd>
          </div>
        ) : null}
      </dl>
    </CollapsibleSection>
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
          className="w-full lg:w-auto"
          disabled={actionState.disabled}
        >
          <LogOut size={14} />
          {actionState.triggerLabel}
        </Button>
      }
    />
  );
}
