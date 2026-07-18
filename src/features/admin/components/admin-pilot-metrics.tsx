import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotMetricsQueryOptions } from "@/features/admin/api/admin.api";
import type { AdminPilotMetrics as AdminPilotMetricsData } from "@/features/admin/schemas/admin-pilot-metrics.schema";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();

type PilotMetricsCohort = NonNullable<AdminPilotMetricsData["activeCohort"]>;
type ActivityActivation = PilotMetricsCohort["activityActivation"];
type ScopedActivityActivation = ActivityActivation["local"];

export function AdminPilotMetrics() {
  const metricsQuery = useQuery(adminPilotMetricsQueryOptions());

  if (metricsQuery.isPending) {
    return <AdminPilotMetricsLoading />;
  }

  if (metricsQuery.isError) {
    return (
      <AdminPilotMetricsError onRetry={() => void metricsQuery.refetch()} />
    );
  }

  return <AdminPilotMetricsContent metrics={metricsQuery.data} />;
}

function AdminPilotMetricsContent({
  metrics,
}: {
  metrics: AdminPilotMetricsData;
}) {
  const cohort = metrics.activeCohort;

  return (
    <section
      aria-labelledby="pilot-activity-activation-heading"
      className="border-border border-t pt-6"
    >
      <MetricsSectionHeading
        measurementState={cohort?.activityActivation.measurementState ?? null}
      />

      {cohort ? (
        <ActivityActivationDetails cohort={cohort} />
      ) : (
        <AdminPilotMetricsEmpty />
      )}

      <div className="mt-5 grid gap-1 text-slate-muted text-xs leading-relaxed">
        <p>
          Evaluated <AdminDateTime value={metrics.evaluatedAt} />
        </p>
        <InternalOperationsNote />
      </div>
    </section>
  );
}

function ActivityActivationDetails({ cohort }: { cohort: PilotMetricsCohort }) {
  const activation = cohort.activityActivation;
  const isRetentionPurged = activation.dataCompleteness === "RETENTION_PURGED";

  return (
    <>
      <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2">
        <MetricsDetail label="Cohort" value={cohort.code} />
        <MetricsDetail
          label="Cohort members"
          value={formatCount(cohort.memberCount)}
        />
        <MetricsDetail
          label="Requesting members across all scopes"
          value={formatOutcomeCount(activation.requestingMemberCount)}
        />
        <MetricsDetail label="Outcome data">
          <StatusPill
            size="xs"
            surface="soft"
            tone={isRetentionPurged ? "amber" : "teal"}
          >
            {isRetentionPurged ? "Unavailable" : "Complete"}
          </StatusPill>
        </MetricsDetail>
      </dl>

      {isRetentionPurged ? <RetentionPurgedNotice /> : null}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ScopeMetricsSection
          description="The first controlled pilot is assessed using local activity outcomes."
          id="local-activity-activation-heading"
          isRetentionPurged={isRetentionPurged}
          label="Local"
          scope={activation.local}
          statusLabel="Primary pilot measure"
          statusTone="teal"
        />
        <ScopeMetricsSection
          description="Online activity outcomes stay separate from the local pilot result."
          id="online-activity-activation-heading"
          isRetentionPurged={isRetentionPurged}
          label="Online"
          scope={activation.online}
          statusLabel="Separate measure"
          statusTone="neutral"
        />
      </div>
    </>
  );
}

function ScopeMetricsSection({
  description,
  id,
  isRetentionPurged,
  label,
  scope,
  statusLabel,
  statusTone,
}: {
  description: string;
  id: string;
  isRetentionPurged: boolean;
  label: string;
  scope: ScopedActivityActivation;
  statusLabel: string;
  statusTone: "neutral" | "teal";
}) {
  return (
    <section aria-labelledby={id} className="border-border border-t pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={id} className="font-semibold text-ink text-sm">
          {label}
        </h3>
        <StatusPill size="xs" surface="soft" tone={statusTone}>
          {statusLabel}
        </StatusPill>
      </div>
      <p className="mt-1 text-pretty text-slate-muted text-xs leading-relaxed">
        {description}
      </p>

      <dl className="mt-3 border-border border-t">
        {isRetentionPurged ? (
          <MetricsDetail label="Metric counts">
            <StatusPill size="xs" surface="soft" tone="neutral">
              Unavailable
            </StatusPill>
          </MetricsDetail>
        ) : (
          <>
            <MetricsDetail
              label="Requesting members"
              value={formatOutcomeCount(scope.requestingMemberCount)}
            />
            <MetricsDetail
              label="Requesters with a qualifying activity"
              value={formatOutcomeCount(scope.activatedRequesterCount)}
            />
            <MetricsDetail label="Activation rate">
              {scope.activationRatePercent === null
                ? "No requests yet"
                : formatPercent(scope.activationRatePercent)}
            </MetricsDetail>
            <MetricsDetail
              label="Recorded activities"
              value={formatOutcomeCount(scope.recordedActivityCount)}
            />
          </>
        )}
      </dl>
    </section>
  );
}

function MetricsSectionHeading({
  measurementState,
}: {
  measurementState: ActivityActivation["measurementState"] | null;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
          <Activity className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2
            id="pilot-activity-activation-heading"
            className="font-semibold text-base text-ink"
          >
            Requests that led to an activity
          </h2>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
            A request counts when its requester and two original group members
            report taking part before the frozen deadline.
          </p>
        </div>
      </div>

      {measurementState ? (
        <StatusPill
          size="sm"
          surface="soft"
          tone={measurementState === "FINAL" ? "teal" : "amber"}
        >
          {measurementState === "FINAL" ? "Final" : "Provisional"}
        </StatusPill>
      ) : null}
    </div>
  );
}

function RetentionPurgedNotice() {
  return (
    <div className="mt-5 border-border border-y py-4">
      <p className="font-semibold text-ink text-sm">
        Outcome counts are unavailable
      </p>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        Records needed for this measure were removed under the retention
        schedule. Counts and rates are unavailable.
      </p>
    </div>
  );
}

function MetricsDetail({
  children,
  label,
  value,
}: {
  children?: ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {children ?? value}
      </dd>
    </div>
  );
}

function AdminPilotMetricsEmpty() {
  return (
    <div className="mt-4 border-border border-t py-5">
      <StatusPill size="sm" surface="soft" tone="neutral">
        No active cohort
      </StatusPill>
      <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        This cannot be measured until a controlled-pilot cohort is active.
      </p>
    </div>
  );
}

function AdminPilotMetricsLoading() {
  return (
    <section
      className="border-border border-t pt-6"
      role="status"
      aria-label="Loading activity outcomes"
    >
      <div className="flex items-start gap-3">
        <Skeleton shape="circle" className="size-9 shrink-0" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 border-border border-b py-3"
          >
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </section>
  );
}

function AdminPilotMetricsError({ onRetry }: { onRetry: () => void }) {
  return (
    <section
      aria-labelledby="pilot-metrics-error-heading"
      className="border-border border-t py-8"
    >
      <AlertTriangle className="size-8 text-accent" aria-hidden="true" />
      <h2
        id="pilot-metrics-error-heading"
        className="mt-3 font-semibold text-ink text-lg"
      >
        Activity outcomes are unavailable
      </h2>
      <p className="mt-1 max-w-xl text-pretty text-slate-muted text-sm leading-relaxed">
        TeamForge could not load the current outcome metrics. Pilot readiness
        remains available above.
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
      <InternalOperationsNote className="mt-4" />
    </section>
  );
}

function InternalOperationsNote({ className }: { className?: string }) {
  return (
    <p
      className={["text-slate-muted text-xs leading-relaxed", className]
        .filter(Boolean)
        .join(" ")}
    >
      Internal pilot operations. Not a sponsor report.
    </p>
  );
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}

function formatCount(value: number) {
  return NUMBER_FORMATTER.format(value);
}

function formatOutcomeCount(value: number | null) {
  return value === null ? "Unavailable" : formatCount(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
