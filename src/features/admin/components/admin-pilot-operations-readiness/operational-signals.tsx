import { ListChecks, ServerCog, Siren } from "lucide-react";
import type { ReactNode } from "react";

import { ReadinessSectionHeading } from "@/features/admin/components/admin-pilot-operations-readiness/readiness-section-heading";
import { PILOT_OPERATIONS_WORKER_LABELS } from "@/features/admin/lib/pilot-operations-language";
import type { AdminPilotOperationsReadiness as Readiness } from "@/features/admin/schemas/admin-pilot-operations.schema";
import { cn } from "@/shared/lib/utils";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();

interface SignalRow {
  description: ReactNode;
  label: string;
  state: string;
  tone: "amber" | "neutral" | "teal";
  value?: number;
}

export function OperationalSignals({ readiness }: { readiness: Readiness }) {
  return (
    <div className="grid gap-8">
      <ReadinessSignals rows={buildReadinessSignalRows(readiness)} />
      <SafetyQueueSignals rows={buildSafetyQueueRows(readiness)} />
      <WorkerSignals workers={readiness.workers} />
    </div>
  );
}

function ReadinessSignals({ rows }: { rows: SignalRow[] }) {
  const passing = rows.filter((row) => row.tone === "teal").length;

  return (
    <section aria-labelledby="pilot-readiness-signals" className="pt-2">
      <ReadinessSectionHeading
        description="Authoritative cohort and moderation checks used in the readiness decision."
        icon={ListChecks}
        id="pilot-readiness-signals"
        title="Readiness signals"
      />

      <div className="grouped-surface mt-4 grid overflow-hidden rounded-2xl">
        <div className="grid gap-6 bg-card p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-4">
            <p className="font-semibold text-ink text-sm">
              {passing} of {rows.length} checks passing
            </p>
            <p className="text-slate-muted text-xs tabular-nums">
              {Math.round((passing / rows.length) * 100)}%
            </p>
          </div>
          <div
            className="grid gap-1.5"
            style={{
              gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))`,
            }}
            aria-hidden="true"
          >
            {rows.map((row) => (
              <span
                key={row.label}
                className={cn(
                  "h-2 rounded-full",
                  row.tone === "teal"
                    ? "bg-primary"
                    : row.tone === "amber"
                      ? "bg-accent"
                      : "bg-muted",
                )}
              />
            ))}
          </div>
        </div>

        <dl className="grouped-surface grid sm:grid-cols-2">
          {rows.map((row) => (
            <div key={row.label} className="grid gap-1 bg-card p-5 sm:px-6">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="font-semibold text-ink text-sm">{row.label}</dt>
                <dd
                  className={cn(
                    "shrink-0 font-medium text-xs",
                    row.tone === "teal"
                      ? "text-primary"
                      : row.tone === "amber"
                        ? "text-accent"
                        : "text-slate-muted",
                  )}
                >
                  {row.state}
                </dd>
              </div>
              <p className="text-pretty text-slate-muted text-xs leading-relaxed">
                {row.description}
              </p>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function SafetyQueueSignals({ rows }: { rows: SignalRow[] }) {
  const total = rows.reduce((sum, row) => sum + (row.value ?? 0), 0);
  const maximum = Math.max(1, ...rows.map((row) => row.value ?? 0));
  const shortLabels = ["Critical", "Urgent", "Appeals", "Reviews", "Contests"];

  return (
    <section aria-labelledby="pilot-safety-queues" className="pt-2">
      <ReadinessSectionHeading
        description="Open safety work that must be cleared before pilot operations are ready."
        icon={Siren}
        id="pilot-safety-queues"
        title="Urgent safety queues"
      />

      <div className="grouped-surface mt-4 grid overflow-hidden rounded-2xl sm:grid-cols-[minmax(0,0.65fr)_minmax(0,1.35fr)]">
        <div className="grid content-center gap-1 bg-card p-5 sm:p-6">
          <p
            className={cn(
              "font-semibold text-4xl tabular-nums",
              total === 0 ? "text-primary" : "text-accent",
            )}
          >
            {NUMBER_FORMATTER.format(total)}
          </p>
          <p className="font-semibold text-ink text-sm">
            {total === 0 ? "Urgent queues clear" : "items need intervention"}
          </p>
          <p className="mt-1 text-pretty text-slate-muted text-xs leading-relaxed">
            {total === 0
              ? "No urgent work is currently holding pilot activity."
              : "Open items are grouped by the deadline or assignment failure that triggered them."}
          </p>
        </div>

        <div
          className="grid h-40 grid-cols-5 items-end gap-2 bg-card p-5 sm:h-52 sm:gap-3 sm:p-6"
          role="img"
          aria-label={`${total} urgent safety queue items across ${rows.length} queues`}
        >
          {rows.map((row, index) => {
            const value = row.value ?? 0;
            const height =
              value === 0 ? 4 : Math.max(18, (value / maximum) * 96);

            return (
              <div key={row.label} className="grid min-w-0 gap-2">
                <p className="text-center font-semibold text-ink text-sm tabular-nums">
                  {NUMBER_FORMATTER.format(value)}
                </p>
                <div className="flex h-16 items-end justify-center sm:h-24">
                  <span
                    className={cn(
                      "w-full max-w-10 rounded-md",
                      value === 0 ? "bg-muted" : "bg-accent",
                    )}
                    style={{ height }}
                  />
                </div>
                <p className="truncate text-center text-slate-muted text-xs">
                  {shortLabels[index]}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function WorkerSignals({ workers }: { workers: Readiness["workers"] }) {
  return (
    <section aria-labelledby="pilot-worker-signals" className="pt-2">
      <ReadinessSectionHeading
        description="Queue totals and health states reported by each required worker."
        icon={ServerCog}
        id="pilot-worker-signals"
        title="Worker signals"
      />

      <div className="mt-4 overflow-hidden rounded-2xl bg-background">
        <div className="hidden grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(4rem,0.5fr))_minmax(8rem,1fr)] gap-4 bg-card px-5 py-3 text-slate-muted text-xs sm:grid">
          <span>Worker</span>
          <span>Queue</span>
          <span>Failed</span>
          <span>Dead</span>
          <span>Heartbeat</span>
        </div>
        <div className="grouped-surface grid">
          {workers.map((worker) => (
            <div
              key={worker.kind}
              className="grid gap-4 bg-card px-5 py-4 sm:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(4rem,0.5fr))_minmax(8rem,1fr)] sm:items-center"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-2 shrink-0 rounded-full",
                      worker.state === "HEALTHY"
                        ? "bg-primary"
                        : worker.state === "PAUSED"
                          ? "bg-accent"
                          : "bg-danger",
                    )}
                    aria-hidden="true"
                  />
                  <h3 className="truncate font-semibold text-ink text-sm">
                    {PILOT_OPERATIONS_WORKER_LABELS[worker.kind]}
                  </h3>
                </div>
                <p className="mt-1 text-slate-muted text-xs">
                  {workerState(worker.state)}
                  {!worker.enabled
                    ? " · disabled"
                    : worker.paused
                      ? " · paused"
                      : ""}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 sm:contents">
                <WorkerMetric label="Queue" value={worker.queueDepth} />
                <WorkerMetric label="Failed" value={worker.failedJobs} />
                <WorkerMetric label="Dead" value={worker.deadJobs} />
              </div>

              <p className="text-slate-muted text-xs leading-relaxed">
                <span className="sm:hidden">Heartbeat · </span>
                {worker.heartbeatAt ? (
                  <AdminDateTime value={worker.heartbeatAt} />
                ) : (
                  "Not reported"
                )}
                {worker.oldestPendingAt ? (
                  <>
                    <br />
                    Oldest <AdminDateTime value={worker.oldestPendingAt} />
                  </>
                ) : null}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkerMetric({ label, value }: { label: string; value: number }) {
  return (
    <p className="grid gap-1 text-sm sm:block">
      <span className="text-slate-muted text-xs sm:hidden">{label}</span>
      <span className="font-semibold text-ink tabular-nums">
        {NUMBER_FORMATTER.format(value)}
      </span>
    </p>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function booleanSignal(
  label: string,
  description: string,
  value: boolean,
  readyState = "Ready",
  blockedState = "Needs attention",
): SignalRow {
  return {
    description,
    label,
    state: value ? readyState : blockedState,
    tone: value ? "teal" : "amber",
  };
}

function countSignal(
  label: string,
  description: string,
  value: number,
): SignalRow {
  return {
    description,
    label,
    state: NUMBER_FORMATTER.format(value),
    tone: value === 0 ? "teal" : "amber",
    value,
  };
}

function buildReadinessSignalRows(readiness: Readiness): SignalRow[] {
  return [
    booleanSignal(
      "Cohort configured",
      "A controlled cohort exists on the server.",
      readiness.pilot.cohortConfigured,
      "Configured",
      "Not configured",
    ),
    booleanSignal(
      "Cohort window",
      "The current time is inside the controlled pilot window.",
      readiness.pilot.cohortWithinWindow,
      "Within window",
      "Outside window",
    ),
    booleanSignal(
      "Cohort cap",
      "The cohort is inside its configured member cap.",
      readiness.pilot.cohortWithinCap,
      "Within cap",
      "Cap exceeded",
    ),
    booleanSignal(
      "Required cohort size",
      "The server's required pilot cohort size has been reached.",
      readiness.pilot.minimumCohortSizeMet,
      "Met",
      "Not met",
    ),
    {
      description:
        "Whether an active moderation policy configuration is currently present.",
      label: "Moderation policy",
      state: readiness.moderation.activeConfigurationPresent
        ? "Present"
        : "Not present",
      tone: readiness.moderation.activeConfigurationPresent
        ? "teal"
        : readiness.reasonCodes.includes(
              "ACTIVE_MODERATION_CONFIGURATION_MISSING",
            )
          ? "amber"
          : "neutral",
    },
    booleanSignal(
      "Evaluation approval",
      "The active policy has the exact current approval required by the server.",
      readiness.moderation.evaluationApprovalCurrent,
      "Current",
      "Missing or stale",
    ),
    countSignal(
      "Preservation failures",
      "Evidence records whose preservation work did not complete.",
      readiness.moderation.preservationFailures,
    ),
    countSignal(
      "Missing preservation jobs",
      "Evidence records without a preservation job.",
      readiness.moderation.preservationOrphans,
    ),
  ];
}

function buildSafetyQueueRows(readiness: Readiness): SignalRow[] {
  return [
    countSignal(
      "Unassigned critical cases",
      "Open critical cases without a current operator assignment.",
      readiness.safetyQueues.unassignedCriticalCases,
    ),
    countSignal(
      "Overdue urgent cases",
      "Open urgent cases at or past their due time.",
      readiness.safetyQueues.overdueUrgentCases,
    ),
    countSignal(
      "Expired appeals",
      "Open appeals at or past their response deadline.",
      readiness.safetyQueues.expiredOpenAppeals,
    ),
    countSignal(
      "Expired outcome reviews",
      "Open outcome reviews at or past their response deadline.",
      readiness.safetyQueues.expiredOpenOutcomeReviews,
    ),
    countSignal(
      "Expired containment reviews",
      "Open protective containment reviews at or past their response deadline.",
      readiness.safetyQueues.expiredOpenContainmentContests,
    ),
  ];
}

function workerState(state: Readiness["workers"][number]["state"]) {
  if (state === "HEALTHY") return "Healthy";
  if (state === "PAUSED") return "Paused";
  return "Unavailable";
}
