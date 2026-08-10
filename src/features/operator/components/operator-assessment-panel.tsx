import { useQuery, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { RefreshCw } from "lucide-react";
import { useEffect, useId, useState } from "react";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import { OperatorPanel } from "@/features/operator/components/operator-case-panels";
import {
  formatOperatorDate,
  humanizeCode,
  SEVERITY_LABELS,
} from "@/features/operator/lib/operator-language";
import type {
  OperatorAssessment,
  OperatorAssessmentComparison,
  OperatorAssessmentHistory,
} from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Skeleton } from "@/shared/components/ui/skeleton";

const OUTCOME_LABELS: Record<OperatorAssessment["operatorOutcome"], string> = {
  NOT_REVIEWED: "Not reviewed",
  FOLLOWED: "Followed",
  CHANGED: "Changed",
  NOT_USED: "Not used",
};

export function OperatorAssessmentPanel({ caseId }: { caseId: string }) {
  const queryClient = useQueryClient();
  const query = useQuery(operatorQueries.assessments(caseId));

  useEffect(
    () => () => {
      queryClient.removeQueries({
        queryKey: OPERATOR_QUERY_KEYS.assessments(caseId),
        exact: true,
      });
      queryClient.removeQueries({
        predicate: ({ queryKey }) =>
          queryKey[0] === "admin" &&
          queryKey[1] === "operator" &&
          queryKey[2] === "moderation" &&
          queryKey[3] === "cases" &&
          queryKey[4] === caseId &&
          queryKey[5] === "assessment-comparison",
      });
    },
    [caseId, queryClient],
  );

  useEffect(() => {
    if (!isAccessError(query.error)) return;
    queryClient.removeQueries({
      queryKey: OPERATOR_QUERY_KEYS.assessments(caseId),
      exact: true,
    });
  }, [caseId, query.error, queryClient]);

  return (
    <OperatorPanel title="Triage assessments">
      <p className="text-slate-muted text-sm leading-relaxed">
        These assessments help staff review the case. A person remains
        responsible for every case decision.
      </p>
      {query.isLoading ? (
        <AssessmentSkeleton />
      ) : query.isError || !query.data ? (
        <AssessmentError
          accessChanged={isAccessError(query.error)}
          onRetry={() => void query.refetch()}
        />
      ) : (
        <AssessmentContent caseId={caseId} history={query.data} />
      )}
    </OperatorPanel>
  );
}

function AssessmentContent({
  caseId,
  history,
}: {
  caseId: string;
  history: OperatorAssessmentHistory;
}) {
  const assessments = [...history.assessments].sort(
    (left, right) =>
      new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
  );
  const stateCopy = getAssessmentStateCopy(history);

  if (history.state !== "AVAILABLE" || assessments.length === 0) {
    return (
      <div className="rounded-xl bg-muted/45 p-4 text-slate-muted text-sm leading-relaxed">
        {stateCopy}
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      {assessments.length > 1 ? (
        <AssessmentComparison caseId={caseId} assessments={assessments} />
      ) : null}
      <ol className="grid gap-4" aria-label="Assessment history">
        {assessments.map((assessment, index) => (
          <AssessmentCard
            key={assessment.id}
            assessment={assessment}
            latest={index === 0}
          />
        ))}
      </ol>
    </div>
  );
}

function AssessmentComparison({
  assessments,
  caseId,
}: {
  assessments: OperatorAssessment[];
  caseId: string;
}) {
  const [earlierId, setEarlierId] = useState(assessments[1]?.id ?? "");
  const [laterId, setLaterId] = useState(assessments[0]?.id ?? "");
  const hasPair = Boolean(earlierId && laterId && earlierId !== laterId);
  const earlierAssessment = assessments.find(
    (assessment) => assessment.id === earlierId,
  );
  const laterAssessment = assessments.find(
    (assessment) => assessment.id === laterId,
  );
  const comparisonQuery = useQuery({
    ...operatorQueries.assessmentComparison({
      caseId,
      earlierAssessmentId: earlierId,
      laterAssessmentId: laterId,
    }),
    enabled: hasPair,
  });

  return (
    <section className="grid gap-4 rounded-xl border border-border p-4">
      <div className="grid gap-1">
        <h3 className="font-semibold text-ink text-sm">Compare assessments</h3>
        <p className="text-slate-muted text-xs leading-relaxed">
          Compare the policy labels and suggested next steps from two completed
          assessments.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <AssessmentSelect
          label="Earlier assessment"
          value={earlierId}
          assessments={assessments}
          onChange={setEarlierId}
        />
        <AssessmentSelect
          label="Later assessment"
          value={laterId}
          assessments={assessments}
          onChange={setLaterId}
        />
      </div>
      {!hasPair ? (
        <p className="text-slate-muted text-sm" role="status">
          Choose two different assessments.
        </p>
      ) : comparisonQuery.isLoading ? (
        <Skeleton className="h-32 rounded-xl" />
      ) : comparisonQuery.isError || !comparisonQuery.data ? (
        <div className="grid gap-2">
          <p className="text-destructive text-sm" role="alert">
            The comparison could not be loaded.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-fit"
            onClick={() => void comparisonQuery.refetch()}
          >
            <RefreshCw className="size-4" aria-hidden="true" />
            Try again
          </Button>
        </div>
      ) : (
        <div className="grid gap-3" aria-live="polite">
          {!comparisonQuery.data.compatible ? (
            <p className="rounded-xl bg-accent-soft p-4 text-amber-900 text-sm dark:text-amber-200">
              The output format changed between these assessments. Compare the
              release details below, then review each assessment separately.
            </p>
          ) : null}
          <dl className="grid gap-3">
            {comparisonQuery.data.changes.map((change) => (
              <div
                key={change.field}
                className="grid gap-2 rounded-xl bg-muted/45 p-3 sm:grid-cols-[10rem_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <dt className="font-semibold text-ink text-xs">
                  {comparisonFieldLabel(change.field, change.displayLabel)}
                  <span className="mt-0.5 block font-normal text-slate-muted">
                    {humanizeCode(change.state)}
                  </span>
                </dt>
                <ComparisonValue
                  label="Earlier"
                  value={comparisonDisplayValue(
                    change.field,
                    change.earlierValue,
                    earlierAssessment,
                  )}
                />
                <ComparisonValue
                  label="Later"
                  value={comparisonDisplayValue(
                    change.field,
                    change.laterValue,
                    laterAssessment,
                  )}
                />
              </div>
            ))}
          </dl>
        </div>
      )}
    </section>
  );
}

function AssessmentSelect({
  assessments,
  label,
  onChange,
  value,
}: {
  assessments: OperatorAssessment[];
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = useId();

  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="font-semibold text-ink text-xs">
        {label}
      </FieldLabel>
      <NativeSelect
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl"
      >
        {assessments.map((assessment) => (
          <NativeSelectOption key={assessment.id} value={assessment.id}>
            {formatOperatorDate(assessment.createdAt)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

function ComparisonValue({
  label,
  value,
}: {
  label: string;
  value: string | string[];
}) {
  return (
    <dd className="min-w-0 text-ink text-sm">
      <span className="block font-semibold text-slate-muted text-xs sm:hidden">
        {label}
      </span>
      {Array.isArray(value) ? (
        value.length ? (
          <ul className="grid gap-1">
            {[...new Set(value)].map((item) => (
              <li key={item} className="wrap-break-word">
                {item}
              </li>
            ))}
          </ul>
        ) : (
          "None"
        )
      ) : (
        <span className="wrap-break-word">{value}</span>
      )}
    </dd>
  );
}

type AssessmentComparisonValue =
  OperatorAssessmentComparison["changes"][number]["earlierValue"];

function comparisonFieldLabel(field: string, serverLabel: string) {
  const labels: Record<string, string> = {
    provider: "Assessment service",
    modelVersion: "Classifier release",
    promptVersion: "Review instructions release",
    policyVersion: "Policy release",
    schemaVersion: "Output format release",
  };
  return labels[field] ?? serverLabel;
}

function comparisonDisplayValue(
  field: string,
  value: AssessmentComparisonValue,
  assessment: AssessmentDisplayContext | undefined,
): string | string[] {
  if (field === "provider" || field === "modelVersion") return "Not shown";
  if (field === "policyLabels" && Array.isArray(value)) {
    return value.map(
      (code) =>
        assessment?.policyLabels.find((label) => label.code === code)
          ?.displayLabel ?? humanizeCode(code),
    );
  }
  if (
    field === "suggestedAction" &&
    typeof value === "string" &&
    assessment?.suggestedAction?.code === value
  ) {
    return assessment.suggestedAction.displayLabel;
  }
  if (field === "suggestedSeverity" && typeof value === "string") {
    return severityLabel(value);
  }
  if (field === "uncertainty" && typeof value === "string") {
    return humanizeCode(value);
  }
  if (value === null || value === "") return "Not set";
  if (Array.isArray(value)) return value;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number")
    return new Intl.NumberFormat("en-GB").format(value);
  return value;
}

type AssessmentDisplayContext = {
  policyLabels: Array<{ code: string; displayLabel: string }>;
  suggestedAction: { code: string; displayLabel: string } | null;
};

function severityLabel(value: string) {
  const label = Object.entries(SEVERITY_LABELS).find(
    ([severity]) => severity === value,
  )?.[1];
  return label ?? humanizeCode(value);
}

function AssessmentCard({
  assessment,
  latest,
}: {
  assessment: OperatorAssessment;
  latest: boolean;
}) {
  return (
    <li className="grid gap-4 rounded-xl bg-muted/45 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="grid gap-0.5">
          <h3 className="font-semibold text-ink text-sm">
            {latest ? "Latest assessment" : "Earlier assessment"}
          </h3>
          <time className="text-slate-muted text-xs">
            {formatOperatorDate(assessment.createdAt)}
          </time>
        </div>
        <span className="rounded-full bg-card px-2.5 py-1 font-semibold text-slate-muted text-xs">
          Shadow review
        </span>
      </div>

      <dl className="grid gap-3 sm:grid-cols-3">
        <AssessmentFact
          label="Suggested urgency"
          value={
            assessment.suggestedSeverity
              ? SEVERITY_LABELS[assessment.suggestedSeverity]
              : "No suggestion"
          }
        />
        <AssessmentFact
          label="Uncertainty"
          value={humanizeCode(assessment.uncertainty)}
        />
        <AssessmentFact
          label="Suggested next step"
          value={assessment.suggestedAction?.displayLabel ?? "No suggestion"}
        />
        <AssessmentFact
          label="Operator outcome"
          value={OUTCOME_LABELS[assessment.operatorOutcome]}
        />
        <AssessmentFact
          label="Policy release"
          value={assessment.release.policyVersion}
        />
      </dl>

      <AssessmentLabels assessment={assessment} />
      <AssessmentRationale assessment={assessment} />
    </li>
  );
}

function AssessmentLabels({ assessment }: { assessment: OperatorAssessment }) {
  return (
    <div className="grid gap-2">
      <h4 className="font-semibold text-slate-muted text-xs">Policy labels</h4>
      {assessment.policyLabels.length ? (
        <ul className="flex flex-wrap gap-2">
          {assessment.policyLabels.map((label) => (
            <li
              key={label.code}
              className="rounded-full bg-card px-2.5 py-1 font-semibold text-ink text-xs"
            >
              {label.displayLabel}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-muted text-sm">No policy labels returned.</p>
      )}
    </div>
  );
}

function AssessmentRationale({
  assessment,
}: {
  assessment: OperatorAssessment;
}) {
  return (
    <div className="grid gap-2">
      <h4 className="font-semibold text-slate-muted text-xs">
        Evidence-linked notes
      </h4>
      {assessment.rationale.length ? (
        <ul className="grid gap-2">
          {assessment.rationale.map((item) => (
            <li
              key={`${item.text}-${item.evidenceIds.join("-")}`}
              className="grid gap-1"
            >
              <p className="wrap-break-word whitespace-pre-wrap text-ink text-sm leading-relaxed">
                {item.text}
              </p>
              <p className="text-slate-muted text-xs">
                Evidence references: {item.evidenceIds.join(", ") || "None"}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-slate-muted text-sm">
          No assessment notes returned.
        </p>
      )}
    </div>
  );
}

function AssessmentFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word text-ink text-sm">{value}</dd>
    </div>
  );
}

function AssessmentSkeleton() {
  return (
    <div
      className="grid gap-3"
      role="status"
      aria-label="Loading triage assessments"
    >
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-40 rounded-xl" />
    </div>
  );
}

function AssessmentError({
  accessChanged,
  onRetry,
}: {
  accessChanged: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-xl bg-muted/45 p-4">
      <p className="text-slate-muted text-sm" role="alert">
        {accessChanged
          ? "Case access changed. Assessment data has been cleared."
          : "Assessments could not be loaded. Continue the human review."}
      </p>
      {!accessChanged ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-fit"
          onClick={onRetry}
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      ) : null}
    </div>
  );
}

function getAssessmentStateCopy(history: OperatorAssessmentHistory) {
  switch (history.state) {
    case "SKIPPED_SPECIALIST_ROUTE":
      return "This case stays in the specialist review path. General assessment is not run.";
    case "QUEUED":
      return "Waiting for an assessment. Continue the human review if the case needs attention now.";
    case "RUNNING":
      return "Assessment in progress. Continue the human review if the case needs attention now.";
    case "RETRYING":
      return "The assessment will be tried again. Continue the human review.";
    case "UNAVAILABLE":
      return "Assessment is unavailable. Continue the human review.";
    case "NOT_REQUESTED":
      return "No assessment was requested. Continue the human review.";
    case "AVAILABLE":
      return "No completed assessment yet.";
    default:
      return "Assessment status is unavailable. Continue the human review.";
  }
}

function isAccessError(error: unknown) {
  return (
    error instanceof HTTPError &&
    [401, 403, 404].includes(error.response.status)
  );
}
