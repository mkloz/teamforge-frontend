import { useQuery } from "@tanstack/react-query";
import { Activity, AlertTriangle, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";

import { adminPilotMetricsQueryOptions } from "@/features/admin/api/admin.api";
import { AdminCandidateResponseMetrics } from "@/features/admin/components/admin-candidate-response-metrics";
import {
  AdminPilotInternalMetricSections,
  MetricDefinitionDetails,
} from "@/features/admin/components/admin-pilot-internal-metrics";
import type {
  AdminPilotMetricDefinition,
  AdminPilotMetrics as AdminPilotMetricsData,
} from "@/features/admin/schemas/admin-pilot-metrics.schema";
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
    <section aria-labelledby="pilot-measures-heading" className="pt-2">
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
      <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
        <p className="font-semibold text-ink">{cohort.code}</p>
        <p className="text-slate-muted">
          <span className="font-semibold text-ink tabular-nums">
            {formatCount(cohort.memberCount)}
          </span>{" "}
          cohort members
        </p>
      </div>

      <AdminPilotInternalMetricSections
        activityActivation={
          <ActivityActivationMetricSection
            activation={cohort.activityActivation}
          />
        }
        candidateWillingness={
          <AdminCandidateResponseMetrics metric={cohort.candidateWillingness} />
        }
        cohort={cohort}
        formationConversion={
          <RequestRateMetricSection
            dataCompleteness={formationConversion.dataCompleteness}
            definition={formationConversion.definition}
            description="Requests where the requester and at least two proposed members accepted within their fixed 14-day window."
            id="pilot-formed-groups-heading"
            local={{
              denominator: formationConversion.local.eligibleRequestCount,
              numerator: formationConversion.local.convertedRequestCount,
              ratePercent: formationConversion.local.conversionRatePercent,
            }}
            measurementState={formationConversion.measurementState}
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
        }
        proposalCoverage={
          <RequestRateMetricSection
            dataCompleteness={proposalCoverage.dataCompleteness}
            definition={proposalCoverage.definition}
            description="Requests that received a complete proposal within their fixed 7-day window."
            id="pilot-proposal-coverage-heading"
            local={{
              denominator: proposalCoverage.local.eligibleRequestCount,
              numerator: proposalCoverage.local.convertedRequestCount,
              ratePercent: proposalCoverage.local.conversionRatePercent,
            }}
            measurementState={proposalCoverage.measurementState}
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
        }
      />
    </>
  );
}

function RequestRateMetricSection({
  dataCompleteness,
  definition,
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
  definition: AdminPilotMetricDefinition;
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
    <section aria-labelledby={id} className="pt-2">
      <OutcomeHeading
        description={description}
        id={id}
        measurementState={measurementState}
        title={title}
      />

      {isRetentionPurged ? (
        <RetentionPurgedNotice />
      ) : (
        <div className="mt-5 grid items-center gap-6 sm:grid-cols-[minmax(10rem,0.65fr)_minmax(0,1.35fr)]">
          <div>
            <p className="text-slate-muted text-xs">{rateLabel}</p>
            <p className="mt-1 font-semibold text-4xl text-ink tabular-nums">
              {formatRequestRate(overall)}
            </p>
            <p className="mt-2 text-slate-muted text-xs">
              {formatOutcomeCount(overall.numerator)}{" "}
              {numeratorLabel.toLowerCase()} from{" "}
              {formatOutcomeCount(overall.denominator)} measured
            </p>
          </div>
          <div className="grid gap-4">
            <RequestRateBar
              label="Local"
              primary
              rateLabel={rateLabel}
              scope={local}
            />
            <RequestRateBar
              label="Online"
              rateLabel={rateLabel}
              scope={online}
            />
          </div>
        </div>
      )}
      <MetricDefinitionDetails definition={definition} />
    </section>
  );
}

function RequestRateBar({
  label,
  primary = false,
  rateLabel,
  scope,
}: {
  label: string;
  primary?: boolean;
  rateLabel: string;
  scope: RequestRateScope;
}) {
  const rate = scope.ratePercent ?? 0;

  return (
    <div className="grid gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-semibold text-ink text-sm">
          {label}
          {primary ? (
            <span className="ml-2 font-medium text-primary text-xs">
              primary
            </span>
          ) : null}
        </p>
        <p className="text-slate-muted text-xs tabular-nums">
          {formatRequestRate(scope)}
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={primary ? "h-full bg-primary" : "h-full bg-slate-muted"}
          style={{ width: `${rate}%` }}
          role="img"
          aria-label={`${label} ${rateLabel.toLowerCase()}: ${formatRequestRate(scope)}`}
        />
      </div>
      <p className="text-slate-muted text-xs">
        {formatOutcomeCount(scope.numerator)} of{" "}
        {formatOutcomeCount(scope.denominator)} requests
      </p>
    </div>
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
      className="pt-2"
    >
      <OutcomeHeading
        description="A request counts when its requester and two original group members report taking part before the fixed deadline."
        id="pilot-activity-activation-heading"
        measurementState={activation.measurementState}
        title="Requests that led to an activity"
      />
      <MetricDefinitionDetails definition={activation.definition} />

      {isRetentionPurged ? (
        <RetentionPurgedNotice />
      ) : (
        <>
          <dl className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-3">
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
    <section aria-labelledby={id} className="rounded-xl bg-card p-4">
      <ScopeHeading
        description={description}
        id={id}
        label={label}
        statusLabel={statusLabel}
        statusTone={statusTone}
      />
      <dl className="grouped-surface mt-3 grid overflow-hidden rounded-xl">
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
    <div className="grid gap-1">
      <h2
        id="pilot-measures-heading"
        className="flex items-center gap-2 font-semibold text-base text-ink"
      >
        <Activity className="size-4 shrink-0" aria-hidden="true" />
        Pilot measures
      </h2>
      <p className="max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        Counts, rates, and distributions for the controlled pilot, with clear
        notes when source records are missing.
      </p>
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
        {measurementState === "FINAL" ? "Final" : "Still measuring"}
      </StatusPill>
    </div>
  );
}

function RetentionPurgedNotice() {
  return (
    <div className="mt-4 rounded-xl bg-card px-4 py-4">
      <p className="font-semibold text-ink text-sm">Source records removed</p>
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
    <div className="flex min-w-0 items-start justify-between gap-4 bg-card px-4 py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {children ?? value}
      </dd>
    </div>
  );
}

function AdminPilotMetricsEmpty() {
  return (
    <div className="mt-4 rounded-xl bg-card px-5 py-4">
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
    <section className="pt-2" role="status" aria-label="Loading pilot outcomes">
      <div className="flex items-start gap-3">
        <Skeleton shape="circle" className="size-9 shrink-0" />
        <div className="grid flex-1 gap-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-xl" />
        </div>
      </div>
      <div className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-2">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div
            key={row}
            className="flex items-center justify-between gap-4 bg-card px-4 py-3"
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
    <section aria-labelledby="pilot-metrics-error-heading" className="py-8">
      <AlertTriangle className="size-8" aria-hidden="true" />
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
