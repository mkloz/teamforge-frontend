import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, RefreshCw, ShieldOff } from "lucide-react";
import { useEffect, useState } from "react";

import { ModerationConfigurationActions } from "@/features/admin/components/moderation-configuration-actions";
import { ModerationConfigurationEditor } from "@/features/admin/components/moderation-configuration-editor";
import { ModerationEvaluationEvidence } from "@/features/admin/components/moderation-evaluation-evidence";
import { moderationConfigurationPayload } from "@/features/admin/lib/moderation-configuration";
import {
  getOperatorControlErrorKind,
  type OperatorModerationConfigurationDetail,
  type OperatorModerationConfigurationState,
  type OperatorModerationConfigurationSummary,
  type OperatorModerationEvaluationApproval,
  operatorGovernanceQueries,
} from "@/features/operator/public/operator-governance";
import { Button } from "@/shared/components/ui/button";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

interface AdminModerationGovernanceProps {
  canManage: boolean;
  stepUpExpiresAt: string | null;
}

export function AdminModerationGovernance({
  canManage,
  stepUpExpiresAt,
}: AdminModerationGovernanceProps) {
  const versionsQuery = useQuery(
    operatorGovernanceQueries.configurationVersions(),
  );
  const stateQuery = useQuery(operatorGovernanceQueries.configurationState());
  const draftTemplateQuery = useQuery(
    operatorGovernanceQueries.configurationDraftTemplate(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [serverRejectedStepUp, setServerRejectedStepUp] = useState(false);
  const commandsEnabled =
    useCurrentStepUp(stepUpExpiresAt) && canManage && !serverRejectedStepUp;
  const handleCommandError = (error: unknown) => {
    if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
      setServerRejectedStepUp(true);
    }
  };

  const resolvedSelectedId =
    selectedId ??
    stateQuery.data?.activeConfigurationId ??
    versionsQuery.data?.[0]?.id ??
    null;
  const detailQuery = useQuery({
    ...operatorGovernanceQueries.configurationDetail(
      resolvedSelectedId ?? "configuration-not-selected",
    ),
    enabled: resolvedSelectedId !== null,
  });
  const approvalQuery = useQuery({
    ...operatorGovernanceQueries.evaluationApproval(
      resolvedSelectedId ?? "configuration-not-selected",
    ),
    enabled: resolvedSelectedId !== null,
  });

  if (versionsQuery.isPending || stateQuery.isPending) {
    return <GovernanceLoading />;
  }

  if (versionsQuery.isError || stateQuery.isError) {
    return (
      <GovernanceLoadError
        onRetry={() => {
          void versionsQuery.refetch();
          void stateQuery.refetch();
        }}
      />
    );
  }

  const versions = versionsQuery.data;
  const state = stateQuery.data;
  const selectedSummary = versions.find(
    (version) => version.id === resolvedSelectedId,
  );

  return (
    <div className="grid gap-8">
      {!canManage ? (
        <GovernanceAccessNotice />
      ) : !commandsEnabled ? (
        <GovernanceStepUpNotice />
      ) : null}

      <ConfigurationStateSummary
        state={state}
        active={versions.find(
          (version) => version.id === state.activeConfigurationId,
        )}
      />

      <section
        aria-labelledby="configuration-history-heading"
        className="grid gap-4 border-border border-t pt-6"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <h2
              id="configuration-history-heading"
              className="font-semibold text-base text-ink"
            >
              Version history
            </h2>
            <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
              Earlier versions stay available for review. Restoring one creates
              a new version instead of changing the record.
            </p>
          </div>
          {versions.length > 0 ? (
            <label className="grid min-w-56 gap-1 text-slate-muted text-xs">
              Version to inspect
              <select
                className="h-10 rounded-xl border border-border bg-input px-3 font-medium text-foreground text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                value={resolvedSelectedId ?? ""}
                onChange={(event) => setSelectedId(event.target.value)}
              >
                {versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    Version {version.version} · {formatStatus(version.status)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>

        {versions.length === 0 ? (
          <div className="grid gap-6">
            <p className="border-border border-y py-5 text-slate-muted text-sm">
              No server configuration has been recorded yet. Start with the
              server's safe observe-only template.
            </p>
            {draftTemplateQuery.isPending ? (
              <ConfigurationDetailLoading />
            ) : draftTemplateQuery.isError || !draftTemplateQuery.data ? (
              <DraftTemplateError
                onRetry={() => void draftTemplateQuery.refetch()}
              />
            ) : (
              <ModerationConfigurationEditor
                commandsEnabled={commandsEnabled}
                onCommandError={handleCommandError}
                onCreated={setSelectedId}
                source={draftTemplateQuery.data}
                sourceLabel="the server's safe template"
              />
            )}
          </div>
        ) : detailQuery.isPending ? (
          <ConfigurationDetailLoading />
        ) : detailQuery.isError || !detailQuery.data || !selectedSummary ? (
          <ConfigurationDetailError
            onRetry={() => void detailQuery.refetch()}
          />
        ) : (
          <ConfigurationWorkspace
            approval={approvalQuery.data ?? null}
            approvalError={approvalQuery.isError}
            approvalLoading={approvalQuery.isPending}
            commandsEnabled={commandsEnabled}
            configuration={detailQuery.data}
            onApprovalRetry={() => void approvalQuery.refetch()}
            onCommandError={handleCommandError}
            onCreated={setSelectedId}
            state={state}
          />
        )}
      </section>
    </div>
  );
}

function ConfigurationWorkspace({
  approval,
  approvalError,
  approvalLoading,
  commandsEnabled,
  configuration,
  onApprovalRetry,
  onCommandError,
  onCreated,
  state,
}: {
  approval: OperatorModerationEvaluationApproval | null;
  approvalError: boolean;
  approvalLoading: boolean;
  commandsEnabled: boolean;
  configuration: OperatorModerationConfigurationDetail;
  onApprovalRetry: () => void;
  onCommandError: (error: unknown) => void;
  onCreated: (configurationId: string) => void;
  state: OperatorModerationConfigurationState;
}) {
  return (
    <div className="grid gap-8">
      <ConfigurationDetail configuration={configuration} />
      <ModerationConfigurationActions
        commandsEnabled={commandsEnabled}
        configuration={configuration}
        onCommandError={onCommandError}
        state={state}
      />
      <ModerationConfigurationEditor
        key={configuration.id}
        commandsEnabled={commandsEnabled}
        onCommandError={onCommandError}
        onCreated={onCreated}
        source={moderationConfigurationPayload(configuration)}
        sourceLabel={`version ${configuration.version}`}
      />
      <ModerationEvaluationEvidence
        key={configuration.id}
        approval={approval}
        approvalError={approvalError}
        approvalLoading={approvalLoading}
        commandsEnabled={commandsEnabled}
        configuration={configuration}
        onApprovalRetry={onApprovalRetry}
        onCommandError={onCommandError}
      />
    </div>
  );
}

function ConfigurationStateSummary({
  active,
  state,
}: {
  active?: OperatorModerationConfigurationSummary;
  state: OperatorModerationConfigurationState;
}) {
  return (
    <section
      aria-labelledby="active-configuration-heading"
      className="grid gap-4 border-border border-t pt-6"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2
            id="active-configuration-heading"
            className="font-semibold text-base text-ink"
          >
            Active configuration
          </h2>
          <p className="text-slate-muted text-sm">
            The version currently used by moderation workers.
          </p>
        </div>
        <StatusPill size="xs" tone={active ? "teal" : "amber"}>
          {active ? formatRollout(active.rolloutMode) : "No active version"}
        </StatusPill>
      </div>
      <dl className="grid gap-x-8 border-border border-y sm:grid-cols-3">
        <ConfigurationFact
          label="Version"
          value={active ? `Version ${active.version}` : "Not set"}
        />
        <ConfigurationFact
          label="Policy"
          value={active?.policyVersion ?? "Not set"}
        />
        <ConfigurationFact
          label="State revision"
          value={String(state.stateRowVersion)}
        />
      </dl>
    </section>
  );
}

function ConfigurationDetail({
  configuration,
}: {
  configuration: OperatorModerationConfigurationDetail;
}) {
  return (
    <section
      aria-labelledby="configuration-detail-heading"
      className="grid gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid gap-1">
          <h2
            id="configuration-detail-heading"
            className="font-semibold text-base text-ink"
          >
            Version {configuration.version}
          </h2>
          <p className="text-slate-muted text-sm">
            Created{" "}
            {DATE_TIME_FORMATTER.format(new Date(configuration.createdAt))}
          </p>
        </div>
        <StatusPill
          size="xs"
          tone={configuration.status === "ACTIVE" ? "teal" : "neutral"}
        >
          {formatStatus(configuration.status)}
        </StatusPill>
      </div>
      <dl className="grid gap-x-8 border-border border-y sm:grid-cols-2 lg:grid-cols-3">
        <ConfigurationFact
          label="Rollout"
          value={formatRollout(configuration.rolloutMode)}
        />
        <ConfigurationFact
          label="Moderation model"
          value={configuration.moderationModel}
        />
        <ConfigurationFact
          label="Assessment model"
          value={configuration.assessmentModel}
        />
        <ConfigurationFact label="Prompt" value={configuration.promptVersion} />
        <ConfigurationFact label="Schema" value={configuration.schemaVersion} />
        <ConfigurationFact
          label="Thresholds"
          value={configuration.thresholdVersion}
        />
      </dl>
      <details className="border-border border-b pb-4">
        <summary className="cursor-pointer font-semibold text-ink text-sm">
          View saved policy fields
        </summary>
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-input p-4 text-foreground text-xs leading-relaxed">
          {JSON.stringify(
            moderationConfigurationPayload(configuration),
            null,
            2,
          )}
        </pre>
      </details>
    </section>
  );
}

function ConfigurationFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 border-border border-t py-4 first:border-t-0 sm:[&:nth-child(2)]:border-t-0 lg:[&:nth-child(3)]:border-t-0">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word font-medium text-ink text-sm">{value}</dd>
    </div>
  );
}

function GovernanceLoading() {
  return (
    <div
      className="grid gap-5"
      role="status"
      aria-label="Loading moderation settings"
    >
      <Skeleton className="h-24 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
      <Skeleton className="h-48 rounded-2xl" />
    </div>
  );
}

function ConfigurationDetailLoading() {
  return (
    <div role="status" aria-label="Loading configuration details">
      <Skeleton className="h-64 rounded-2xl" aria-hidden="true" />
    </div>
  );
}

function GovernanceLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="grid justify-items-start gap-3 border-border border-y py-6">
      <div className="flex items-start gap-3">
        <AlertTriangle
          className="mt-0.5 size-5 text-accent"
          aria-hidden="true"
        />
        <div className="grid gap-1">
          <h2 className="font-semibold text-ink">
            Settings could not be loaded
          </h2>
          <p className="text-slate-muted text-sm">
            Your access may have ended, or the server may be unavailable. No
            configuration details were kept on this page.
          </p>
        </div>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}

function ConfigurationDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-border border-y py-5">
      <p className="text-slate-muted text-sm">
        This version changed or is no longer available. Refresh before taking
        action.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Refresh version
      </Button>
    </div>
  );
}

function DraftTemplateError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-border border-y py-5">
      <p className="text-slate-muted text-sm">
        The safe starting template could not be loaded. No draft has been
        created.
      </p>
      <Button type="button" variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="size-4" aria-hidden="true" />
        Try again
      </Button>
    </div>
  );
}

function GovernanceAccessNotice() {
  return (
    <div className="flex items-start gap-3 border-border border-y py-5">
      <ShieldOff
        className="mt-0.5 size-5 shrink-0 text-primary"
        aria-hidden="true"
      />
      <div className="grid gap-1">
        <h2 className="font-semibold text-ink text-sm">Read-only access</h2>
        <p className="text-slate-muted text-sm">
          You can inspect saved versions, but your current admin access cannot
          change them.
        </p>
      </div>
    </div>
  );
}

function GovernanceStepUpNotice() {
  return (
    <div className="flex items-start gap-3 border-accent/30 border-y bg-accent/8 py-5 text-amber-900 dark:text-amber-200">
      <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="grid gap-1">
        <h2 className="font-semibold text-sm">Recent sign-in required</h2>
        <p className="text-sm">
          The settings remain visible, but changes stay disabled until admin
          access is verified again.
        </p>
      </div>
    </div>
  );
}

function useCurrentStepUp(expiresAt: string | null) {
  const [checkedAt, setCheckedAt] = useState(() => Date.now());
  const expiresAtMs = expiresAt ? Date.parse(expiresAt) : Number.NaN;

  useEffect(() => {
    if (!Number.isFinite(expiresAtMs) || expiresAtMs <= checkedAt) {
      return undefined;
    }

    const delay = Math.min(Math.max(expiresAtMs - Date.now() + 50, 0), 60_000);
    const timeout = globalThis.setTimeout(
      () => setCheckedAt(Date.now()),
      delay,
    );
    return () => globalThis.clearTimeout(timeout);
  }, [checkedAt, expiresAtMs]);

  return Number.isFinite(expiresAtMs) && expiresAtMs > checkedAt;
}

function formatStatus(
  status: OperatorModerationConfigurationSummary["status"],
) {
  if (status === "DRAFT") return "Draft";
  if (status === "ACTIVE") return "Active";
  return "Retired";
}

function formatRollout(
  mode: OperatorModerationConfigurationSummary["rolloutMode"],
) {
  if (mode === "SHADOW") return "Observe only";
  if (mode === "APPROVAL") return "Human approval";
  if (mode === "AUTONOMOUS_LIMITED") return "Limited automatic safeguards";
  return "Automatic safeguards";
}
