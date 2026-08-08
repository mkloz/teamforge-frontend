import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { FormEvent, ReactNode } from "react";
import { useId, useRef, useState } from "react";
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
import {
  operatorCommandSchema,
  requestInformationSchema,
  triageCaseSchema,
} from "@/features/operator/schemas/operator.schemas";
import { Button } from "@/shared/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/shared/components/ui/native-select";
import { Textarea } from "@/shared/components/ui/textarea";

type CommandBodyInput = Omit<
  OperatorCommand,
  "assistanceDisposition" | "idempotencyKey"
> & {
  assistanceDisposition?: string;
};

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
  commandsEnabled,
  item,
  onCommandError,
  session,
}: {
  commandsEnabled: boolean;
  item: OperatorCaseDetail;
  onCommandError: (error: unknown) => void;
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
          <TriageForm
            assessmentId={latestAssessmentId}
            caseId={item.id}
            commandsEnabled={commandsEnabled}
            onCommandError={onCommandError}
          />
        ) : null}
        {canEscalate && canMoveToEscalation ? (
          <CommandForm
            caseId={item.id}
            assessmentId={latestAssessmentId}
            heading="Escalate case"
            submitLabel="Escalate"
            commandsEnabled={commandsEnabled}
            execute={(payload) => OperatorApi.escalate(item.id, payload)}
            onCommandError={onCommandError}
          />
        ) : null}
        {canModerate && item.status === "TRIAGING" ? (
          item.reports.length > 0 ? (
            <InformationRequestForm
              assessmentId={latestAssessmentId}
              caseId={item.id}
              commandsEnabled={commandsEnabled}
              onCommandError={onCommandError}
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
                  commandsEnabled={commandsEnabled}
                  execute={(payload) =>
                    OperatorApi.reverseEnforcement(item.id, action.id, payload)
                  }
                  onCommandError={onCommandError}
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
  commandsEnabled,
  execute,
  heading,
  onCommandError,
  submitLabel,
}: {
  assessmentId: string | null;
  caseId: string;
  children?: ReactNode;
  commandsEnabled: boolean;
  execute: (payload: OperatorCommand) => Promise<unknown>;
  heading: string;
  onCommandError: (error: unknown) => void;
  submitLabel: string;
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const [validationError, setValidationError] = useState(false);
  const mutation = useMutation({
    mutationKey: ["admin", "operator", "moderation", "command", caseId],
    mutationFn: execute,
    onSuccess: () => invalidateCase(queryClient, caseId),
    onError: onCommandError,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.reset();
    const body = readCommandBody(
      new FormData(event.currentTarget),
      assessmentId,
    );
    const result = operatorCommandSchema.safeParse({
      ...body,
      idempotencyKey: getIdempotencyKey(body),
    });
    if (!result.success) {
      setValidationError(true);
      return;
    }

    setValidationError(false);
    mutation.mutate(result.data);
  }

  return (
    <ActionForm
      heading={heading}
      submitLabel={submitLabel}
      commandsEnabled={commandsEnabled}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      validationError={validationError}
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
  commandsEnabled,
  onCommandError,
}: {
  assessmentId: string | null;
  caseId: string;
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const [validationError, setValidationError] = useState(false);
  const mutation = useMutation({
    mutationKey: ["admin", "operator", "moderation", "triage", caseId],
    mutationFn: (payload: TriageCasePayload) =>
      OperatorApi.triage(caseId, payload),
    onSuccess: () => invalidateCase(queryClient, caseId),
    onError: onCommandError,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.reset();
    const data = new FormData(event.currentTarget);
    const body = {
      ...readCommandBody(data, assessmentId),
      severity: readString(data, "severity"),
      evidenceCompleteness: readString(data, "evidenceCompleteness"),
      uncertainty: readString(data, "uncertainty"),
      mandatoryHumanReasons: readList(data, "mandatoryHumanReasons"),
      ...(readDate(data, "dueAt") ? { dueAt: readDate(data, "dueAt") } : {}),
    };
    const result = triageCaseSchema.safeParse({
      ...body,
      idempotencyKey: getIdempotencyKey(body),
    });
    if (!result.success) {
      setValidationError(true);
      return;
    }

    setValidationError(false);
    mutation.mutate(result.data);
  }

  return (
    <ActionForm
      heading="Triage case"
      submitLabel="Save triage"
      commandsEnabled={commandsEnabled}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      validationError={validationError}
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
  commandsEnabled,
  onCommandError,
  reports,
}: {
  assessmentId: string | null;
  caseId: string;
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
  reports: OperatorCaseDetail["reports"];
}) {
  const queryClient = useQueryClient();
  const getIdempotencyKey = usePayloadIdempotencyKey();
  const [validationError, setValidationError] = useState(false);
  const mutation = useMutation({
    mutationKey: [
      "admin",
      "operator",
      "moderation",
      "information-request",
      caseId,
    ],
    mutationFn: (payload: RequestInformationPayload) =>
      OperatorApi.requestInformation(caseId, payload),
    onSuccess: () => invalidateCase(queryClient, caseId),
    onError: onCommandError,
  });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.reset();
    const data = new FormData(event.currentTarget);
    const command = readCommandBody(data, assessmentId);
    const body = {
      ...command,
      reportId: readString(data, "reportId"),
      templateCode: readString(data, "templateCode"),
      expiresAt: readDate(data, "expiresAt"),
    };
    const result = requestInformationSchema.safeParse({
      ...body,
      idempotencyKey: getIdempotencyKey(body),
    });
    if (!result.success) {
      setValidationError(true);
      return;
    }

    setValidationError(false);
    mutation.mutate(result.data);
  }

  return (
    <ActionForm
      heading="Request more information"
      submitLabel="Send request"
      commandsEnabled={commandsEnabled}
      isPending={mutation.isPending}
      isSuccess={mutation.isSuccess}
      isError={mutation.isError}
      validationError={validationError}
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
  commandsEnabled,
  heading,
  isError,
  isPending,
  isSuccess,
  onSubmit,
  submitLabel,
  validationError,
}: {
  children: ReactNode;
  commandsEnabled: boolean;
  heading: string;
  isError: boolean;
  isPending: boolean;
  isSuccess: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  validationError: boolean;
}) {
  return (
    <form
      className="grid gap-3 rounded-xl bg-card p-4"
      onSubmit={(event) => {
        if (!commandsEnabled) {
          event.preventDefault();
          return;
        }
        onSubmit(event);
      }}
    >
      <h3 className="font-semibold text-ink text-sm">{heading}</h3>
      <fieldset className="contents" disabled={!commandsEnabled || isPending}>
        {children}
      </fieldset>
      {validationError ? (
        <p className="text-destructive text-xs" role="alert">
          Check the command fields and use valid reason and policy codes.
        </p>
      ) : null}
      {isError ? (
        <p className="text-destructive text-xs" role="alert">
          The command was not accepted. Check your access, sign in again if
          asked, and review the command fields.
        </p>
      ) : null}
      {isSuccess ? (
        <p className="text-foreground text-xs" role="status">
          Command accepted.
        </p>
      ) : null}
      <Button
        type="submit"
        size="sm"
        disabled={!commandsEnabled || isPending}
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
      <Field className="gap-1">
        <FieldLabel
          htmlFor={rationaleId}
          className="font-semibold text-ink text-xs"
        >
          Rationale (optional)
        </FieldLabel>
        <Textarea id={rationaleId} name="rationale" maxLength={1000} rows={3} />
      </Field>
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
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="font-semibold text-ink text-xs">
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
      />
      {hint ? (
        <FieldDescription className="font-normal text-slate-muted text-xs">
          {hint}
        </FieldDescription>
      ) : null}
    </Field>
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
  const id = useId();

  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="font-semibold text-ink text-xs">
        {label}
      </FieldLabel>
      <NativeSelect id={id} name={name} required>
        {values.map((value) => (
          <NativeSelectOption key={value} value={value}>
            {value.toLowerCase().replaceAll("_", " ")}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    </Field>
  );
}

function readCommandBody(
  data: FormData,
  assessmentId: string | null,
): CommandBodyInput {
  const rationale = readString(data, "rationale").trim();
  const assistanceDisposition = assessmentId
    ? readString(data, "assistanceDisposition")
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
  const id = useId();

  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="font-semibold text-ink text-xs">
        How did the latest assessment inform this decision?
      </FieldLabel>
      <NativeSelect id={id} name="assistanceDisposition" required>
        <NativeSelectOption value="">Choose one</NativeSelectOption>
        <NativeSelectOption value="FOLLOWED">
          I followed its suggestion
        </NativeSelectOption>
        <NativeSelectOption value="CHANGED">
          I made a different decision
        </NativeSelectOption>
        <NativeSelectOption value="NOT_USED">
          I did not use it
        </NativeSelectOption>
      </NativeSelect>
      <FieldDescription className="font-normal text-slate-muted text-xs">
        Applies to the latest completed assessment shown in this case.
      </FieldDescription>
    </Field>
  );
}

function ReportField({ reports }: { reports: OperatorCaseDetail["reports"] }) {
  const id = useId();
  const sortedReports = [...reports].sort((left, right) =>
    right.report.submittedAt.localeCompare(left.report.submittedAt),
  );

  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="font-semibold text-ink text-xs">
        Report to reply to
      </FieldLabel>
      <NativeSelect id={id} name="reportId" required>
        {sortedReports.map(({ report }) => (
          <NativeSelectOption key={report.id} value={report.id}>
            {report.referenceCode} · {humanizeCode(report.category)} ·{" "}
            {formatOperatorDate(report.submittedAt)}
          </NativeSelectOption>
        ))}
      </NativeSelect>
      <FieldDescription className="font-normal text-slate-muted text-xs">
        The request is sent only to the person who submitted this report.
      </FieldDescription>
    </Field>
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
  if (!value) return "";

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? value : new Date(timestamp).toISOString();
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
