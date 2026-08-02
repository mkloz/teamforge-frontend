import {
  Activity,
  CalendarCheck2,
  type LucideIcon,
  Route,
  UsersRound,
} from "lucide-react";
import type { ReactNode } from "react";

import type {
  AdminPilotMetricDefinition,
  AdminPilotMetrics,
} from "@/features/admin/schemas/admin-pilot-metrics.schema";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import {
  StatusPill,
  type StatusPillTone,
} from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const NUMBER_FORMATTER = new Intl.NumberFormat();

type PilotMetricsCohort = NonNullable<AdminPilotMetrics["activeCohort"]>;
type InternalMetrics = PilotMetricsCohort["internal"];
type InternalMetricState = {
  dataCompleteness: "COMPLETE" | "RETENTION_PURGED" | "SOURCE_INCOMPLETE";
  measurementState?: "PROVISIONAL" | "FINAL";
  unavailableReason?: "NOT_INSTRUMENTED";
};
type MetricRow = { label: string; value: ReactNode; wide?: boolean };

export function AdminPilotInternalMetricSections({
  activityActivation,
  candidateWillingness,
  cohort,
  formationConversion,
  proposalCoverage,
}: {
  activityActivation: ReactNode;
  candidateWillingness: ReactNode;
  cohort: PilotMetricsCohort;
  formationConversion: ReactNode;
  proposalCoverage: ReactNode;
}) {
  const metrics = cohort.internal;

  return (
    <div className="mt-6 grid gap-3">
      <MetricGroup
        defaultOpen
        icon={Route}
        description="How cohort members reached candidate availability, created a request, and received a proposal."
        id="pilot-request-journey-heading"
        states={{
          activation: metrics.candidatePoolActivation,
          creation: metrics.requestCreationByPoolState,
          proposal: cohort.proposalCoverage,
        }}
        title="Request journey"
      >
        <CandidatePoolActivationMetric
          metric={metrics.candidatePoolActivation}
        />
        <RequestCreationMetric metric={metrics.requestCreationByPoolState} />
        {proposalCoverage}
      </MetricGroup>

      <MetricGroup
        icon={UsersRound}
        description="The group sizes people requested and what happened when a group needed more members."
        id="pilot-formation-details-heading"
        states={{
          conversion: cohort.formationConversion,
          distribution: metrics.formationDistribution,
          recovery: metrics.recoveryLifecycle,
        }}
        title="Formation details"
      >
        {formationConversion}
        <FormationDistributionMetric metric={metrics.formationDistribution} />
        <RecoveryLifecycleMetric metric={metrics.recoveryLifecycle} />
      </MetricGroup>

      <MetricGroup
        icon={CalendarCheck2}
        description="What formed groups did next, from settling a schedule to continuing after the activity window."
        id="pilot-plans-activity-heading"
        states={{
          activity: cohort.activityActivation,
          completed: metrics.completedActivities,
          continuation: metrics.continuation,
          readiness: metrics.firstPlanReadiness,
          schedule: metrics.scheduleResolution,
          scheduled: metrics.scheduledPlans,
        }}
        title="Plans and activity"
      >
        <GroupOutcomeMetric
          achievedLabel="Schedules resolved"
          description="Formed groups that settled their first plan's schedule within seven days."
          id="pilot-schedule-resolution-heading"
          metric={metrics.scheduleResolution}
          rateLabel="Resolution rate"
          title="Schedules resolved"
        />
        <GroupOutcomeMetric
          achievedLabel="First plans ready"
          description="Formed groups whose first plan was ready within ten days."
          id="pilot-first-plan-readiness-heading"
          metric={metrics.firstPlanReadiness}
          rateLabel="Readiness rate"
          title="First plans ready"
        />
        <PlanYieldMetric
          countLabel="Plans scheduled"
          description="Distinct plans scheduled after formation within the measured outcome window."
          id="pilot-scheduled-plans-heading"
          metric={metrics.scheduledPlans}
          title="Plans scheduled"
          yieldLabel="Plans per formed group"
        />
        <PlanYieldMetric
          countLabel="Activities completed"
          description="Distinct plans recorded as completed after formation within the measured outcome window."
          id="pilot-completed-activities-heading"
          metric={metrics.completedActivities}
          title="Activities completed"
          yieldLabel="Completed activities per formed group"
        />
        {activityActivation}
        <ContinuationMetric metric={metrics.continuation} />
      </MetricGroup>

      <MetricGroup
        icon={Activity}
        description="Historical proposal timing, candidate responses, and candidate supply recorded during group creation."
        id="pilot-candidate-pool-health-heading"
        states={{
          candidate: cohort.candidateWillingness,
          fatigue: metrics.nonresponseFatigue,
          pressure: metrics.capacityPressure,
          supply: metrics.activeCandidateSupply,
          timing: metrics.timeToFirstProposal,
        }}
        title="Candidate pool health"
      >
        <div>
          {candidateWillingness}
          <MetricDefinitionDetails
            className="mt-3"
            definition={cohort.candidateWillingness.definition}
          />
        </div>
        <TimeToFirstProposalMetric metric={metrics.timeToFirstProposal} />
        <NonresponseMetric metric={metrics.nonresponseFatigue} />
        <RecordedCandidateSupplyMetric metric={metrics.activeCandidateSupply} />
        <CapacityPressureMetric metric={metrics.capacityPressure} />
      </MetricGroup>
    </div>
  );
}

function MetricGroup({
  children,
  defaultOpen = false,
  description,
  icon: Icon,
  id,
  states,
  title,
}: {
  children: ReactNode;
  defaultOpen?: boolean;
  description: string;
  icon: LucideIcon;
  id: string;
  states: Record<string, InternalMetricState>;
  title: string;
}) {
  const stateEntries = Object.entries(states);
  const reportingCount = stateEntries.filter(
    ([, state]) =>
      state.dataCompleteness === "COMPLETE" &&
      state.unavailableReason !== "NOT_INSTRUMENTED",
  ).length;

  return (
    <CollapsibleSection
      defaultOpen={defaultOpen}
      variant="panel"
      summary={
        <div className="sm:main-action-grid grid gap-4 sm:items-center">
          <div className="min-w-0">
            <h3
              id={id}
              className="flex items-center gap-2.5 font-semibold text-base text-ink"
            >
              <Icon className="size-5 shrink-0" aria-hidden="true" />
              <span>{title}</span>
            </h3>
            <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
              {description}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="grid min-w-32 flex-1 gap-2">
              <p className="text-right text-slate-muted text-xs">
                {reportingCount}/{stateEntries.length} reporting
              </p>
              <span
                className="grid gap-1"
                style={{
                  gridTemplateColumns: `repeat(${stateEntries.length}, minmax(0, 1fr))`,
                }}
                aria-hidden="true"
              >
                {stateEntries.map(([key, state]) => (
                  <span
                    key={key}
                    className={cn(
                      "h-1.5 rounded-full",
                      state.dataCompleteness === "COMPLETE" &&
                        state.unavailableReason !== "NOT_INSTRUMENTED"
                        ? "bg-primary"
                        : state.dataCompleteness === "SOURCE_INCOMPLETE"
                          ? "bg-accent"
                          : "bg-muted",
                    )}
                  />
                ))}
              </span>
            </div>
          </div>
        </div>
      }
      contentClassName="grid gap-6"
    >
      {children}
    </CollapsibleSection>
  );
}

function CandidatePoolActivationMetric({
  metric,
}: {
  metric: InternalMetrics["candidatePoolActivation"];
}) {
  const rows = completeRows(
    metric,
    [
      row("Members measured", formatCount(metric.eligibleMemberCount)),
      row(
        "Members available for invitations",
        formatCount(metric.activatedMemberCount),
      ),
      row(
        "Activation rate",
        formatPercent(metric.activationRatePercent, metric.eligibleMemberCount),
      ),
      coverageRow(
        metric.sourceCoverageStartsAt,
        metric.sourceDefinitionVersion,
      ),
    ],
    [
      row(
        "Members missing source records",
        formatCount(metric.sourceIncompleteMemberCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Cohort members who made themselves available for automatic group invitations within seven days."
      id="pilot-candidate-pool-activation-heading"
      metric={metric}
      rows={rows}
      title="Available for group invitations by day 7"
    />
  );
}

function RequestCreationMetric({
  metric,
}: {
  metric: InternalMetrics["requestCreationByPoolState"];
}) {
  if ("unavailableReason" in metric) {
    return (
      <MetricBlock
        definition={metric.definition}
        description="Requests created within seven days, separated by whether the member was already available for automatic group invitations."
        id="pilot-request-creation-pool-state-heading"
        metric={metric}
        rows={[]}
        title="Requests by member availability"
      />
    );
  }

  const rows = completeRows(
    metric,
    [
      row("Members measured", formatCount(metric.eligibleMemberCount)),
      row(
        "Members who created a request",
        formatCount(metric.requestingMemberCount),
      ),
      row(
        "Request creation rate",
        formatPercent(
          metric.requestCreationRatePercent,
          metric.eligibleMemberCount,
        ),
      ),
      coverageRow(
        metric.sourceCoverageStartsAt,
        metric.sourceDefinitionVersion,
      ),
    ],
    [
      row(
        "Members missing source records",
        formatCount(metric.sourceIncompleteMemberCount),
      ),
      row(
        "Requests missing source records",
        formatCount(metric.sourceIncompleteRequestCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Requests created within seven days, separated by whether the member was already available for automatic group invitations."
      id="pilot-request-creation-pool-state-heading"
      metric={metric}
      rows={rows}
      title="Requests by member availability"
    >
      {metric.byPoolState ? (
        <MetricDisclosure label="Member availability breakdown">
          <dl className="grouped-surface grid overflow-hidden rounded-xl">
            {metric.byPoolState.map((bucket) => (
              <MetricValueRow
                key={bucket.poolState}
                label={
                  bucket.poolState === "OPEN"
                    ? "Available for invitations"
                    : "Not available for invitations"
                }
                value={`${formatCount(bucket.requestingMemberCount)} members · ${formatCount(bucket.requestCount)} requests · ${formatPercent(bucket.requestCreationRatePercent, metric.eligibleMemberCount)}`}
              />
            ))}
          </dl>
        </MetricDisclosure>
      ) : null}
    </MetricBlock>
  );
}

function FormationDistributionMetric({
  metric,
}: {
  metric: InternalMetrics["formationDistribution"];
}) {
  const rows = completeRows(
    metric,
    [row("Formed requests", formatCount(metric.formedRequestCount))],
    [
      row(
        "Formed requests missing details",
        formatCount(metric.sourceIncompleteFormedRequestCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Requested, selected, and final group sizes from each completed formation record."
      id="pilot-formation-distribution-heading"
      metric={metric}
      rows={rows}
      title="Group size choices"
    >
      {metric.requestedMinimumGroupSize &&
      metric.requestedMaximumGroupSize &&
      metric.selectedRosterSize &&
      metric.finalFormedSize &&
      metric.provenance ? (
        <MetricDisclosure label="Size and formation breakdown">
          <div className="grid gap-6 sm:grid-cols-2">
            <DistributionList
              label="Requested minimum"
              rows={metric.requestedMinimumGroupSize.map((bucket) => ({
                key: String(bucket.value),
                label: `${formatCount(bucket.value)} people`,
                value: formatCount(bucket.count),
              }))}
            />
            <DistributionList
              label="Requested maximum"
              rows={metric.requestedMaximumGroupSize.map((bucket) => ({
                key: String(bucket.value),
                label: `${formatCount(bucket.value)} people`,
                value: formatCount(bucket.count),
              }))}
            />
            <DistributionList
              label="Selected group size"
              rows={metric.selectedRosterSize.map((bucket) => ({
                key: String(bucket.value),
                label: `${formatCount(bucket.value)} people`,
                value: formatCount(bucket.count),
              }))}
            />
            <DistributionList
              label="Final group size"
              rows={metric.finalFormedSize.map((bucket) => ({
                key: String(bucket.value),
                label: `${formatCount(bucket.value)} people`,
                value: formatCount(bucket.count),
              }))}
            />
            <DistributionList
              label="How the group formed"
              rows={metric.provenance.map((bucket) => ({
                key: bucket.provenance,
                label:
                  bucket.provenance === "DIRECT"
                    ? "Directly formed"
                    : "Formed after adding members",
                value: formatCount(bucket.count),
              }))}
            />
          </div>
        </MetricDisclosure>
      ) : null}
    </MetricBlock>
  );
}

function RecoveryLifecycleMetric({
  metric,
}: {
  metric: InternalMetrics["recoveryLifecycle"];
}) {
  const rows = completeRows(metric, [
    row("Completed openings", formatCount(metric.completedOpeningCount)),
    row(
      "Openings with an application",
      formatCount(metric.appliedOpeningCount),
    ),
    row(
      "Groups formed after adding members",
      formatCount(metric.recoveredFormationCount),
    ),
  ]);

  return (
    <MetricBlock
      definition={metric.definition}
      description="Completed extra-member openings and the outcomes recorded before each opening closed."
      id="pilot-recovery-lifecycle-heading"
      metric={metric}
      rows={rows}
      title="Groups needing more members"
    >
      {metric.completedOpeningCount !== null ? (
        <MetricDisclosure label="Opening outcomes">
          <dl className="grouped-surface grid overflow-hidden rounded-xl sm:grid-cols-2">
            <MetricValueRow
              label="Applications received"
              value={formatCount(metric.applicationCount)}
            />
            <MetricValueRow
              label="Applications withdrawn"
              value={formatCount(metric.withdrawnApplicationCount)}
            />
            <MetricValueRow
              label="Openings filled"
              value={formatCount(metric.filledOpeningCount)}
            />
            <MetricValueRow
              label="Openings reaching a final group"
              value={formatCount(metric.convertedOpeningCount)}
            />
            <MetricValueRow
              label="Openings closed"
              value={formatCount(metric.closedOpeningCount)}
            />
            <MetricValueRow
              label="Openings expired"
              value={formatCount(metric.expiredOpeningCount)}
            />
          </dl>
        </MetricDisclosure>
      ) : null}
    </MetricBlock>
  );
}

function GroupOutcomeMetric({
  achievedLabel,
  description,
  id,
  metric,
  rateLabel,
  title,
}: {
  achievedLabel: string;
  description: string;
  id: string;
  metric:
    | InternalMetrics["scheduleResolution"]
    | InternalMetrics["firstPlanReadiness"];
  rateLabel: string;
  title: string;
}) {
  const rows = completeRows(
    metric,
    [
      row("Groups measured", formatCount(metric.eligibleGroupCount)),
      row(achievedLabel, formatCount(metric.achievedGroupCount)),
      row(
        rateLabel,
        formatPercent(metric.ratePercent, metric.eligibleGroupCount),
      ),
    ],
    [
      row(
        "Groups missing source records",
        formatCount(metric.sourceIncompleteGroupCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description={description}
      id={id}
      metric={metric}
      rows={rows}
      title={title}
    />
  );
}

function PlanYieldMetric({
  countLabel,
  description,
  id,
  metric,
  title,
  yieldLabel,
}: {
  countLabel: string;
  description: string;
  id: string;
  metric:
    | InternalMetrics["scheduledPlans"]
    | InternalMetrics["completedActivities"];
  title: string;
  yieldLabel: string;
}) {
  const rows = completeRows(metric, [
    row("Formed groups", formatCount(metric.formedGroupCount)),
    row(countLabel, formatCount(metric.planCount)),
    row(
      yieldLabel,
      formatRatio(metric.yieldPerFormedGroup, metric.formedGroupCount),
    ),
  ]);

  return (
    <MetricBlock
      definition={metric.definition}
      description={description}
      id={id}
      metric={metric}
      rows={rows}
      title={title}
    />
  );
}

function ContinuationMetric({
  metric,
}: {
  metric: InternalMetrics["continuation"];
}) {
  const rows = completeRows(
    metric,
    [
      row("Windows measured", formatCount(metric.eligibleWindowCount)),
      row("Groups continuing", formatCount(metric.continuedWindowCount)),
      row(
        "Continuation rate",
        formatPercent(
          metric.continuationRatePercent,
          metric.eligibleWindowCount,
        ),
      ),
    ],
    [
      row(
        "Windows missing source records",
        formatCount(metric.sourceIncompleteWindowCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Groups recorded as continuing when their fixed continuation window closed."
      id="pilot-continuation-heading"
      metric={metric}
      rows={rows}
      title="Groups continuing"
    />
  );
}

function TimeToFirstProposalMetric({
  metric,
}: {
  metric: InternalMetrics["timeToFirstProposal"];
}) {
  const rows = completeRows(metric, [
    row("Requests measured", formatCount(metric.eligibleRequestCount)),
    row("Requests with a proposal", formatCount(metric.coveredRequestCount)),
    row(
      "Requests without a proposal",
      formatCount(metric.uncoveredRequestCount),
    ),
    row(
      "Mean time to first proposal",
      formatDuration(
        metric.meanLatencyMilliseconds,
        metric.coveredRequestCount,
      ),
    ),
  ]);

  return (
    <MetricBlock
      definition={metric.definition}
      description="Average elapsed time for measured requests that received a proposal within seven days."
      id="pilot-time-to-proposal-heading"
      metric={metric}
      rows={rows}
      title="Time to first proposal"
    />
  );
}

function NonresponseMetric({
  metric,
}: {
  metric: InternalMetrics["nonresponseFatigue"];
}) {
  const totals = metric.byExposureOrdinal?.reduce(
    (result, bucket) => ({
      eligible: result.eligible + bucket.eligibleExposureCount,
      unanswered: result.unanswered + bucket.unansweredExposureCount,
    }),
    { eligible: 0, unanswered: 0 },
  );
  const rows = completeRows(metric, [
    row("Invitations measured", formatCount(totals?.eligible ?? 0)),
    row("No response by deadline", formatCount(totals?.unanswered ?? 0)),
  ]);

  return (
    <MetricBlock
      definition={metric.definition}
      description="No-response outcomes separated by how many invitations a member had already received."
      id="pilot-nonresponse-heading"
      metric={metric}
      rows={rows}
      title="No response after repeated invitations"
    >
      {metric.byExposureOrdinal ? (
        <MetricDisclosure label="Invitation number breakdown">
          <dl className="grouped-surface grid overflow-hidden rounded-xl">
            {metric.byExposureOrdinal.map((bucket) => (
              <MetricValueRow
                key={bucket.bucket}
                label={
                  bucket.bucket === "4+"
                    ? "Fourth invitation or later"
                    : `${ordinal(bucket.bucket)} invitation`
                }
                value={`${formatCount(bucket.unansweredExposureCount)} of ${formatCount(bucket.eligibleExposureCount)} · ${formatPercent(bucket.nonresponseRatePercent, bucket.eligibleExposureCount)}`}
              />
            ))}
          </dl>
        </MetricDisclosure>
      ) : null}
    </MetricBlock>
  );
}

function RecordedCandidateSupplyMetric({
  metric,
}: {
  metric: InternalMetrics["activeCandidateSupply"];
}) {
  if ("unavailableReason" in metric) {
    return (
      <MetricBlock
        definition={metric.definition}
        description="Historical candidate-supply observations captured during allocation attempts in the cohort window."
        id="pilot-recorded-candidate-supply-heading"
        metric={metric}
        rows={[]}
        title="Recorded candidate supply"
      />
    );
  }

  const rows = completeRows(
    metric,
    [
      row("Observations", formatCount(metric.observationCount)),
      coverageRow(
        metric.sourceCoverageStartsAt,
        metric.sourceDefinitionVersion,
      ),
    ],
    [
      row(
        "Observations missing source records",
        formatCount(metric.sourceIncompleteObservationCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Historical candidate-supply observations captured during allocation attempts in the cohort window."
      id="pilot-recorded-candidate-supply-heading"
      metric={metric}
      rows={rows}
      title="Recorded candidate supply"
    >
      {metric.byScopeAndCell ? (
        <MetricDisclosure label="Recorded supply breakdown">
          <div className="grid gap-6 sm:grid-cols-2">
            {metric.byScopeAndCell.map((cell) => (
              <DistributionList
                key={`${cell.scope}:${cell.allocationCell}`}
                label={`${scopeLabel(cell.scope)} · ${humanizeCode(cell.allocationCell)}`}
                rows={[
                  {
                    key: "observations",
                    label: "Observations",
                    value: formatCount(cell.observationCount),
                  },
                  {
                    key: "minimum",
                    label: "Minimum",
                    value: formatNumber(cell.minimumEligibleCandidateSupply),
                  },
                  {
                    key: "median",
                    label: "Median",
                    value: formatNumber(cell.medianEligibleCandidateSupply),
                  },
                  {
                    key: "mean",
                    label: "Mean",
                    value: formatNumber(cell.meanEligibleCandidateSupply),
                  },
                  {
                    key: "maximum",
                    label: "Maximum",
                    value: formatNumber(cell.maximumEligibleCandidateSupply),
                  },
                ]}
              />
            ))}
          </div>
        </MetricDisclosure>
      ) : null}
    </MetricBlock>
  );
}

function CapacityPressureMetric({
  metric,
}: {
  metric: InternalMetrics["capacityPressure"];
}) {
  if ("unavailableReason" in metric) {
    return (
      <MetricBlock
        definition={metric.definition}
        description="Historical group-creation attempts that did not have enough candidates or could not reserve capacity."
        id="pilot-capacity-pressure-heading"
        metric={metric}
        rows={[]}
        title="Candidate supply pressure"
      />
    );
  }

  const rows = completeRows(
    metric,
    [
      row("Observations", formatCount(metric.observationCount)),
      row(
        "Below requested minimum",
        `${formatCount(metric.belowRequestedMinimumObservationCount)} · ${formatPercent(metric.belowRequestedMinimumRatePercent, metric.observationCount)}`,
      ),
      row("Allocation attempts", formatCount(metric.commitAttemptCount)),
      row("Capacity conflicts", formatCount(metric.capacityConflictCount)),
      row(
        "Reservation conflicts",
        formatCount(metric.reservationConflictCount),
      ),
      coverageRow(
        metric.sourceCoverageStartsAt,
        metric.sourceDefinitionVersion,
      ),
    ],
    [
      row(
        "Observations missing source records",
        formatCount(metric.sourceIncompleteObservationCount),
      ),
    ],
  );

  return (
    <MetricBlock
      definition={metric.definition}
      description="Historical group-creation attempts that did not have enough candidates or could not reserve capacity."
      id="pilot-capacity-pressure-heading"
      metric={metric}
      rows={rows}
      title="Candidate supply pressure"
    />
  );
}

function MetricBlock({
  children,
  definition,
  description,
  id,
  metric,
  rows,
  title,
}: {
  children?: ReactNode;
  definition: AdminPilotMetricDefinition;
  description: string;
  id: string;
  metric: InternalMetricState;
  rows: MetricRow[];
  title: string;
}) {
  const state = getMetricDisplayState(metric);

  return (
    <section aria-labelledby={id} className="pt-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 id={id} className="font-semibold text-ink text-sm">
            {title}
          </h4>
          <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
            {description}
          </p>
        </div>
        <StatusPill size="xs" surface="soft" tone={state.tone}>
          {state.label}
        </StatusPill>
      </div>

      {metric.dataCompleteness !== "COMPLETE" ? (
        <p className="mt-3 max-w-2xl text-slate-muted text-xs leading-relaxed">
          {state.description}
        </p>
      ) : null}

      {rows.length > 0 ? (
        <dl className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-3">
          {rows.map((item) => (
            <MetricValueRow
              key={item.label}
              label={item.label}
              value={item.value}
              wide={item.wide}
            />
          ))}
        </dl>
      ) : null}

      {children}
      <MetricDefinitionDetails definition={definition} />
    </section>
  );
}

function MetricValueRow({ label, value, wide }: MetricRow) {
  return (
    <div
      className={cn(
        "flex min-w-0 items-start justify-between gap-4 rounded-xl bg-card px-4 py-3",
        wide && "sm:col-span-3",
      )}
    >
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function MetricDisclosure({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <CollapsibleSection
      className="mt-4"
      variant="card"
      summary={label}
      triggerClassName="text-primary text-xs"
    >
      {children}
    </CollapsibleSection>
  );
}

export function MetricDefinitionDetails({
  className,
  definition,
}: {
  className?: string;
  definition: AdminPilotMetricDefinition;
}) {
  const rows = [
    ["Measured", definition.numerator],
    ["Out of", definition.denominator],
    ["Window", definition.timeWindow],
    ["Excluded", definition.exclusions.join("; ") || "Nothing"],
    ["Source", definition.authoritativeSource],
    ["Definition", definition.version],
  ] as const;

  return (
    <CollapsibleSection
      className={className ?? "mt-4"}
      summary="How this measure works"
    >
      <dl className="grouped-surface mt-3 grid overflow-hidden rounded-xl">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid gap-1 rounded-xl bg-card px-4 py-2 sm:grid-cols-3 sm:gap-4"
          >
            <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
            <dd className="text-ink text-xs leading-relaxed sm:col-span-2">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </CollapsibleSection>
  );
}

function DistributionList({
  label,
  rows,
}: {
  label: string;
  rows: Array<{ key: string; label: string; value: string }>;
}) {
  return (
    <div>
      <h5 className="font-semibold text-ink text-xs">{label}</h5>
      <dl className="grouped-surface mt-2 grid overflow-hidden rounded-xl">
        {rows.length > 0 ? (
          rows.map((item) => (
            <MetricValueRow
              key={item.key}
              label={item.label}
              value={item.value}
            />
          ))
        ) : (
          <MetricValueRow label="Recorded groups" value="0" />
        )}
      </dl>
    </div>
  );
}

function completeRows(
  metric: InternalMetricState,
  complete: MetricRow[],
  incomplete: MetricRow[] = [],
) {
  if (metric.dataCompleteness === "COMPLETE") return complete;
  return metric.dataCompleteness === "SOURCE_INCOMPLETE" ? incomplete : [];
}

function row(label: string, value: ReactNode): MetricRow {
  return { label, value };
}

function coverageRow(
  coverageStartsAt: string | null,
  sourceDefinitionVersion: string | null,
): MetricRow {
  return {
    label: "Source coverage",
    value: coverageStartsAt ? (
      <span>
        From <AdminDateTime value={coverageStartsAt} />
        {sourceDefinitionVersion ? ` · ${sourceDefinitionVersion}` : ""}
      </span>
    ) : (
      "Not recorded"
    ),
    wide: true,
  };
}

function isUnavailableMetric(
  metric: InternalMetricState,
): metric is InternalMetricState & { unavailableReason: "NOT_INSTRUMENTED" } {
  return metric.unavailableReason === "NOT_INSTRUMENTED";
}

function getMetricDisplayState(metric: InternalMetricState): {
  description: string;
  label: string;
  tone: StatusPillTone;
} {
  if (isUnavailableMetric(metric)) {
    return {
      description: "This source was not instrumented for the measured period.",
      label: "Not instrumented",
      tone: "neutral",
    };
  }
  if (metric.dataCompleteness === "RETENTION_PURGED") {
    return {
      description:
        "The source records for this measure were removed on schedule.",
      label: "Source records removed",
      tone: "amber",
    };
  }
  if (metric.dataCompleteness === "SOURCE_INCOMPLETE") {
    return {
      description:
        "Some required source records are missing, so the result is withheld.",
      label: "Source incomplete",
      tone: "amber",
    };
  }
  if (metric.measurementState === "PROVISIONAL") {
    return {
      description: "The fixed measurement window is still open.",
      label: "Still measuring",
      tone: "amber",
    };
  }
  return {
    description: "The fixed window is closed and the source is complete.",
    label: "Final and complete",
    tone: "teal",
  };
}

function formatCount(value: number | null) {
  return value === null ? "Not available" : NUMBER_FORMATTER.format(value);
}

function formatNumber(value: number) {
  return NUMBER_FORMATTER.format(value);
}

function formatPercent(value: number | null, denominator: number | null) {
  if (value !== null) return `${value.toFixed(1)}%`;
  if (denominator === 0) return "No eligible records yet";
  return "Not available";
}

function formatRatio(value: number | null, denominator: number | null) {
  if (value !== null) return value.toFixed(3).replace(/\.?0+$/, "");
  if (denominator === 0) return "No formed groups yet";
  return "Not available";
}

function formatDuration(value: number | null, coveredCount: number | null) {
  if (value === null) {
    return coveredCount === 0 ? "No covered requests yet" : "Not available";
  }
  const minutes = value / 60_000;
  if (minutes < 60) return `${rounded(minutes)} min`;
  const hours = minutes / 60;
  if (hours < 24) return `${rounded(hours)} hr`;
  return `${rounded(hours / 24)} days`;
}

function rounded(value: number) {
  return Math.round(value * 10) / 10;
}

function ordinal(bucket: "1" | "2" | "3") {
  return { "1": "First", "2": "Second", "3": "Third" }[bucket];
}

function scopeLabel(scope: "LOCAL" | "ONLINE") {
  return scope === "LOCAL" ? "Local" : "Online";
}

function humanizeCode(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function AdminDateTime({ value }: { value: string }) {
  return (
    <time dateTime={value}>{DATE_TIME_FORMATTER.format(new Date(value))}</time>
  );
}
