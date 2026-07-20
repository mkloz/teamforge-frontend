import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Gauge,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { useState } from "react";

import { adminPilotOperationsReadinessQueryOptions } from "@/features/admin/api/admin-pilot-operations.api";
import { AdminPilotCoverageControls } from "@/features/admin/components/admin-pilot-coverage-controls/admin-pilot-coverage-controls";
import { coverageErrorMessage } from "@/features/admin/components/admin-pilot-coverage-controls/coverage-declaration-form";
import { OperationalSignals } from "@/features/admin/components/admin-pilot-operations-readiness/operational-signals";
import { ReadinessSectionHeading } from "@/features/admin/components/admin-pilot-operations-readiness/readiness-section-heading";
import {
  PILOT_OPERATIONS_ACTION_COPY,
  pilotOperationsReasonCopy,
} from "@/features/admin/lib/pilot-operations-language";
import type { AdminPilotOperationsReadiness as Readiness } from "@/features/admin/schemas/admin-pilot-operations.schema";
import { getOperatorControlErrorKind } from "@/features/operator/public/operator-governance";
import { useOperatorSessionStepUp } from "@/features/operator/public/use-operator-session-step-up";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const ACTION_KEYS = [
  "newProposalExposure",
  "proposalMaterialization",
  "firstStrangerChat",
] as const;

export function AdminPilotOperationsReadiness() {
  const readinessQuery = useQuery(adminPilotOperationsReadinessQueryOptions());
  const { hasCurrentStepUp, rejectCurrentStepUp, sessionQuery } =
    useOperatorSessionStepUp();
  const [announcement, setAnnouncement] = useState("");
  const [commandError, setCommandError] = useState<string | null>(null);

  if (readinessQuery.isPending) return <ReadinessLoading />;
  if (readinessQuery.isError) {
    return <ReadinessLoadError onRetry={() => void readinessQuery.refetch()} />;
  }

  const readiness = readinessQuery.data;
  const ownsControls = Boolean(
    sessionQuery.data?.roles.includes("OWNER_ADMIN") &&
      !sessionQuery.data.breakGlass,
  );
  const commandsEnabled = ownsControls && hasCurrentStepUp;
  const handleCommandError = (error: unknown) => {
    setAnnouncement("");
    setCommandError(coverageErrorMessage(error));
    const errorKind = getOperatorControlErrorKind(error);
    if (errorKind === "STALE_SESSION") rejectCurrentStepUp();
    if (errorKind === "STALE_VERSION") void readinessQuery.refetch();
  };

  return (
    <div className="grid gap-8">
      <ReadinessSummary readiness={readiness} />
      <ActionReadiness readiness={readiness} />
      <OperationalSignals readiness={readiness} />
      <CoverageCommandAccess
        ownsControls={ownsControls}
        sessionQuery={sessionQuery}
        hasCurrentStepUp={hasCurrentStepUp}
      />
      {commandError ? (
        <CoverageCommandError
          message={commandError}
          onDismiss={() => setCommandError(null)}
        />
      ) : null}
      {announcement ? (
        <p
          className="border-primary/20 border-y py-4 text-primary text-sm"
          role="status"
        >
          {announcement}
        </p>
      ) : null}
      <AdminPilotCoverageControls
        commandsEnabled={commandsEnabled}
        coverage={readiness.coverage}
        eligibleOperators={readiness.eligibleOperators}
        onCommandError={handleCommandError}
        onUpdated={(message) => {
          setCommandError(null);
          setAnnouncement(message);
        }}
      />
    </div>
  );
}

function ReadinessSummary({ readiness }: { readiness: Readiness }) {
  const ready = readiness.status === "READY";

  return (
    <section
      aria-labelledby="operations-readiness-heading"
      className="border-border border-t pt-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
            <Gauge className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <h2
              id="operations-readiness-heading"
              className="font-semibold text-base text-ink"
            >
              Operational readiness
            </h2>
            <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
              The server evaluates pilot gates, coverage, moderation safeguards,
              worker health, and urgent queues together.
            </p>
          </div>
        </div>
        <StatusPill size="sm" surface="soft" tone={ready ? "teal" : "amber"}>
          {ready ? "Ready" : "Needs attention"}
        </StatusPill>
      </div>

      {ready ? (
        <p className="mt-5 border-border border-t py-4 text-ink text-sm">
          Every required server check is currently passing.
        </p>
      ) : (
        <div className="mt-5 border-border border-t pt-4">
          <h3 className="font-semibold text-ink text-sm">
            What needs attention
          </h3>
          <ul className="mt-3 grid gap-2 text-slate-muted text-sm leading-relaxed sm:grid-cols-2">
            {readiness.reasonCodes.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <AlertTriangle
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>{pilotOperationsReasonCopy(reason)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-slate-muted text-xs leading-relaxed">
        Evaluated <AdminDateTime value={readiness.evaluatedAt} />
      </p>
    </section>
  );
}

function ActionReadiness({ readiness }: { readiness: Readiness }) {
  return (
    <section
      aria-labelledby="pilot-actions-heading"
      className="border-border border-t pt-6"
    >
      <ReadinessSectionHeading
        description="Each pilot action is allowed only when its complete server-owned check passes."
        icon={ShieldCheck}
        id="pilot-actions-heading"
        title="Pilot actions"
      />
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {ACTION_KEYS.map((key) => {
          const action = readiness.actions[key];
          const copy = PILOT_OPERATIONS_ACTION_COPY[key];

          return (
            <div key={key} className="border-border border-b py-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink text-sm">
                    {copy.label}
                  </h3>
                  <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                    {copy.description}
                  </p>
                </div>
                <StatusPill
                  size="xs"
                  surface="soft"
                  tone={action.allowed ? "teal" : "amber"}
                >
                  {action.allowed ? "Allowed" : "Blocked"}
                </StatusPill>
              </div>
              {!action.allowed ? (
                <details className="mt-3 text-sm">
                  <summary className="cursor-pointer font-semibold text-primary text-xs">
                    {action.reasonCodes.length} blocking check
                    {action.reasonCodes.length === 1 ? "" : "s"}
                  </summary>
                  <ul className="mt-2 grid gap-1.5 text-slate-muted text-xs leading-relaxed">
                    {action.reasonCodes.map((reason) => (
                      <li key={reason}>{pilotOperationsReasonCopy(reason)}</li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CoverageCommandAccess({
  hasCurrentStepUp,
  ownsControls,
  sessionQuery,
}: {
  hasCurrentStepUp: boolean;
  ownsControls: boolean;
  sessionQuery: ReturnType<typeof useOperatorSessionStepUp>["sessionQuery"];
}) {
  if (sessionQuery.isPending) {
    return (
      <div
        className="flex items-center gap-3 border-border border-y py-5 text-slate-muted text-sm"
        role="status"
      >
        <RefreshCw className="size-4 animate-spin" aria-hidden="true" />
        Checking coverage permissions
      </div>
    );
  }

  if (sessionQuery.isError) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-border border-y py-5">
        <p className="text-slate-muted text-sm">
          Coverage permissions could not be checked. Changes remain disabled.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => void sessionQuery.refetch()}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    );
  }

  if (!ownsControls) {
    return (
      <div className="flex items-start gap-3 border-border border-y py-5">
        <ShieldOff
          className="mt-0.5 size-5 shrink-0 text-primary"
          aria-hidden="true"
        />
        <div className="grid gap-1">
          <h2 className="font-semibold text-ink text-sm">Read-only access</h2>
          <p className="text-slate-muted text-sm">
            Coverage changes require a standard owner administrator session.
          </p>
        </div>
      </div>
    );
  }

  if (!hasCurrentStepUp) {
    return (
      <div className="flex items-start gap-3 border-accent/30 border-y bg-accent/8 py-5 text-amber-900 dark:text-amber-200">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <div className="grid gap-1">
          <h2 className="font-semibold text-sm">Recent sign-in required</h2>
          <p className="text-sm">
            Readiness remains visible, but coverage changes stay disabled until
            admin access is verified again.
          </p>
        </div>
      </div>
    );
  }

  return null;
}

function CoverageCommandError({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div
      className="flex flex-wrap items-center justify-between gap-3 border-destructive/30 border-y py-5"
      role="alert"
    >
      <p className="max-w-2xl text-destructive text-sm">{message}</p>
      <Button type="button" variant="outline" size="sm" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  );
}

function ReadinessLoading() {
  return (
    <div
      className="grid gap-8 border-border border-t pt-6"
      role="status"
      aria-label="Loading operational readiness"
    >
      {[0, 1, 2, 3].map((section) => (
        <div key={section} className="grid gap-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full max-w-2xl" />
          <Skeleton className="h-24 w-full rounded-2xl" />
        </div>
      ))}
    </div>
  );
}

function ReadinessLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-labelledby="operations-readiness-error"
      className="border-border border-t py-8"
    >
      <AlertTriangle className="size-8 text-accent" aria-hidden="true" />
      <h2
        id="operations-readiness-error"
        className="mt-3 font-semibold text-ink text-lg"
      >
        Operational readiness is unavailable
      </h2>
      <p className="mt-1 max-w-xl text-slate-muted text-sm leading-relaxed">
        TeamForge could not load the server's readiness checks or coverage
        options. No readiness state is shown until the server can be checked.
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-4"
        onClick={onRetry}
      >
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </section>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}
