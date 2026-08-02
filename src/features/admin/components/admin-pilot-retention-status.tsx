import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Database, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotRetentionQueryOptions } from "@/features/admin/api/admin.api";
import type { AdminPilotRetentionStatus as RetentionStatus } from "@/features/admin/schemas/admin-pilot-retention.schema";
import { Button } from "@/shared/components/ui/button";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

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
type RetentionTone = "amber" | "destructive" | "neutral" | "teal";

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
    <section aria-labelledby="pilot-retention-heading" className="pt-2">
      <RetentionHeading displayState={displayState} />

      <RetentionOverview status={status} />

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
  displayState?: { label: string; tone: RetentionTone };
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="grid min-w-0 gap-1">
        <h2
          id="pilot-retention-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <Database className="size-4 shrink-0" aria-hidden="true" />
          Pilot data retention
        </h2>
        <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Read-only status for the approved pilot data removal schedule and each
          source it covers.
        </p>
      </div>
      {displayState ? (
        <p
          className={cn(
            "flex items-center gap-2 font-semibold text-sm",
            toneText(displayState.tone),
          )}
        >
          <span
            className={cn(
              "size-2 rounded-full",
              toneBackground(displayState.tone),
            )}
            aria-hidden="true"
          />
          {displayState.label}
        </p>
      ) : null}
    </div>
  );
}

function RetentionOverview({ status }: { status: RetentionStatus }) {
  const latestRun = status.lastRun
    ? getRunDisplay(status.lastRun.status)
    : null;
  const stages = [
    {
      label: "Schedule",
      state: status.enabled ? "Enabled" : "Disabled",
      tone: status.enabled ? "teal" : "amber",
    },
    {
      label: "Policy",
      state:
        status.retentionDays === null
          ? "Not configured"
          : `${NUMBER_FORMATTER.format(status.retentionDays)} days`,
      tone: status.retentionDays === null ? "amber" : "teal",
    },
    {
      label: "Latest run",
      state: latestRun?.label ?? "No run",
      tone: latestRun?.tone ?? "neutral",
    },
    {
      label: "Successful cutoff",
      state: status.lastSuccess
        ? DATE_TIME_FORMATTER.format(new Date(status.lastSuccess.cutoffAt))
        : "Not recorded",
      tone: status.lastSuccess ? "teal" : "neutral",
    },
  ] satisfies Array<{ label: string; state: string; tone: RetentionTone }>;

  return (
    <div className="mt-4 grid gap-6 rounded-2xl bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-slate-muted text-xs">Approved policy</p>
          <p className="mt-1 font-semibold text-ink text-xl">
            {status.retentionDays === null
              ? "Retention not configured"
              : `${NUMBER_FORMATTER.format(status.retentionDays)} day retention`}
          </p>
        </div>
        <p className="text-slate-muted text-xs">
          Protected cohort windows are never removed early.
        </p>
      </div>

      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))`,
        }}
        aria-hidden="true"
      >
        {stages.map((stage) => (
          <span
            key={stage.label}
            className={cn("h-2 rounded-full", toneBackground(stage.tone))}
          />
        ))}
      </div>

      <dl className="grid gap-5 sm:grid-cols-4">
        {stages.map((stage) => (
          <div key={stage.label} className="grid gap-1">
            <dt className="text-slate-muted text-xs">{stage.label}</dt>
            <dd
              className={cn(
                "font-semibold text-sm tabular-nums",
                toneText(stage.tone),
              )}
            >
              {stage.state}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function RetentionFailureNotice({
  run,
}: {
  run: Extract<RetentionRun, { status: "FAILED" }>;
}) {
  return (
    <Notice
      className="mt-5"
      icon={<AlertTriangle className="size-4" aria-hidden="true" />}
      role="alert"
      size="lg"
      tone="danger"
    >
      <p>
        <strong>Latest run did not finish</strong>
        <span className="mt-1 block max-w-2xl font-normal text-slate-muted">
          {FAILURE_COPY[run.lastFailureStage]} The attempt is recorded; the
          scheduled process can retry safely after the cause is resolved.
        </span>
      </p>
    </Notice>
  );
}

function RetentionSourceStatus({
  sources,
}: {
  sources: RetentionStatus["sourceCompleteness"];
}) {
  return (
    <section aria-labelledby="pilot-retention-sources-heading" className="mt-6">
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

      <div className="mt-4 overflow-hidden rounded-2xl bg-background">
        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(8rem,1fr)_minmax(7rem,0.8fr)] gap-4 bg-card px-5 py-3 text-slate-muted text-xs sm:grid">
          <span>Source</span>
          <span>Function</span>
          <span>Cutoff</span>
          <span>Removed</span>
        </div>
        <div className="grouped-surface grid">
          {sources.map((source) => (
            <RetentionSourceRow key={source.source} source={source} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RetentionSourceRow({ source }: { source: RetentionSource }) {
  const retained = source.completeness === "COMPLETE";

  return (
    <div className="grid gap-4 bg-card px-5 py-4 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1.5fr)_minmax(8rem,1fr)_minmax(7rem,0.8fr)] sm:items-center">
      <div className="min-w-0">
        <h4 className="font-semibold text-ink text-sm">
          {SOURCE_LABELS[source.source]}
        </h4>
        <p
          className={cn(
            "mt-1 font-medium text-xs",
            retained ? "text-primary" : "text-accent",
          )}
        >
          {retained ? "Source complete" : "Source records removed"}
        </p>
      </div>
      <SourceValue label="Function">{source.functionVersion}</SourceValue>
      <SourceValue label="Cutoff">
        {source.lastSuccessfulCutoffAt ? (
          <AdminDateTime value={source.lastSuccessfulCutoffAt} />
        ) : (
          "Not recorded"
        )}
      </SourceValue>
      <SourceValue label="Removed">
        {getRemovedRecordsLabel(source)}
      </SourceValue>
    </div>
  );
}

function SourceValue({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <p className="wrap-break-word min-w-0 text-ink text-xs tabular-nums leading-relaxed">
      <span className="mb-1 block text-slate-muted sm:hidden">{label}</span>
      {children}
    </p>
  );
}

function AdminPilotRetentionUnavailable() {
  return (
    <section aria-labelledby="pilot-retention-heading" className="pt-2">
      <RetentionHeading />
      <p className="mt-4 rounded-xl bg-card px-5 py-4 text-slate-muted text-sm leading-relaxed">
        Your admin session cannot view pilot retention status.
      </p>
    </section>
  );
}

function AdminPilotRetentionLoading() {
  return (
    <section
      aria-labelledby="pilot-retention-heading"
      className="pt-2"
      role="status"
    >
      <RetentionHeading />
      <div
        className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-2"
        aria-hidden="true"
      >
        {[0, 1, 2, 3].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 bg-card px-4 py-4"
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
    <section aria-labelledby="pilot-retention-heading" className="pt-2">
      <RetentionHeading />
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-card px-5 py-4">
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
  tone: RetentionTone;
} {
  if (!status.enabled) {
    return { label: "Disabled", tone: "amber" };
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
  tone: RetentionTone;
} {
  return (
    {
      FAILED: { label: "Failed", tone: "destructive" },
      PENDING: { label: "Waiting", tone: "neutral" },
      RUNNING: { label: "In progress", tone: "amber" },
      SUCCEEDED: { label: "Completed", tone: "teal" },
    } satisfies Record<
      RetentionRun["status"],
      { label: string; tone: RetentionTone }
    >
  )[status];
}

function toneText(tone: RetentionTone) {
  if (tone === "teal") return "text-primary";
  if (tone === "amber") return "text-accent";
  if (tone === "destructive") return "text-destructive";
  return "text-slate-muted";
}

function toneBackground(tone: RetentionTone) {
  if (tone === "teal") return "bg-primary";
  if (tone === "amber") return "bg-accent";
  if (tone === "destructive") return "bg-destructive";
  return "bg-muted";
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
