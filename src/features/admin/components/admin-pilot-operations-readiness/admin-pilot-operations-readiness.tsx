import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Gauge, RefreshCw, Workflow } from "lucide-react";

import { adminPilotOperationsReadinessQueryOptions } from "@/features/admin/api/admin-pilot-operations.api";
import { OperationalSignals } from "@/features/admin/components/admin-pilot-operations-readiness/operational-signals";
import { ReadinessSectionHeading } from "@/features/admin/components/admin-pilot-operations-readiness/readiness-section-heading";
import {
  PILOT_OPERATIONS_ACTION_COPY,
  pilotOperationsReasonCopy,
} from "@/features/admin/lib/pilot-operations-language";
import type { AdminPilotOperationsReadiness as Readiness } from "@/features/admin/schemas/admin-pilot-operations.schema";
import {
  AdminSummaryMetric,
  AdminSummaryStrip,
} from "@/shared/components/admin/admin-visuals";
import { Button } from "@/shared/components/ui/button";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

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

  if (readinessQuery.isPending) return <ReadinessLoading />;
  if (readinessQuery.isError) {
    return <ReadinessLoadError onRetry={() => void readinessQuery.refetch()} />;
  }

  const readiness = readinessQuery.data;
  return (
    <div className="grid gap-8">
      <ReadinessSummary readiness={readiness} />
      <ActionReadiness readiness={readiness} />
      <CollapsibleSection
        variant="panel"
        summary={
          <div className="grid gap-1">
            <span className="text-base">Operational signals</span>
            <span className="font-normal text-slate-muted text-xs">
              Cohort checks, urgent queues, and worker-level evidence
            </span>
          </div>
        }
      >
        <OperationalSignals readiness={readiness} />
      </CollapsibleSection>
    </div>
  );
}

function ReadinessSummary({ readiness }: { readiness: Readiness }) {
  const ready = readiness.status === "READY";
  const allowedActions = ACTION_KEYS.filter(
    (key) => readiness.actions[key].allowed,
  ).length;
  const visibleReasons = readiness.reasonCodes.slice(0, 3);
  const remainingReasons = readiness.reasonCodes.length - visibleReasons.length;

  return (
    <section aria-labelledby="operations-readiness-heading" className="pt-2">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <h2
            id="operations-readiness-heading"
            className="flex items-center gap-2 font-semibold text-base text-ink"
          >
            <Gauge className="size-4 shrink-0" aria-hidden="true" />
            Operational readiness
          </h2>
          <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            The server evaluates rollout gates, moderation safeguards, worker
            health, and urgent queues together.
          </p>
        </div>
        <p
          className={cn(
            "flex items-center gap-2 font-semibold text-sm",
            ready ? "text-foreground" : "text-accent",
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              ready ? "bg-primary" : "bg-accent",
            )}
            aria-hidden="true"
          />
          {ready ? "Ready" : "Needs attention"}
        </p>
      </div>

      <AdminSummaryStrip className="mt-5">
        <AdminSummaryMetric
          label="Current decision"
          value={ready ? "Proceed" : "Hold"}
          tone={ready ? "success" : "danger"}
          detail={ready ? "All required checks pass" : "Beta activity blocked"}
        />
        <AdminSummaryMetric
          label="Actions open"
          value={`${allowedActions}/${ACTION_KEYS.length}`}
          tone={
            allowedActions === ACTION_KEYS.length
              ? "success"
              : allowedActions > 0
                ? "warning"
                : "danger"
          }
          detail="Server-authorized paths"
        />
        <AdminSummaryMetric
          label="Blocking checks"
          value={readiness.reasonCodes.length}
          tone={readiness.reasonCodes.length > 0 ? "danger" : "success"}
          detail="Across every dependency"
        />
        <AdminSummaryMetric
          label="Workers healthy"
          value={`${readiness.workers.filter((worker) => worker.state === "HEALTHY").length}/${readiness.workers.length}`}
          tone={
            readiness.workers.every((worker) => worker.state === "HEALTHY")
              ? "success"
              : "warning"
          }
          detail="Required background services"
        />
      </AdminSummaryStrip>

      <div className="mt-0.5 grid gap-6 rounded-2xl bg-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-5">
          <div>
            <p className="text-slate-muted text-xs">Decision rationale</p>
            <p className="mt-1 font-semibold text-ink text-xl">
              {ready ? "Beta can proceed" : "Hold beta activity"}
            </p>
          </div>
          <p className="shrink-0 font-semibold text-slate-muted text-xs">
            Evaluated <AdminDateTime value={readiness.evaluatedAt} />
          </p>
        </div>

        {ready ? (
          <p className="text-ink text-sm">
            Every required server check is currently passing.
          </p>
        ) : (
          <div>
            <h3 className="font-semibold text-ink text-sm">
              First blockers to clear
            </h3>
            <ul className="mt-3 grid gap-3 text-slate-muted text-sm leading-relaxed sm:grid-cols-3">
              {visibleReasons.map((reason) => (
                <li key={reason} className="flex items-start gap-2">
                  <AlertTriangle
                    className="mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{pilotOperationsReasonCopy(reason)}</span>
                </li>
              ))}
            </ul>
            {remainingReasons > 0 ? (
              <p className="mt-3 text-slate-muted text-xs">
                +{remainingReasons} more checks are reflected in the action
                paths below.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function ActionReadiness({ readiness }: { readiness: Readiness }) {
  return (
    <section aria-labelledby="pilot-actions-heading" className="pt-2">
      <ReadinessSectionHeading
        description="Each rollout action is allowed only when its complete server-owned check passes."
        icon={Workflow}
        id="pilot-actions-heading"
        title="Rollout actions"
      />
      <div className="grouped-surface mt-4 grid overflow-hidden rounded-2xl md:grid-cols-3">
        {ACTION_KEYS.map((key, index) => {
          const action = readiness.actions[key];
          const copy = PILOT_OPERATIONS_ACTION_COPY[key];

          return (
            <section
              key={key}
              className="grid content-start gap-3 bg-card p-5 sm:p-6"
            >
              <div
                className={cn(
                  "flex items-center justify-between gap-3 font-semibold text-xs",
                  action.allowed ? "text-foreground" : "text-accent",
                )}
              >
                <span className="tabular-nums">
                  0{index + 1} · {action.allowed ? "Open" : "Blocked"}
                </span>
                <span>{action.reasonCodes.length} checks</span>
              </div>
              <div>
                <h3 className="font-semibold text-ink text-sm">{copy.label}</h3>
                <p className="mt-1 text-pretty text-slate-muted text-xs leading-relaxed">
                  {copy.description}
                </p>
              </div>
              {!action.allowed ? (
                <CollapsibleSection summary="Review blockers">
                  <ul className="grid gap-1.5 text-slate-muted text-xs leading-relaxed">
                    {action.reasonCodes.map((reason) => (
                      <li key={reason}>{pilotOperationsReasonCopy(reason)}</li>
                    ))}
                  </ul>
                </CollapsibleSection>
              ) : null}
            </section>
          );
        })}
      </div>
    </section>
  );
}

function ReadinessLoading() {
  return (
    <div
      className="grid gap-8 pt-2"
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
    <section aria-labelledby="operations-readiness-error" className="py-8">
      <AlertTriangle className="size-8" aria-hidden="true" />
      <h2
        id="operations-readiness-error"
        className="mt-3 font-semibold text-ink text-lg"
      >
        Operational readiness is unavailable
      </h2>
      <p className="mt-1 max-w-xl text-slate-muted text-sm leading-relaxed">
        TeamForge could not load the server's readiness checks. No readiness
        state is shown until the server can be checked.
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
