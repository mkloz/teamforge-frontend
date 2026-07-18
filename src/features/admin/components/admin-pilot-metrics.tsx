import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotMetricsQueryOptions } from "@/features/admin/api/admin.api";
import { AdminCandidateResponseMetrics } from "@/features/admin/components/admin-candidate-response-metrics";
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
type MeasurementState =
  PilotMetricsCohort["activityActivation"]["measurementState"];
type ScopedActivityActivation =
  PilotMetricsCohort["activityActivation"]["local"];
type RequestRateScope = {
  denominator: number | null;
  numerator: number | null;
  ratePercent: number | null;
};

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
      aria-labelledby="pilot-request-outcomes-heading"
      className="border-border border-t pt-6"
    >
      <MetricsSectionHeading />

      {cohort ? (
        <PilotOutcomeDetails cohort={cohort} />
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

function PilotOutcomeDetails({ cohort }: { cohort: PilotMetricsCohort }) {
  const proposalCoverage = cohort.proposalCoverage;
  const formationConversion = cohort.formationConversion;

  return (
    <>
      <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2">
        <MetricsDetail label="Cohort" value={cohort.code} />
        <MetricsDetail
          label="Cohort members"
          value={formatCount(cohort.memberCount)}
        />
      </dl>

      <div className="mt-6 grid gap-8">
        <RequestRateMetricSection
          description="Requests that received a complete proposal within their fixed 7-day window."
          id="pilot-proposal-coverage-heading"
          measurementState={proposalCoverage.measurementState}
          dataCompleteness={proposalCoverage.dataCompleteness}
          local={{
            denominator: proposalCoverage.local.eligibleRequestCount,
            numerator: proposalCoverage.local.convertedRequestCount,
            ratePercent: proposalCoverage.local.conversionRatePercent,
          }}
          numeratorLabel="Received a proposal"
          online={{
            denominator: proposalCoverage.online.eligibleRequestCount,
            numerator: proposalCoverage.online.convertedRequestCount,
            ratePercent: proposalCoverage.online.conversionRatePercent,
          }}
          overall={{
            denominator: proposalCoverage.eligibleRequestCount,
            numerator: proposalCoverage.convertedRequestCount,
            ratePercent: proposalCoverage.conversionRatePercent,
          }}
          rateLabel="Coverage rate"
          title="Requests that received a proposal"
        />

        <RequestRateMetricSection
          description="Requests where the requester and at least two proposed members accepted within their fixed 14-day window."
          id="pilot-formed-groups-heading"
          measurementState={formationConversion.measurementState}
          dataCompleteness={formationConversion.dataCompleteness}
          local={{
            denominator: formationConversion.local.eligibleRequestCount,
            numerator: formationConversion.local.convertedRequestCount,
            ratePercent: formationConversion.local.conversionRatePercent,
          }}
          numeratorLabel="Formed a group"
          online={{
            denominator: formationConversion.online.eligibleRequestCount,
            numerator: formationConversion.online.convertedRequestCount,
            ratePercent: formationConversion.online.conversionRatePercent,
          }}
          overall={{
            denominator: formationConversion.eligibleRequestCount,
            numerator: formationConversion.convertedRequestCount,
            ratePercent: formationConversion.conversionRatePercent,
          }}
          rateLabel="Formation rate"
          title="Requests that formed a group"
        />

        <AdminCandidateResponseMetrics metric={cohort.candidateWillingness} />

        <ActivityActivationMetricSection
          activation={cohort.activityActivation}
        />
      </div>
    </>
  );
}

function RequestRateMetricSection({
  dataCompleteness,
  description,
  id,
  local,
  measurementState,
  numeratorLabel,
  online,
  overall,
  rateLabel,
  title,
}: {
  dataCompleteness: "COMPLETE" | "RETENTION_PURGED";
  description: string;
  id: string;
  local: RequestRateScope;
  measurementState: MeasurementState;
  numeratorLabel: string;
  online: RequestRateScope;
  overall: RequestRateScope;
  rateLabel: string;
  title: string;
}) {
  const isRetentionPurged = dataCompleteness === "RETENTION_PURGED";

  return (
    <section aria-labelledby={id} className="border-border border-t pt-5">
      <OutcomeHeading
        description={description}
        id={id}
        measurementState={measurementState}
        title={title}
      />

      {isRetentionPurged ? (
        <RetentionPurgedNotice />
      ) : (
        <>
          <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-3">
            <MetricsDetail
              label="Requests measured"
              value={formatOutcomeCount(overall.denominator)}
            />
            <MetricsDetail
              label={numeratorLabel}
              value={formatOutcomeCount(overall.numerator)}
            />
            <MetricsDetail label={rateLabel}>
              {formatRequestRate(overall)}
            </MetricsDetail>
          </dl>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <RequestRateScopeSection
              description="The controlled pilot uses local request outcomes."
              id={`${id}-local`}
              label="Local"
              numeratorLabel={numeratorLabel}
              rateLabel={rateLabel}
              scope={local}
              statusLabel="Primary pilot measure"
              statusTone="teal"
            />
            <RequestRateScopeSection
              description="Online request outcomes stay separate."
              id={`${id}-online`}
              label="Online"
              numeratorLabel={numeratorLabel}
              rateLabel={rateLabel}
              scope={online}
              statusLabel="Separate measure"
              statusTone="neutral"
            />
          </div>
        </>
      )}
    </section>
  );
}

function RequestRateScopeSection({
  description,
  id,
  label,
  numeratorLabel,
  rateLabel,
  scope,
  statusLabel,
  statusTone,
}: {
  description: string;
  id: string;
  label: string;
  numeratorLabel: string;
  rateLabel: string;
  scope: RequestRateScope;
  statusLabel: string;
  statusTone: "neutral" | "teal";
}) {
  return (
    <section aria-labelledby={id} className="border-border border-t pt-4">
      <ScopeHeading
        description={description}
        id={id}
        label={label}
        statusLabel={statusLabel}
        statusTone={statusTone}
      />
      <dl className="mt-3 border-border border-t">
        <MetricsDetail
          label="Requests measured"
          value={formatOutcomeCount(scope.denominator)}
        />
        <MetricsDetail
          label={numeratorLabel}
          value={formatOutcomeCount(scope.numerator)}
        />
        <MetricsDetail label={rateLabel}>
          {formatRequestRate(scope)}
        </MetricsDetail>
      </dl>
    </section>
  );
}

function ActivityActivationMetricSection({
  activation,
}: {
  activation: PilotMetricsCohort["activityActivation"];
}) {
  const isRetentionPurged = activation.dataCompleteness === "RETENTION_PURGED";

  return (
    <section
      aria-labelledby="pilot-activity-activation-heading"
      className="border-border border-t pt-5"
    >
      <OutcomeHeading
        description="A request counts when its requester and two original group members report taking part before the fixed deadline."
        id="pilot-activity-activation-heading"
        measurementState={activation.measurementState}
        title="Requests that led to an activity"
      />

      {isRetentionPurged ? (
        <RetentionPurgedNotice />
      ) : (
        <>
          <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-3">
            <MetricsDetail
              label="Requesting members"
              value={formatOutcomeCount(activation.requestingMemberCount)}
            />
            <MetricsDetail
              label="Requesters with a qualifying activity"
              value={formatOutcomeCount(activation.activatedRequesterCount)}
            />
            <MetricsDetail
              label="Recorded activities"
              value={formatOutcomeCount(activation.recordedActivityCount)}
            />
          </dl>

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <ActivityScopeSection
              description="The controlled pilot uses local activity outcomes."
              id="local-activity-activation-heading"
              label="Local"
              scope={activation.local}
              statusLabel="Primary pilot measure"
              statusTone="teal"
            />
            <ActivityScopeSection
              description="Online activity outcomes stay separate."
              id="online-activity-activation-heading"
              label="Online"
              scope={activation.online}
              statusLabel="Separate measure"
              statusTone="neutral"
            />
          </div>
        </>
      )}
    </section>
  );
}

function ActivityScopeSection({
  description,
  id,
  label,
  scope,
  statusLabel,
  statusTone,
}: {
  description: string;
  id: string;
  label: string;
  scope: ScopedActivityActivation;
  statusLabel: string;
  statusTone: "neutral" | "teal";
}) {
  return (
    <section aria-labelledby={id} className="border-border border-t pt-4">
      <ScopeHeading
        description={description}
        id={id}
        label={label}
        statusLabel={statusLabel}
        statusTone={statusTone}
      />
      <dl className="mt-3 border-border border-t">
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
      </dl>
    </section>
  );
}

function ScopeHeading({
  description,
  id,
  label,
  statusLabel,
  statusTone,
}: {
  description: string;
  id: string;
  label: string;
  statusLabel: string;
  statusTone: "neutral" | "teal";
}) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 id={id} className="font-semibold text-ink text-sm">
          {label}
        </h4>
        <StatusPill size="xs" surface="soft" tone={statusTone}>
          {statusLabel}
        </StatusPill>
      </div>
      <p className="mt-1 text-pretty text-slate-muted text-xs leading-relaxed">
        {description}
      </p>
    </>
  );
}

function MetricsSectionHeading() {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/8 text-primary">
        <Activity className="size-4" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h2
          id="pilot-request-outcomes-heading"
          className="font-semibold text-base text-ink"
        >
          Request outcomes
        </h2>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
          Internal counts and rates for proposals, candidate responses, formed
          groups, and activities that took place.
        </p>
      </div>
    </div>
  );
}

function OutcomeHeading({
  description,
  id,
  measurementState,
  title,
}: {
  description: string;
  id: string;
  measurementState: MeasurementState;
  title: string;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 id={id} className="font-semibold text-ink text-sm">
          {title}
        </h3>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
          {description}
        </p>
      </div>
      <StatusPill
        size="sm"
        surface="soft"
        tone={measurementState === "FINAL" ? "teal" : "amber"}
      >
        {measurementState === "FINAL" ? "Final" : "Provisional"}
      </StatusPill>
    </div>
  );
}

function RetentionPurgedNotice() {
  return (
    <div className="mt-4 border-border border-y py-4">
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
        These outcomes cannot be measured until a controlled-pilot cohort is
        active.
      </p>
    </div>
  );
}

function AdminPilotMetricsLoading() {
  return (
    <section
      className="border-border border-t pt-6"
      role="status"
      aria-label="Loading pilot outcomes"
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
        Pilot outcomes are unavailable
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

function formatRequestRate(scope: RequestRateScope) {
  if (scope.denominator === 0) {
    return "No requests yet";
  }
  return scope.ratePercent === null
    ? "Unavailable"
    : formatPercent(scope.ratePercent);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}
