import { ServerCog, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

import { ReadinessSectionHeading } from "@/features/admin/components/admin-pilot-operations-readiness/readiness-section-heading";
import { PILOT_OPERATIONS_WORKER_LABELS } from "@/features/admin/lib/pilot-operations-language";
import type { AdminPilotOperationsReadiness as Readiness } from "@/features/admin/schemas/admin-pilot-operations.schema";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();

interface SignalRow {
  description: ReactNode;
  label: string;
  state: string;
  tone: StatusPillTone;
}

export function OperationalSignals({ readiness }: { readiness: Readiness }) {
  return (
    <div className="grid gap-8">
      <SignalSection
        description="Authoritative cohort and moderation checks used in the readiness decision."
        id="pilot-readiness-signals"
        rows={buildReadinessSignalRows(readiness)}
        title="Readiness signals"
      />
      <SignalSection
        description="Open safety work that must be cleared before pilot operations are ready."
        id="pilot-safety-queues"
        rows={buildSafetyQueueRows(readiness)}
        title="Urgent safety queues"
      />
      <WorkerSignals workers={readiness.workers} />
    </div>
  );
}

function SignalSection({
  description,
  id,
  rows,
  title,
}: {
  description: string;
  id: string;
  rows: SignalRow[];
  title: string;
}) {
  return (
    <section aria-labelledby={id} className="border-border border-t pt-6">
      <ReadinessSectionHeading
        description={description}
        icon={ShieldCheck}
        id={id}
        title={title}
      />
      <dl className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3"
          >
            <dt className="min-w-0">
              <span className="block font-semibold text-ink text-sm">
                {row.label}
              </span>
              <span className="mt-0.5 block text-slate-muted text-xs leading-relaxed">
                {row.description}
              </span>
            </dt>
            <dd className="shrink-0">
              <StatusPill size="xs" surface="soft" tone={row.tone}>
                {row.state}
              </StatusPill>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function WorkerSignals({ workers }: { workers: Readiness["workers"] }) {
  return (
    <section
      aria-labelledby="pilot-worker-signals"
      className="border-border border-t pt-6"
    >
      <ReadinessSectionHeading
        description="Queue totals and health states reported by each required worker."
        icon={ServerCog}
        id="pilot-worker-signals"
        title="Worker signals"
      />
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {workers.map((worker) => (
          <div key={worker.kind} className="border-border border-b py-4">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-semibold text-ink text-sm">
                {PILOT_OPERATIONS_WORKER_LABELS[worker.kind]}
              </h3>
              <StatusPill
                size="xs"
                surface="soft"
                tone={workerTone(worker.state)}
              >
                {workerState(worker.state)}
              </StatusPill>
            </div>
            <p className="mt-2 text-slate-muted text-xs leading-relaxed">
              {worker.enabled ? "Enabled" : "Disabled"}
              {worker.paused ? ", paused" : ", not paused"} · Queue{" "}
              {NUMBER_FORMATTER.format(worker.queueDepth)} · Failed{" "}
              {NUMBER_FORMATTER.format(worker.failedJobs)} · Cannot retry{" "}
              {NUMBER_FORMATTER.format(worker.deadJobs)}
            </p>
            <p className="mt-1 text-slate-muted text-xs leading-relaxed">
              Last heartbeat:{" "}
              {worker.heartbeatAt ? (
                <AdminDateTime value={worker.heartbeatAt} />
              ) : (
                "Not reported"
              )}
              {worker.oldestPendingAt ? (
                <>
                  {" "}
                  · Oldest pending:{" "}
                  <AdminDateTime value={worker.oldestPendingAt} />
                </>
              ) : null}
            </p>
          </div>
        ))}
      </div>
    </section>
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

function workerTone(
  state: Readiness["workers"][number]["state"],
): StatusPillTone {
  if (state === "HEALTHY") return "teal";
  if (state === "PAUSED") return "amber";
  return "destructive";
}

function workerState(state: Readiness["workers"][number]["state"]) {
  if (state === "HEALTHY") return "Healthy";
  if (state === "PAUSED") return "Paused";
  return "Unavailable";
}
