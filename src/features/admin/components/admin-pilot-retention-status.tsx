import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotRetentionQueryOptions } from "@/features/admin/api/admin.api";
import type { AdminPilotRetentionStatus as RetentionStatus } from "@/features/admin/schemas/admin-pilot-retention.schema";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();

type RetentionRun = NonNullable<RetentionStatus["lastRun"]>;
type RetentionSource = RetentionStatus["sourceCompleteness"][number];
type RetentionFailureStage = Extract<
  RetentionRun,
  { status: "FAILED" }
>["lastFailureStage"];

const SOURCE_LABELS: Record<RetentionSource["source"], string> = {
  CANDIDATE_WILLINGNESS: "Candidate response history",
  OUTCOME_EVENTS: "Pilot outcome history",
  REQUEST_INTAKE: "Request intake history",
};

const FAILURE_COPY: Record<RetentionFailureStage, string> = {
  REGISTRY:
    "The required retention functions were not available, so no source work could finish.",
  COHORT_WINDOW:
    "The scheduled cutoff overlaps a protected cohort measurement window, so the run stopped safely.",
  CANDIDATE_WILLINGNESS:
    "Candidate response history could not be processed during the latest run.",
  OUTCOME_EVENTS:
    "Pilot outcome history could not be processed during the latest run.",
  REQUEST_INTAKE:
    "Request intake history could not be processed during the latest run.",
  FINALIZATION:
    "The source work finished, but the run could not be safely recorded as complete.",
};

export function AdminPilotRetentionStatus({
  canManage,
}: {
  canManage: boolean;
}) {
  const retentionQuery = useQuery({
    ...adminPilotRetentionQueryOptions(),
    enabled: canManage,
  });

  if (!canManage) {
    return <AdminPilotRetentionUnavailable />;
  }

  if (retentionQuery.isPending) {
    return <AdminPilotRetentionLoading />;
  }

  if (retentionQuery.isError) {
    return (
      <AdminPilotRetentionError onRetry={() => void retentionQuery.refetch()} />
    );
  }

  return <AdminPilotRetentionContent status={retentionQuery.data} />;
}

function AdminPilotRetentionContent({ status }: { status: RetentionStatus }) {
  const displayState = getDisplayState(status);
  const failedRun = status.lastRun?.status === "FAILED" ? status.lastRun : null;

  return (
    <section
      aria-labelledby="pilot-retention-heading"
      className="border-border border-t pt-6"
    >
      <RetentionHeading displayState={displayState} />

      <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2">
        <RetentionDetail
          description="Whether the approved server process is available to run."
          label="Scheduled retention"
        >
          <StatusPill
            size="xs"
            surface="soft"
            tone={status.enabled ? "teal" : "neutral"}
          >
            {status.enabled ? "Enabled" : "Disabled"}
          </StatusPill>
        </RetentionDetail>
        <RetentionDetail
          description="Records older than this period are eligible once protected cohort windows are clear."
          label="Approved retention period"
          value={
            status.retentionDays === null
              ? "Not configured"
              : `${NUMBER_FORMATTER.format(status.retentionDays)} days`
          }
        />
        <RetentionDetail
          description="The most recent scheduled attempt, whether or not it finished."
          label="Latest run"
        >
          {status.lastRun ? (
            <RetentionRunSummary run={status.lastRun} />
          ) : (
            "No run recorded"
          )}
        </RetentionDetail>
        <RetentionDetail
          description="The latest run that completed all required source work."
          label="Last successful run"
        >
          {status.lastSuccess ? (
            <RetentionRunSummary run={status.lastSuccess} />
          ) : (
            "No successful run yet"
          )}
        </RetentionDetail>
      </dl>

      {failedRun ? <RetentionFailureNotice run={failedRun} /> : null}

      <RetentionSourceStatus sources={status.sourceCompleteness} />

      <p className="mt-5 text-slate-muted text-xs leading-relaxed">
        Evaluated <AdminDateTime value={status.evaluatedAt} />
      </p>
    </section>
  );
}

function RetentionHeading({
  displayState,
}: {
  displayState?: { label: string; tone: StatusPillTone };
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Database className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="pilot-retention-heading"
            className="font-semibold text-base text-ink"
          >
            Pilot data retention
          </h2>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            Read-only status for the approved pilot data removal schedule and
            each source it covers.
          </p>
        </div>
      </div>
      {displayState ? (
        <StatusPill size="sm" surface="soft" tone={displayState.tone}>
          {displayState.label}
        </StatusPill>
      ) : null}
    </div>
  );
}

function RetentionDetail({
  children,
  description,
  label,
  value,
}: {
  children?: ReactNode;
  description: string;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
      <dt className="min-w-0">
        <span className="block font-semibold text-ink text-sm">{label}</span>
        <span className="mt-0.5 block text-slate-muted text-xs leading-relaxed">
          {description}
        </span>
      </dt>
      <dd className="min-w-0 max-w-64 text-right font-semibold text-ink text-sm tabular-nums">
        {children ?? value}
      </dd>
    </div>
  );
}

function RetentionRunSummary({ run }: { run: RetentionRun }) {
  const display = getRunDisplay(run.status);

  return (
    <span className="grid justify-items-end gap-1">
      <StatusPill size="xs" surface="soft" tone={display.tone}>
        {display.label}
      </StatusPill>
      <span className="font-normal text-slate-muted text-xs leading-relaxed">
        Cutoff <AdminDateTime value={run.cutoffAt} />
      </span>
      {run.completedAt ? (
        <span className="font-normal text-slate-muted text-xs leading-relaxed">
          Finished <AdminDateTime value={run.completedAt} />
        </span>
      ) : run.startedAt ? (
        <span className="font-normal text-slate-muted text-xs leading-relaxed">
          Started <AdminDateTime value={run.startedAt} />
        </span>
      ) : null}
    </span>
  );
}

function RetentionFailureNotice({
  run,
}: {
  run: Extract<RetentionRun, { status: "FAILED" }>;
}) {
  return (
    <div className="mt-5 flex items-start gap-3 border-border border-y py-4">
      <AlertTriangle
        className="mt-0.5 size-4 shrink-0 text-destructive"
        aria-hidden="true"
      />
      <div>
        <h3 className="font-semibold text-ink text-sm">
          Latest run did not finish
        </h3>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          {FAILURE_COPY[run.lastFailureStage]} The attempt is recorded; the
          scheduled process can retry safely after the cause is resolved.
        </p>
      </div>
    </div>
  );
}

function RetentionSourceStatus({
  sources,
}: {
  sources: RetentionStatus["sourceCompleteness"];
}) {
  return (
    <section
      aria-labelledby="pilot-retention-sources-heading"
      className="mt-6 border-border border-t pt-5"
    >
      <h3
        id="pilot-retention-sources-heading"
        className="font-semibold text-ink text-sm"
      >
        Source status
      </h3>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
        Function versions and removed-record totals from the latest successful
        work for each source.
      </p>

      <div className="mt-3 border-border border-t">
        {sources.map((source) => (
          <RetentionSourceRow key={source.source} source={source} />
        ))}
      </div>
    </section>
  );
}

function RetentionSourceRow({ source }: { source: RetentionSource }) {
  const retained = source.completeness === "COMPLETE";

  return (
    <div className="border-border border-b py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h4 className="font-semibold text-ink text-sm">
          {SOURCE_LABELS[source.source]}
        </h4>
        <StatusPill size="xs" surface="soft" tone={retained ? "teal" : "amber"}>
          {retained ? "Source complete" : "Source records removed"}
        </StatusPill>
      </div>
      <dl className="mt-3 grid gap-3 sm:grid-cols-3">
        <SourceDetail label="Function version">
          <span className="wrap-break-word">{source.functionVersion}</span>
        </SourceDetail>
        <SourceDetail label="Last successful cutoff">
          {source.lastSuccessfulCutoffAt ? (
            <AdminDateTime value={source.lastSuccessfulCutoffAt} />
          ) : (
            "Not recorded"
          )}
        </SourceDetail>
        <SourceDetail label="Records removed">
          {getRemovedRecordsLabel(source)}
        </SourceDetail>
      </dl>
    </div>
  );
}

function SourceDetail({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-w-0">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="mt-1 text-ink text-xs tabular-nums leading-relaxed">
        {children}
      </dd>
    </div>
  );
}

function AdminPilotRetentionUnavailable() {
  return (
    <section
      aria-labelledby="pilot-retention-heading"
      className="border-border border-t pt-6"
    >
      <RetentionHeading />
      <p className="mt-4 border-border border-t py-5 text-slate-muted text-sm leading-relaxed">
        Your admin session cannot view pilot retention status.
      </p>
    </section>
  );
}

function AdminPilotRetentionLoading() {
  return (
    <section
      aria-labelledby="pilot-retention-heading"
      className="border-border border-t pt-6"
      role="status"
    >
      <RetentionHeading />
      <div
        className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 border-border border-b py-4"
          >
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading pilot retention status</span>
    </section>
  );
}

function AdminPilotRetentionError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-labelledby="pilot-retention-heading"
      className="border-border border-t pt-6"
    >
      <RetentionHeading />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-border border-y py-4">
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="mt-0.5 size-4 shrink-0 text-destructive"
            aria-hidden="true"
          />
          <p className="text-slate-muted text-sm" role="alert">
            Pilot retention status could not be loaded. No run state is shown.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      </div>
    </section>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function getDisplayState(status: RetentionStatus): {
  label: string;
  tone: StatusPillTone;
} {
  if (!status.enabled) {
    return { label: "Disabled", tone: "neutral" };
  }
  if (status.lastRun?.status === "FAILED") {
    return { label: "Needs attention", tone: "destructive" };
  }
  if (
    status.lastRun?.status === "PENDING" ||
    status.lastRun?.status === "RUNNING"
  ) {
    return { label: "In progress", tone: "amber" };
  }
  if (!status.lastSuccess) {
    return { label: "Waiting for first run", tone: "amber" };
  }
  return { label: "Last run complete", tone: "teal" };
}

function getRunDisplay(status: RetentionRun["status"]): {
  label: string;
  tone: StatusPillTone;
} {
  return (
    {
      FAILED: { label: "Failed", tone: "destructive" },
      PENDING: { label: "Waiting", tone: "neutral" },
      RUNNING: { label: "In progress", tone: "amber" },
      SUCCEEDED: { label: "Completed", tone: "teal" },
    } satisfies Record<
      RetentionRun["status"],
      { label: string; tone: StatusPillTone }
    >
  )[status];
}

function getRemovedRecordsLabel(source: RetentionSource) {
  if (source.primaryDeletedCount === null) {
    return "Not recorded";
  }

  if (source.source === "CANDIDATE_WILLINGNESS") {
    return `${formatCountWithNoun(
      source.primaryDeletedCount,
      "invitation",
      "invitations",
    )} · ${formatCountWithNoun(
      source.secondaryDeletedCount ?? 0,
      "response",
      "responses",
    )}`;
  }
  if (source.source === "OUTCOME_EVENTS") {
    return formatCountWithNoun(
      source.primaryDeletedCount,
      "outcome record",
      "outcome records",
    );
  }
  return formatCountWithNoun(
    source.primaryDeletedCount,
    "request record",
    "request records",
  );
}

function formatCountWithNoun(count: number, singular: string, plural: string) {
  return `${NUMBER_FORMATTER.format(count)} ${count === 1 ? singular : plural}`;
}
