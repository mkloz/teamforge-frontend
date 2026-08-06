import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileCheck2, FlaskConical, ShieldX } from "lucide-react";
import { useRef, useState } from "react";

import { controlErrorMessage } from "@/features/admin/components/moderation-configuration-actions";
import { ModerationControlConfirmation } from "@/features/admin/components/moderation-control-confirmation";
import {
  type OperatorModerationConfigurationDetail,
  type OperatorModerationEvaluationApproval,
  type OperatorModerationEvaluationRun,
  operatorControlMutations,
  operatorModerationEvaluationRunPayloadSchema,
} from "@/features/operator/public/operator-governance";
import { Button } from "@/shared/components/ui/button";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";
import { Textarea } from "@/shared/components/ui/textarea";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

interface ModerationEvaluationEvidenceProps {
  approval: OperatorModerationEvaluationApproval | null;
  approvalError: boolean;
  approvalLoading: boolean;
  commandsEnabled: boolean;
  configuration: OperatorModerationConfigurationDetail;
  onApprovalRetry: () => void;
  onCommandError: (error: unknown) => void;
}

export function ModerationEvaluationEvidence({
  approval,
  approvalError,
  approvalLoading,
  commandsEnabled,
  configuration,
  onApprovalRetry,
  onCommandError,
}: ModerationEvaluationEvidenceProps) {
  const queryClient = useQueryClient();
  const [runJson, setRunJson] = useState("");
  const [completedAt, setCompletedAt] = useState("");
  const [runId, setRunId] = useState(approval?.runId ?? "");
  const [approvalExpiresAt, setApprovalExpiresAt] = useState("");
  const [runError, setRunError] = useState<string | null>(null);
  const [recordedRun, setRecordedRun] =
    useState<OperatorModerationEvaluationRun | null>(null);
  const [approveOpen, setApproveOpen] = useState(false);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const recordKey = useRef<string | null>(null);
  const approvalKey = useRef<string | null>(null);
  const revocationKey = useRef<string | null>(null);
  const recordRun = useMutation(
    operatorControlMutations.recordEvaluationRun(configuration.id, {
      onError: onCommandError,
      queryClient,
    }),
  );
  const approveRun = useMutation(
    operatorControlMutations.approveEvaluationRun(runId || "run-not-selected", {
      onError: onCommandError,
      queryClient,
    }),
  );
  const revokeApproval = useMutation(
    operatorControlMutations.revokeEvaluationApproval(configuration.id, {
      onError: onCommandError,
      queryClient,
    }),
  );

  function submitRun() {
    if (!commandsEnabled) return;

    try {
      const parsed = operatorModerationEvaluationRunPayloadSchema.safeParse(
        JSON.parse(runJson),
      );
      if (!parsed.success) {
        setRunError(
          parsed.error.issues[0]?.message ??
            "The evaluation result does not follow the saved-result contract.",
        );
        return;
      }
      if (!completedAt) {
        setRunError("Add the time when this evaluation finished.");
        return;
      }

      setRunError(null);
      recordKey.current ??= globalThis.crypto.randomUUID();
      recordRun.mutate(
        {
          completedAt: new Date(completedAt).toISOString(),
          idempotencyKey: recordKey.current,
          reasonCode: "MODERATION_EVALUATION_RECORD",
          run: parsed.data,
        },
        {
          onSuccess: (result) => {
            recordKey.current = null;
            setRecordedRun(result);
            setRunId(result.id);
          },
        },
      );
    } catch {
      setRunError("The evaluation result is not valid JSON.");
    }
  }

  return (
    <section
      aria-labelledby="evaluation-evidence-heading"
      className="grid gap-6 pt-2"
    >
      <div className="grid gap-1">
        <h2
          id="evaluation-evidence-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <FlaskConical className="size-4 shrink-0" aria-hidden="true" />
          <span>Evaluation evidence</span>
        </h2>
        <p className="max-w-3xl text-slate-muted text-sm leading-relaxed">
          {commandsEnabled
            ? "Record a completed saved-result run, then approve that exact run for this policy version. This page does not call a moderation provider."
            : "Review saved evaluation evidence and the approval tied to this policy version. These controls are read-only."}
        </p>
      </div>

      {approvalLoading ? (
        <div role="status" aria-label="Loading evaluation approval">
          <Skeleton className="h-32 rounded-2xl" aria-hidden="true" />
        </div>
      ) : approvalError ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-card px-5 py-4">
          <p className="text-slate-muted text-sm">
            Approval evidence could not be loaded. Its current status is
            unknown.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onApprovalRetry}
          >
            Try again
          </Button>
        </div>
      ) : approval ? (
        <ApprovalSummary approval={approval} />
      ) : (
        <div className="flex items-start gap-3 rounded-xl bg-card px-5 py-4">
          <ShieldX
            className="mt-0.5 size-5 shrink-0 text-slate-muted"
            aria-hidden="true"
          />
          <div className="grid gap-1">
            <h3 className="font-semibold text-ink text-sm">
              No current approval
            </h3>
            <p className="text-slate-muted text-sm">
              Automatic release remains blocked until an eligible run is
              explicitly approved.
            </p>
          </div>
        </div>
      )}

      <CollapsibleSection
        variant="card"
        summary={
          commandsEnabled
            ? "Record a saved evaluation result"
            : "View evaluation result fields"
        }
        triggerClassName="px-5 py-4"
        contentClassName="px-5 pb-5"
      >
        <div className="mt-4 grid gap-4">
          <Field className="max-w-sm gap-1.5">
            <FieldLabel
              htmlFor="moderation-evaluation-completed-at"
              className="font-semibold text-ink"
            >
              Completed at
            </FieldLabel>
            <Input
              id="moderation-evaluation-completed-at"
              readOnly={!commandsEnabled || recordRun.isPending}
              type="datetime-local"
              value={completedAt}
              onChange={(event) => {
                setCompletedAt(event.target.value);
                setRunError(null);
                recordKey.current = null;
                recordRun.reset();
              }}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel
              htmlFor="moderation-evaluation-result"
              className="font-semibold text-ink"
            >
              Saved result JSON
            </FieldLabel>
            <Textarea
              id="moderation-evaluation-result"
              className="min-h-64 font-mono text-xs leading-relaxed"
              readOnly={!commandsEnabled || recordRun.isPending}
              spellCheck={false}
              value={runJson}
              onChange={(event) => {
                setRunJson(event.target.value);
                setRunError(null);
                recordKey.current = null;
                recordRun.reset();
              }}
              placeholder="Paste the completed full-pipeline result"
            />
          </Field>
          {runError ? (
            <p className="text-destructive text-sm" role="alert">
              {runError}
            </p>
          ) : recordRun.isError ? (
            <p className="text-destructive text-sm" role="alert">
              {controlErrorMessage(recordRun.error)}
            </p>
          ) : null}
          <Button
            type="button"
            className="w-fit"
            variant="outline"
            disabled={!commandsEnabled || recordRun.isPending}
            loading={recordRun.isPending}
            onClick={submitRun}
          >
            <FileCheck2 className="size-4" aria-hidden="true" />
            Record evaluation
          </Button>
        </div>
      </CollapsibleSection>

      {recordedRun ? <RecordedRunSummary run={recordedRun} /> : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="grid content-start gap-3">
          <div className="grid gap-1">
            <h3 className="font-semibold text-ink text-sm">
              {commandsEnabled
                ? "Approve an exact run"
                : "Review approval inputs"}
            </h3>
            <p className="text-slate-muted text-xs leading-relaxed">
              Use the ID returned after recording, or an existing saved run ID.
            </p>
          </div>
          <Field className="gap-1.5">
            <FieldLabel
              htmlFor="moderation-evaluation-run-id"
              className="font-semibold text-ink"
            >
              Evaluation run ID
            </FieldLabel>
            <Input
              id="moderation-evaluation-run-id"
              readOnly={!commandsEnabled || approveRun.isPending}
              value={runId}
              onChange={(event) => {
                setRunId(event.target.value);
                approvalKey.current = null;
              }}
            />
          </Field>
          <Field className="gap-1.5">
            <FieldLabel
              htmlFor="moderation-approval-expiry"
              className="font-semibold text-ink"
            >
              Approval expiry
              <span className="font-normal text-slate-muted">Optional</span>
            </FieldLabel>
            <Input
              id="moderation-approval-expiry"
              readOnly={!commandsEnabled || approveRun.isPending}
              type="datetime-local"
              value={approvalExpiresAt}
              onChange={(event) => {
                setApprovalExpiresAt(event.target.value);
                approvalKey.current = null;
              }}
            />
          </Field>
          <ModerationControlConfirmation
            actionLabel="Approve exact run"
            description="Approval is bound to this run's configuration, corpus, provider models, prompt, policy, schema, thresholds, and result hashes. A mismatch is rejected."
            disabled={!commandsEnabled || runId.trim().length === 0}
            errorMessage={controlErrorMessage(approveRun.error)}
            loading={approveRun.isPending}
            onConfirm={() => {
              if (!commandsEnabled) return;

              approvalKey.current ??= globalThis.crypto.randomUUID();
              approveRun.mutate(
                {
                  expiresAt: approvalExpiresAt
                    ? new Date(approvalExpiresAt).toISOString()
                    : null,
                  idempotencyKey: approvalKey.current,
                  reasonCode: "MODERATION_EVALUATION_APPROVE",
                },
                {
                  onSuccess: () => {
                    approvalKey.current = null;
                    setApproveOpen(false);
                  },
                },
              );
            }}
            onOpenChange={(open) => {
              if (!approveRun.isPending) {
                approveRun.reset();
                if (!open) approvalKey.current = null;
                setApproveOpen(open);
              }
            }}
            open={approveOpen}
            title="Approve this evaluation run?"
          >
            <Button
              type="button"
              className="w-fit"
              disabled={!commandsEnabled || runId.trim().length === 0}
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Approve run
            </Button>
          </ModerationControlConfirmation>
        </div>

        <div className="grid content-start gap-3 lg:pl-2">
          <div className="grid gap-1">
            <h3 className="font-semibold text-ink text-sm">Revoke approval</h3>
            <p className="text-slate-muted text-xs leading-relaxed">
              Revocation stops this approval from authorizing a release. The
              audit record remains.
            </p>
          </div>
          {approval ? (
            <ModerationControlConfirmation
              actionLabel="Revoke approval"
              description={`Run ${approval.runId} will no longer authorize automatic release for this configuration. The approval history remains available to the server audit trail.`}
              disabled={!commandsEnabled}
              errorMessage={controlErrorMessage(revokeApproval.error)}
              loading={revokeApproval.isPending}
              onConfirm={() => {
                if (!commandsEnabled) return;

                revocationKey.current ??= globalThis.crypto.randomUUID();
                revokeApproval.mutate(
                  {
                    idempotencyKey: revocationKey.current,
                    reasonCode: "MODERATION_EVALUATION_REVOKE",
                  },
                  {
                    onSuccess: () => {
                      revocationKey.current = null;
                      setRevokeOpen(false);
                    },
                  },
                );
              }}
              onOpenChange={(open) => {
                if (!revokeApproval.isPending) {
                  revokeApproval.reset();
                  if (!open) revocationKey.current = null;
                  setRevokeOpen(open);
                }
              }}
              open={revokeOpen}
              title="Revoke this approval?"
              tone="destructive"
            >
              <Button
                type="button"
                variant="outline"
                className="w-fit text-destructive"
                disabled={!commandsEnabled}
              >
                <ShieldX className="size-4" aria-hidden="true" />
                Revoke approval
              </Button>
            </ModerationControlConfirmation>
          ) : (
            <p className="text-slate-muted text-sm">
              There is no approval to revoke.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

function ApprovalSummary({
  approval,
}: {
  approval: OperatorModerationEvaluationApproval;
}) {
  return (
    <div className="grid gap-4 rounded-xl bg-card px-5 py-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h3 className="font-semibold text-ink text-sm">Exact run approved</h3>
          <p className="text-slate-muted text-xs">
            Approved {DATE_TIME_FORMATTER.format(new Date(approval.approvedAt))}
          </p>
        </div>
        <StatusPill size="xs" tone="teal">
          Release evidence current
        </StatusPill>
      </div>
      <dl className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
        <EvaluationFact label="Run" value={approval.runId} />
        <EvaluationFact label="Corpus" value={approval.corpusVersion} />
        <EvaluationFact label="Policy" value={approval.policyVersion} />
        <EvaluationFact
          label="Moderation model"
          value={approval.moderationModel}
        />
        <EvaluationFact
          label="Assessment model"
          value={approval.assessmentModel}
        />
        <EvaluationFact
          label="Expires"
          value={
            approval.expiresAt
              ? DATE_TIME_FORMATTER.format(new Date(approval.expiresAt))
              : "No expiry"
          }
        />
      </dl>
    </div>
  );
}

function RecordedRunSummary({ run }: { run: OperatorModerationEvaluationRun }) {
  return (
    <div className="grid gap-3 rounded-xl bg-card px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold text-ink text-sm">Recorded run</h3>
        <StatusPill size="xs" tone={run.eligibleForAutonomy ? "teal" : "amber"}>
          {run.eligibleForAutonomy
            ? "Eligible for approval"
            : "Release checks failed"}
        </StatusPill>
      </div>
      <p className="break-all text-slate-muted text-xs">{run.id}</p>
      <p className="text-slate-muted text-sm">
        {run.completedResultCount} of {run.expectedCaseCount} cases completed;{" "}
        {run.missingResultCount} missing.
      </p>
      {run.eligibilityFailureCodes.length > 0 ? (
        <ul className="grid gap-1 text-destructive text-xs">
          {run.eligibilityFailureCodes.map((code) => (
            <li key={code}>{humanizeCode(code)}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function EvaluationFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-0.5 py-1">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word text-ink text-sm">{value}</dd>
    </div>
  );
}

function humanizeCode(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
