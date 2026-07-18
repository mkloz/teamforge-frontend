import type { AdminPilotMetrics } from "@/features/admin/schemas/admin-pilot-metrics.schema";
import { StatusPill } from "@/shared/components/ui/status-pill";
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
      className="border-border border-t pt-5"
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
    <dl className="mt-4 grid gap-x-8 border-border border-t sm:grid-cols-2 lg:grid-cols-3">
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
    <section aria-labelledby={id} className="border-border border-t pt-4">
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
      className="mt-6 border-border border-t pt-5"
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
        <p className="mt-3 border-border border-y py-4 text-slate-muted text-sm leading-relaxed">
          No activity response totals are available yet.
        </p>
      ) : (
        <ul className="mt-3 border-border border-t">
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
    <li className="border-border border-b py-4">
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
  const recordedReasons = reasons.filter(({ count }) => count > 0);

  return (
    <section
      aria-labelledby="pilot-candidate-decline-reasons-heading"
      className="mt-6 border-border border-t pt-5"
    >
      <h4
        id="pilot-candidate-decline-reasons-heading"
        className="font-semibold text-ink text-sm"
      >
        Reasons given when declining
      </h4>
      <p className="mt-1 max-w-2xl text-pretty text-slate-muted text-xs leading-relaxed">
        Candidates can skip this question. This screen shows internal totals
        only, and the reasons do not affect trust scores.
      </p>

      {recordedReasons.length === 0 ? (
        <p className="mt-3 border-border border-y py-4 text-slate-muted text-sm leading-relaxed">
          No decline reasons have been recorded.
        </p>
      ) : (
        <dl className="mt-3 border-border border-t">
          {recordedReasons.map(({ count, reason }) => (
            <CandidateMetricDetail
              key={reason}
              label={DECLINE_REASON_LABELS[reason]}
              value={NUMBER_FORMATTER.format(count)}
            />
          ))}
        </dl>
      )}
    </section>
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
    <div className="flex min-w-0 items-start justify-between gap-4 border-border border-b py-3">
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
    <div className="mt-4 border-border border-y py-4">
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
    <div className="mt-4 border-border border-y py-4">
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
