import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import type { AdminPilotMetrics } from "@/features/admin/schemas/admin-pilot-metrics.schema";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/shared/components/ui/chart";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { cn } from "@/shared/lib/utils";
import type { PlanCategory } from "@/shared/schemas";

const NUMBER_FORMATTER = new Intl.NumberFormat();

const CATEGORY_LABELS: Record<PlanCategory, string> = {
  TECH: "Tech",
  SPORTS: "Sports",
  ARTS: "Arts",
  SOCIAL: "Social",
  OUTDOORS: "Outdoors",
  LEARNING: "Learning",
  MUSIC: "Music",
  FOOD: "Food",
  GAMING: "Gaming",
  WELLNESS: "Wellness",
  TRAVEL: "Travel",
  OTHER: "Other",
};

const DECLINE_REASON_LABELS = {
  ACTIVITY_NOT_FOR_ME: "Not interested in the activity",
  FIXED_TIME_DOES_NOT_WORK: "The time didn't work",
  AREA_DOES_NOT_WORK: "The area didn't work",
  NOT_THIS_GROUP: "Not this group",
  TAKING_A_BREAK: "Taking a break",
  PREFER_NOT_TO_SAY: "Not provided or prefer not to say",
} as const;

const DECLINE_REASON_SHORT_LABELS = {
  ACTIVITY_NOT_FOR_ME: "Activity mismatch",
  FIXED_TIME_DOES_NOT_WORK: "Time conflict",
  AREA_DOES_NOT_WORK: "Area conflict",
  NOT_THIS_GROUP: "Group mismatch",
  TAKING_A_BREAK: "Taking a break",
  PREFER_NOT_TO_SAY: "Not provided",
} as const;

const DECLINE_REASON_CHART_CONFIG = {
  count: {
    label: "Declines",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

type PilotMetricsCohort = NonNullable<AdminPilotMetrics["activeCohort"]>;
type CandidateWillingness = PilotMetricsCohort["candidateWillingness"];
type CandidateResponseValues = CandidateWillingness["local"];
type CandidateActivityScope = NonNullable<
  CandidateWillingness["byActivityScope"]
>[number];
type CandidateDeclineReason = NonNullable<
  CandidateWillingness["declineReasons"]
>[number];

export function AdminCandidateResponseMetrics({
  metric,
}: {
  metric: CandidateWillingness;
}) {
  const overall = getOverallValues(metric);

  return (
    <section
      aria-labelledby="pilot-candidate-responses-heading"
      className="pt-2"
    >
      <CandidateResponseHeading measurementState={metric.measurementState} />

      {metric.dataCompleteness !== "COMPLETE" ? (
        <CandidateResponseIncomplete
          dataCompleteness={metric.dataCompleteness}
        />
      ) : metric.eligibleExposureCount === 0 ? (
        <CandidateResponseEmpty
          cancelledCount={metric.cancelledBeforeResponseCount ?? 0}
        />
      ) : (
        <>
          <CandidateResponseDetails values={overall} />

          <div className="mt-5 grid gap-6 lg:grid-cols-2">
            <CandidateResponseScope
              description="Candidate invitations for local activities."
              id="pilot-candidate-responses-local"
              label="Local"
              statusLabel="Primary pilot measure"
              statusTone="teal"
              values={metric.local}
            />
            <CandidateResponseScope
              description="Candidate invitations for online activities."
              id="pilot-candidate-responses-online"
              label="Online"
              statusLabel="Separate measure"
              statusTone="neutral"
              values={metric.online}
            />
          </div>

          <CandidateActivityScopeBreakdown
            rows={metric.byActivityScope ?? []}
          />
          <CandidateDeclineReasonBreakdown
            reasons={metric.declineReasons ?? []}
          />
        </>
      )}
    </section>
  );
}

function CandidateResponseHeading({
  measurementState,
}: {
  measurementState: CandidateWillingness["measurementState"];
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3
          id="pilot-candidate-responses-heading"
          className="font-semibold text-ink text-sm"
        >
          Candidate responses
        </h3>
        <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
          Each candidate invitation is counted once by its first response. An
          acceptance stays accepted if the candidate later withdraws.
          Invitations cancelled before a response stay outside the acceptance
          rate.
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

function CandidateResponseDetails({
  values,
}: {
  values: CandidateResponseValues;
}) {
  return (
    <dl className="grouped-surface mt-4 grid overflow-hidden rounded-xl sm:grid-cols-2 lg:grid-cols-3">
      <CandidateMetricDetail
        label="Invitations measured"
        value={formatCount(values.eligibleExposureCount)}
      />
      <CandidateMetricDetail
        label="Accepted first"
        value={formatCount(values.acceptedExposureCount)}
      />
      <CandidateMetricDetail
        label="Declined first"
        value={formatCount(values.declinedExposureCount)}
      />
      <CandidateMetricDetail
        label="No response by deadline"
        value={formatCount(values.unansweredExposureCount)}
      />
      <CandidateMetricDetail
        label="Cancelled before first response"
        value={formatCount(values.cancelledBeforeResponseCount)}
      />
      <CandidateMetricDetail
        label="Acceptance rate"
        value={formatRate(values)}
      />
    </dl>
  );
}

function CandidateResponseScope({
  description,
  id,
  label,
  statusLabel,
  statusTone,
  values,
}: {
  description: string;
  id: string;
  label: string;
  statusLabel: string;
  statusTone: "neutral" | "teal";
  values: CandidateResponseValues;
}) {
  return (
    <section aria-labelledby={id} className="rounded-xl bg-card p-4">
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
      <CandidateResponseDetails values={values} />
    </section>
  );
}

function CandidateActivityScopeBreakdown({
  rows,
}: {
  rows: CandidateActivityScope[];
}) {
  const visibleRows = rows.filter(
    (row) =>
      row.eligibleExposureCount > 0 || row.cancelledBeforeResponseCount > 0,
  );

  return (
    <section
      aria-labelledby="pilot-candidate-activity-scope-heading"
      className="mt-6"
    >
      <h4
        id="pilot-candidate-activity-scope-heading"
        className="font-semibold text-ink text-sm"
      >
        By activity and scope
      </h4>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
        First responses stay separated by activity category and whether the
        activity was local or online.
      </p>

      {visibleRows.length === 0 ? (
        <p className="mt-3 rounded-xl bg-card px-4 py-4 text-slate-muted text-sm leading-relaxed">
          No activity response totals are available yet.
        </p>
      ) : (
        <ul className="grouped-surface mt-3 grid overflow-hidden rounded-xl">
          {visibleRows.map((row) => (
            <CandidateActivityScopeRow
              key={`${row.activityCategory}-${row.scope}`}
              row={row}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function CandidateActivityScopeRow({ row }: { row: CandidateActivityScope }) {
  const reasons = row.declineReasons.filter(({ count }) => count > 0);

  return (
    <li className="bg-card px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-semibold text-ink text-sm">
          {CATEGORY_LABELS[row.activityCategory]}
        </p>
        <StatusPill size="xs" surface="soft" tone="neutral">
          {row.scope === "LOCAL" ? "Local" : "Online"}
        </StatusPill>
      </div>
      <CandidateResponseDetails values={row} />
      <p className="mt-3 text-slate-muted text-xs leading-relaxed">
        <span className="font-semibold text-ink">
          Recorded decline reasons:{" "}
        </span>
        {formatDeclineReasonSummary(reasons)}
      </p>
    </li>
  );
}

function CandidateDeclineReasonBreakdown({
  reasons,
}: {
  reasons: CandidateDeclineReason[];
}) {
  const recordedReasons = reasons
    .filter(({ count }) => count > 0)
    .sort(
      (first, second) =>
        second.count - first.count ||
        DECLINE_REASON_LABELS[first.reason].localeCompare(
          DECLINE_REASON_LABELS[second.reason],
        ),
    );

  return (
    <section
      aria-labelledby="pilot-candidate-decline-reasons-heading"
      className="mt-6"
    >
      <h4
        id="pilot-candidate-decline-reasons-heading"
        className="font-semibold text-ink text-sm"
      >
        Reasons given when declining
      </h4>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
        Candidates can skip this question. This screen shows internal totals
        only, and the reasons do not affect participation reputation.
      </p>

      {recordedReasons.length === 0 ? (
        <p className="mt-3 rounded-xl bg-card px-4 py-4 text-slate-muted text-sm leading-relaxed">
          No decline reasons have been recorded.
        </p>
      ) : recordedReasons.length === 1 ? (
        <dl className="grouped-surface mt-3 grid overflow-hidden rounded-xl">
          <CandidateMetricDetail
            label={DECLINE_REASON_LABELS[recordedReasons[0].reason]}
            value={NUMBER_FORMATTER.format(recordedReasons[0].count)}
          />
        </dl>
      ) : (
        <CandidateDeclineReasonChart reasons={recordedReasons} />
      )}
    </section>
  );
}

function CandidateDeclineReasonChart({
  reasons,
}: {
  reasons: CandidateDeclineReason[];
}) {
  const chartData = reasons.map(({ count, reason }) => ({
    count,
    label: DECLINE_REASON_LABELS[reason],
    shortLabel: DECLINE_REASON_SHORT_LABELS[reason],
  }));
  const total = reasons.reduce((sum, reason) => sum + reason.count, 0);
  const leadingReason = reasons[0];

  return (
    <figure className="mt-3 overflow-hidden rounded-xl bg-card p-4 sm:p-5">
      <figcaption className="max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
        {NUMBER_FORMATTER.format(total)} recorded{" "}
        {total === 1 ? "reason" : "reasons"}. The most common is{" "}
        <span className="font-semibold text-ink">
          {DECLINE_REASON_LABELS[leadingReason.reason]}
        </span>{" "}
        ({NUMBER_FORMATTER.format(leadingReason.count)}).
      </figcaption>

      <ChartContainer
        config={DECLINE_REASON_CHART_CONFIG}
        className={cn(
          "mt-4 w-full",
          reasons.length <= 2 ? "h-32" : reasons.length <= 4 ? "h-48" : "h-64",
        )}
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          layout="vertical"
          margin={{ left: 0, right: 36 }}
        >
          <CartesianGrid horizontal={false} />
          <YAxis
            axisLine={false}
            dataKey="shortLabel"
            tickLine={false}
            tickMargin={8}
            type="category"
            width={112}
          />
          <XAxis dataKey="count" hide type="number" />
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                indicator="line"
                labelFormatter={(_, payload) =>
                  payload[0]?.payload?.label ?? "Decline reason"
                }
              />
            }
          />
          <Bar
            dataKey="count"
            fill="var(--color-count)"
            maxBarSize={28}
            radius={[0, 4, 4, 0]}
          >
            <LabelList
              className="fill-foreground"
              dataKey="count"
              fontSize={12}
              offset={8}
              position="right"
            />
          </Bar>
        </BarChart>
      </ChartContainer>

      <dl className="sr-only">
        {reasons.map(({ count, reason }) => (
          <div key={reason}>
            <dt>{DECLINE_REASON_LABELS[reason]}</dt>
            <dd>{NUMBER_FORMATTER.format(count)}</dd>
          </div>
        ))}
      </dl>
    </figure>
  );
}

function CandidateMetricDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-4 bg-card px-4 py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="min-w-0 text-right font-semibold text-ink text-sm tabular-nums">
        {value}
      </dd>
    </div>
  );
}

function CandidateResponseEmpty({
  cancelledCount,
}: {
  cancelledCount: number;
}) {
  return (
    <div className="mt-4 rounded-xl bg-card px-4 py-4">
      <StatusPill size="sm" surface="soft" tone="neutral">
        No measured candidate invitations
      </StatusPill>
      <p className="mt-2 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        No candidate invitation has been accepted or declined, or reached its
        response deadline, in this cohort yet.
      </p>
      {cancelledCount > 0 ? (
        <p className="mt-1 text-slate-muted text-xs leading-relaxed">
          {NUMBER_FORMATTER.format(cancelledCount)}{" "}
          {cancelledCount === 1
            ? "candidate invitation was cancelled"
            : "candidate invitations were cancelled"}{" "}
          before a response.
        </p>
      ) : null}
    </div>
  );
}

function CandidateResponseIncomplete({
  dataCompleteness,
}: {
  dataCompleteness: Exclude<
    CandidateWillingness["dataCompleteness"],
    "COMPLETE"
  >;
}) {
  const isSourceIncomplete = dataCompleteness === "SOURCE_INCOMPLETE";

  return (
    <div className="mt-4 rounded-xl bg-card px-4 py-4">
      <p className="font-semibold text-ink text-sm">
        {isSourceIncomplete
          ? "Candidate response records are incomplete"
          : "Candidate response data is incomplete"}
      </p>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-sm leading-relaxed">
        {isSourceIncomplete
          ? "Some response records are missing or incomplete. Counts and reason totals are unavailable until the records are repaired."
          : "Records needed for this measure were removed under the retention schedule. Counts and reason totals are unavailable."}
      </p>
    </div>
  );
}

function getOverallValues(
  metric: CandidateWillingness,
): CandidateResponseValues {
  return {
    eligibleExposureCount: metric.eligibleExposureCount,
    acceptedExposureCount: metric.acceptedExposureCount,
    declinedExposureCount: metric.declinedExposureCount,
    unansweredExposureCount: metric.unansweredExposureCount,
    cancelledBeforeResponseCount: metric.cancelledBeforeResponseCount,
    acceptanceRatePercent: metric.acceptanceRatePercent,
  };
}

function formatCount(value: number | null) {
  return value === null ? "Unavailable" : NUMBER_FORMATTER.format(value);
}

function formatRate(values: CandidateResponseValues) {
  if (values.eligibleExposureCount === 0) {
    return "No responses yet";
  }
  return values.acceptanceRatePercent === null
    ? "Unavailable"
    : `${values.acceptanceRatePercent.toFixed(1)}%`;
}

function formatDeclineReasonSummary(reasons: CandidateDeclineReason[]) {
  if (reasons.length === 0) {
    return "None recorded";
  }

  return reasons
    .map(
      ({ count, reason }) =>
        `${DECLINE_REASON_LABELS[reason]} (${NUMBER_FORMATTER.format(count)})`,
    )
    .join(", ");
}
