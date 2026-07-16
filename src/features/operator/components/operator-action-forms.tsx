import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useId, useRef } from "react";
import { OperatorApi } from "@/features/operator/api/operator.api";
import {
  OPERATOR_QUERY_KEYS,
  operatorQueries,
} from "@/features/operator/api/operator-queries";
import { OperatorPanel } from "@/features/operator/components/operator-case-panels";
import {
  formatOperatorDate,
  humanizeCode,
} from "@/features/operator/lib/operator-language";
import type {
  OperatorCaseDetail,
  OperatorCommand,
  OperatorRole,
  OperatorSession,
  RequestInformationPayload,
  TriageCasePayload,
} from "@/features/operator/schemas/operator.schemas";
import { operatorAssistanceDispositionSchema } from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

type CommandBody = Omit<OperatorCommand, "idempotencyKey">;

function usePayloadIdempotencyKey() {
  const submissionRef = useRef<{ fingerprint: string; key: string } | null>(
    null,
  );
  return (payload: unknown) => {
    const fingerprint = JSON.stringify(payload);
    if (submissionRef.current?.fingerprint !== fingerprint) {
      submissionRef.current = { fingerprint, key: crypto.randomUUID() };
    }
    return submissionRef.current.key;
  };
}

function hasRole(session: OperatorSession, roles: OperatorRole[]) {
  return roles.some((role) => session.roles.includes(role));
}

export function OperatorCaseActions({
  item,
  session,
}: {
  item: OperatorCaseDetail;
  session: OperatorSession;
}) {
  const assessmentsQuery = useQuery(operatorQueries.assessments(item.id));
  const latestAssessmentId = getLatestAssessmentId(
    assessmentsQuery.data?.assessments ?? [],
  );
  const canModerate = hasRole(session, [
    "MODERATOR",
    "CHILD_SAFETY_SPECIALIST",
  ]);
  const canEscalate = hasRole(session, [
    "MODERATOR",
    "CHILD_SAFETY_SPECIALIST",
    "LEGAL_REVIEWER",
  ]);
  const canReverse = hasRole(session, [
    "MODERATOR",
    "APPEAL_REVIEWER",
    "LEGAL_REVIEWER",
  ]);
  const canMoveToEscalation = [
    "TRIAGING",
    "NEEDS_INFORMATION",
    "ACTION_PENDING",
    "MONITORING",
    "RESOLVED",
    "CLOSED",
  ].includes(item.status);
  const canMoveToMonitoring = [
    "AWAITING_HUMAN_DECISION",
    "ACTION_PENDING",
    "MONITORING",
  ].includes(item.status);

  if (!canModerate && !canEscalate && !canReverse) return null;

  if (assessmentsQuery.isLoading) {
    return (
      <OperatorPanel title="Case controls">
        <p className="text-slate-muted text-sm" role="status">
          Checking the latest assessment before enabling decisions…
        </p>
      </OperatorPanel>
    );
  }

  if (assessmentsQuery.isError) {
    return (
      <OperatorPanel title="Case controls">
        <p className="text-destructive text-sm" role="alert">
          Decision controls are unavailable because the latest assessment could
          not be loaded.
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="w-fit"
          onClick={() => void assessmentsQuery.refetch()}
        >
          Try again
        </Button>
      </OperatorPanel>
    );
  }

  return (
    <OperatorPanel title="Case controls">
      <div className="grid gap-5">
        {canModerate && item.status === "OPEN" ? (
          <TriageForm assessmentId={latestAssessmentId} caseId={item.id} />
        ) : null}
        {canEscalate && canMoveToEscalation ? (
          <CommandForm
            caseId={item.id}
            assessmentId={latestAssessmentId}
            heading="Escalate case"
            submitLabel="Escalate"
            execute={(payload) => OperatorApi.escalate(item.id, payload)}
          />
        ) : null}
        {canModerate && item.status === "TRIAGING" ? (
          item.reports.length > 0 ? (
            <InformationRequestForm
              assessmentId={latestAssessmentId}
              caseId={item.id}
              reports={item.reports}
            />
          ) : (
            <p className="text-slate-muted text-sm">
              More information cannot be requested because this case has no
              linked report.
            </p>
          )
        ) : null}
        {canReverse && canMoveToMonitoring
          ? item.enforcementActions
              .filter(
                (action) =>
                  action.state === "ACTIVE" || action.state === "EXPIRED",
              )
              .map((action) => (
                <CommandForm
                  key={action.id}
                  caseId={item.id}
                  assessmentId={latestAssessmentId}
                  heading={`Reverse ${action.actionType.toLowerCase().replaceAll("_", " ")}`}
                  submitLabel="Reverse action"
                  execute={(payload) =>
                    OperatorApi.reverseEnforcement(item.id, action.id, payload)
                  }
                />
              ))
          : null}
      </div>
    </OperatorPanel>
  );
}

function CommandForm({
  assessmentId,
  caseId,
  children,
  execute,
  heading,
  submitLabel,
}: {
  assessmentId: string | null;
  caseId: string;
  children?: ReactNode;
  execute: (payload: OperatorCommand) => Promise<unknown>;
  heading: string;
  submitLabel: string;
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const mutation = useMutation({
    mutationFn: execute,
    onSuccess: () => invalidateCase(queryClient, caseId),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = readCommandBody(
      new FormData(event.currentTarget),
      assessmentId,
    );
    mutation.mutate({ ...body, idempotencyKey: getIdempotencyKey(body) });
  }

  return (
    <ActionForm
      heading={heading}
      submitLabel={submitLabel}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      onSubmit={submit}
    >
      {children}
      <CommandFields assessmentId={assessmentId} />
    </ActionForm>
  );
}

function TriageForm({
  assessmentId,
  caseId,
}: {
  assessmentId: string | null;
  caseId: string;
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const mutation = useMutation({
    mutationFn: (payload: TriageCasePayload) =>
      OperatorApi.triage(caseId, payload),
    onSuccess: () => invalidateCase(queryClient, caseId),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const body = {
      ...readCommandBody(data, assessmentId),
      severity: readString(data, "severity"),
      evidenceCompleteness: readString(data, "evidenceCompleteness"),
      uncertainty: readString(data, "uncertainty"),
      mandatoryHumanReasons: readList(data, "mandatoryHumanReasons"),
      ...(readDate(data, "dueAt") ? { dueAt: readDate(data, "dueAt") } : {}),
    } as Omit<TriageCasePayload, "idempotencyKey">;
    mutation.mutate({ ...body, idempotencyKey: getIdempotencyKey(body) });
  }

  return (
    <ActionForm
      heading="Triage case"
      submitLabel="Save triage"
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      onSubmit={submit}
    >
      <SelectField
        name="severity"
        label="Severity"
        values={["P0", "P1", "P2", "P3", "P4"]}
      />
      <SelectField
        name="evidenceCompleteness"
        label="Evidence completeness"
        values={[
          "UNKNOWN",
          "COMPLETE",
          "PARTIAL",
          "UNAVAILABLE",
          "CONFLICTING",
        ]}
      />
      <SelectField
        name="uncertainty"
        label="Uncertainty"
        values={["UNKNOWN", "LOW", "MEDIUM", "HIGH"]}
      />
      <TextField
        name="mandatoryHumanReasons"
        label="Human review reasons"
        hint="Comma-separated reason codes; leave blank if none."
      />
      <TextField
        name="dueAt"
        label="Due at"
        type="datetime-local"
        required={false}
      />
      <CommandFields assessmentId={assessmentId} />
    </ActionForm>
  );
}

function InformationRequestForm({
  assessmentId,
  caseId,
  reports,
}: {
  assessmentId: string | null;
  caseId: string;
  reports: OperatorCaseDetail["reports"];
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const mutation = useMutation({
    mutationFn: (payload: RequestInformationPayload) =>
      OperatorApi.requestInformation(caseId, payload),
    onSuccess: () => invalidateCase(queryClient, caseId),
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const command = readCommandBody(data, assessmentId);
    const body = {
      ...command,
      reportId: readString(data, "reportId"),
      templateCode: readString(data, "templateCode"),
      expiresAt: readDate(data, "expiresAt"),
    } as Omit<RequestInformationPayload, "idempotencyKey">;
    mutation.mutate({ ...body, idempotencyKey: getIdempotencyKey(body) });
  }

  return (
    <ActionForm
      heading="Request more information"
      submitLabel="Send request"
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      onSubmit={submit}
    >
      <ReportField reports={reports} />
      <SelectField
        name="templateCode"
        label="Request template"
        values={[
          "MORE_CONTEXT",
          "WHEN_AND_WHERE",
          "WHO_WAS_INVOLVED",
          "WHAT_HAPPENED_NEXT",
          "SAFETY_CONCERN_DETAILS",
        ]}
      />
      <TextField
        name="expiresAt"
        label="Reply deadline"
        type="datetime-local"
      />
      <CommandFields assessmentId={assessmentId} />
    </ActionForm>
  );
}

function ActionForm({
  children,
  heading,
  isError,
  isPending,
  isSuccess,
  onSubmit,
  submitLabel,
}: {
  children: ReactNode;
  heading: string;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
}) {
  return (
    <form
      className="grid gap-3 border-border border-b pb-5 last:border-b-0 last:pb-0"
      onSubmit={onSubmit}
    >
      <h3 className="font-semibold text-ink text-sm">{heading}</h3>
      {children}
      {isError ? (
        <p className="text-destructive text-xs" role="alert">
          The command was not accepted. Check your access, step-up, and command
          fields.
        </p>
      ) : null}
      {isSuccess ? (
        <p className="text-primary text-xs" role="status">
          Command accepted.
        </p>
      ) : null}
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        loading={isPending}
        className="w-fit"
      >
        {submitLabel}
      </Button>
    </form>
  );
}

function CommandFields({ assessmentId }: { assessmentId: string | null }) {
  const rationaleId = useId();
  return (
    <>
      {assessmentId ? <AssessmentDispositionField /> : null}
      <TextField
        name="reasonCode"
        label="Reason code"
        placeholder="POLICY_REASON"
      />
      <TextField
        name="policyCodes"
        label="Policy codes"
        hint="Comma-separated; leave blank if none."
        required={false}
      />
      <TextField name="policyVersion" label="Policy version" />
      <label
        htmlFor={rationaleId}
        className="grid gap-1 font-semibold text-ink text-xs"
      >
        Rationale (optional)
        <Textarea id={rationaleId} name="rationale" maxLength={1000} rows={3} />
      </label>
    </>
  );
}

function TextField({
  hint,
  label,
  name,
  required = true,
  type = "text",
  placeholder,
}: {
  hint?: string;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="grid gap-1 font-semibold text-ink text-xs">
      {label}
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
      {hint ? (
        <span className="font-normal text-slate-muted">{hint}</span>
      ) : null}
    </label>
  );
}

function SelectField({
  label,
  name,
  values,
}: {
  label: string;
  name: string;
  values: string[];
}) {
  return (
    <label className="grid gap-1 font-semibold text-ink text-xs">
      {label}
      <select
        name={name}
        required
        className="h-11 rounded-lg border border-border bg-input px-3 text-ink text-sm"
      >
        {values.map((value) => (
          <option key={value} value={value}>
            {value.toLowerCase().replaceAll("_", " ")}
          </option>
        ))}
      </select>
    </label>
  );
}

function readCommandBody(
  data: FormData,
  assessmentId: string | null,
): CommandBody {
  const rationale = readString(data, "rationale").trim();
  const assistanceDisposition = assessmentId
    ? operatorAssistanceDispositionSchema.parse(
        readString(data, "assistanceDisposition"),
      )
    : undefined;
  return {
    ...(assessmentId && assistanceDisposition
      ? { assessmentId, assistanceDisposition }
      : {}),
    reasonCode: readString(data, "reasonCode").trim().toUpperCase(),
    policyCodes: readList(data, "policyCodes"),
    policyVersion: readString(data, "policyVersion").trim(),
    ...(rationale ? { rationale } : {}),
  };
}

function AssessmentDispositionField() {
  return (
    <label className="grid gap-1 font-semibold text-ink text-xs">
      How did the latest assessment inform this decision?
      <select
        name="assistanceDisposition"
        required
        className="h-11 rounded-lg border border-border bg-input px-3 text-ink text-sm"
      >
        <option value="">Choose one</option>
        <option value="FOLLOWED">I followed its suggestion</option>
        <option value="CHANGED">I made a different decision</option>
        <option value="NOT_USED">I did not use it</option>
      </select>
      <span className="font-normal text-slate-muted">
        Applies to the latest completed assessment shown in this case.
      </span>
    </label>
  );
}

function ReportField({ reports }: { reports: OperatorCaseDetail["reports"] }) {
  const sortedReports = [...reports].sort((left, right) =>
    right.report.submittedAt.localeCompare(left.report.submittedAt),
  );

  return (
    <label className="grid gap-1 font-semibold text-ink text-xs">
      Report to reply to
      <select
        name="reportId"
        required
        className="h-11 rounded-lg border border-border bg-input px-3 text-ink text-sm"
      >
        {sortedReports.map(({ report }) => (
          <option key={report.id} value={report.id}>
            {report.referenceCode} · {humanizeCode(report.category)} ·{" "}
            {formatOperatorDate(report.submittedAt)}
          </option>
        ))}
      </select>
      <span className="font-normal text-slate-muted">
        The request is sent only to the person who submitted this report.
      </span>
    </label>
  );
}

function getLatestAssessmentId(
  assessments: Array<{ id: string; createdAt: string }>,
) {
  return (
    assessments.reduce<(typeof assessments)[number] | null>(
      (latest, assessment) =>
        !latest || assessment.createdAt > latest.createdAt
          ? assessment
          : latest,
      null,
    )?.id ?? null
  );
}

function readList(data: FormData, name: string) {
  return readString(data, name)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function readDate(data: FormData, name: string) {
  const value = readString(data, name);
  return value ? new Date(value).toISOString() : "";
}

function readString(data: FormData, name: string) {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

function invalidateCase(
  queryClient: ReturnType<typeof useQueryClient>,
  caseId: string,
) {
  void Promise.all([
    queryClient.invalidateQueries({
      queryKey: OPERATOR_QUERY_KEYS.case(caseId),
    }),
    queryClient.invalidateQueries({ queryKey: OPERATOR_QUERY_KEYS.all }),
  ]);
}
