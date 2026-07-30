import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  GitCompareArrows,
  History,
  type LucideIcon,
  RefreshCw,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { type ReactNode, useState } from "react";

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
import {
  OperatorReauthenticationDialog,
  useOperatorSessionStepUp,
} from "@/features/operator/public/use-operator-session-step-up";
import { Button } from "@/shared/components/ui/button";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { Notice } from "@/shared/components/ui/notice";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { StatusPill } from "@/shared/components/ui/status-pill";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});
const ROLLOUT_STAGES = [
  { label: "Observe", mode: "SHADOW" },
  { label: "Approve", mode: "APPROVAL" },
  { label: "Limited", mode: "AUTONOMOUS_LIMITED" },
  { label: "Automatic", mode: "AUTONOMOUS" },
] as const;

interface AdminModerationGovernanceProps {
  canManage: boolean;
}

export function AdminModerationGovernance({
  canManage,
}: AdminModerationGovernanceProps) {
  const versionsQuery = useQuery(
    operatorGovernanceQueries.configurationVersions(),
  );
  const stateQuery = useQuery(operatorGovernanceQueries.configurationState());
  const draftTemplateQuery = useQuery(
    operatorGovernanceQueries.configurationDraftTemplate(),
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { reauthenticationDialogProps, rejectCurrentStepUp, sessionQuery } =
    useOperatorSessionStepUp({ enabled: canManage });
  const commandsEnabled = canManage;
  const handleCommandError = (error: unknown) => {
    if (getOperatorControlErrorKind(error) === "STALE_SESSION") {
      rejectCurrentStepUp();
    }
  };

  const resolvedSelectedId =
    selectedId ??
    stateQuery.data?.activeConfigurationId ??
    versionsQuery.data?.[0]?.id ??
    null;
  const activeConfigurationId = stateQuery.data?.activeConfigurationId ?? null;
  const detailQuery = useQuery({
    ...operatorGovernanceQueries.configurationDetail(
      resolvedSelectedId ?? "configuration-not-selected",
    ),
    enabled: resolvedSelectedId !== null,
  });
  const activeDetailQuery = useQuery({
    ...operatorGovernanceQueries.configurationDetail(
      activeConfigurationId ?? "configuration-not-active",
    ),
    enabled:
      activeConfigurationId !== null &&
      activeConfigurationId !== resolvedSelectedId,
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
      ) : sessionQuery.isPending ? (
        <GovernanceSessionLoading />
      ) : sessionQuery.isError ? (
        <GovernanceSessionError onRetry={() => void sessionQuery.refetch()} />
      ) : null}

      <ConfigurationStateSummary
        state={state}
        active={versions.find(
          (version) => version.id === state.activeConfigurationId,
        )}
      />

      <section
        aria-labelledby="configuration-history-heading"
        className="grid gap-4 pt-2"
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="grid gap-1">
            <GovernanceSectionTitle
              id="configuration-history-heading"
              icon={History}
            >
              Version history
            </GovernanceSectionTitle>
            <p className="max-w-2xl text-slate-muted text-sm leading-relaxed">
              Earlier versions stay available for review. Restoring one creates
              a new version instead of changing the record.
            </p>
          </div>
          {versions.length > 0 ? (
            <p className="font-semibold text-slate-muted text-xs">
              {versions.length} immutable{" "}
              {versions.length === 1 ? "version" : "versions"}
            </p>
          ) : null}
        </div>

        {versions.length > 0 ? (
          <nav
            aria-label="Configuration version history"
            className="grid gap-2 rounded-2xl bg-card p-4 sm:p-5"
          >
            <div className="flex gap-1.5" aria-hidden="true">
              {versions.map((version) => (
                <span
                  key={version.id}
                  className={`h-1.5 min-w-6 flex-1 rounded-full ${
                    version.id === resolvedSelectedId
                      ? "bg-primary"
                      : version.status === "ACTIVE"
                        ? "bg-primary/45"
                        : version.status === "RETIRED"
                          ? "bg-slate-muted/30"
                          : "bg-accent/65"
                  }`}
                />
              ))}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {versions.map((version) => {
                const selected = version.id === resolvedSelectedId;
                return (
                  <button
                    key={version.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setSelectedId(version.id)}
                    className={`grid min-w-32 shrink-0 gap-0.5 rounded-xl px-3 py-2 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-primary/35 ${
                      selected
                        ? "bg-primary/8 text-primary"
                        : "text-slate-muted hover:bg-muted/55 hover:text-ink"
                    }`}
                  >
                    <span className="font-semibold text-sm">
                      Version {version.version}
                    </span>
                    <span className="text-xs">
                      {formatStatus(version.status)}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        ) : null}

        {versions.length === 0 ? (
          <div className="grid gap-6">
            <div className="rounded-xl border border-border border-dashed px-5 py-6 sm:px-6">
              <p className="font-semibold text-ink text-sm">
                No configuration history yet
              </p>
              <p className="mt-1 max-w-2xl text-slate-muted text-sm leading-relaxed">
                The first saved draft will start the immutable policy record.
                Begin with the server-safe template below.
              </p>
              <ol className="mt-5 grid gap-4 sm:grid-cols-3">
                {[
                  ["01", "Draft", "Set policy and worker limits."],
                  ["02", "Validate", "Run server and evaluation checks."],
                  ["03", "Release", "Activate an approved rollout stage."],
                ].map(([number, label, description]) => (
                  <li key={number} className="flex items-start gap-3">
                    <span className="font-semibold text-primary text-xs tabular-nums">
                      {number}
                    </span>
                    <div>
                      <p className="font-semibold text-ink text-sm">{label}</p>
                      <p className="mt-0.5 text-slate-muted text-xs leading-relaxed">
                        {description}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
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
            activeConfiguration={
              state.activeConfigurationId === detailQuery.data.id
                ? detailQuery.data
                : (activeDetailQuery.data ?? null)
            }
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
      <OperatorReauthenticationDialog {...reauthenticationDialogProps} />
    </div>
  );
}

function ConfigurationWorkspace({
  activeConfiguration,
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
  activeConfiguration: OperatorModerationConfigurationDetail | null;
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
      {configuration.id !== activeConfiguration?.id ? (
        <ConfigurationDiff
          activeConfiguration={activeConfiguration}
          configuration={configuration}
        />
      ) : null}
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

const CONFIGURATION_DIFF_GROUPS = [
  {
    label: "Policy identity",
    keys: [
      "policyVersion",
      "promptVersion",
      "schemaVersion",
      "thresholdVersion",
    ],
  },
  {
    label: "Runtime models",
    keys: ["moderationModel", "assessmentModel"],
  },
  { label: "Release posture", keys: ["rolloutMode"] },
  { label: "Thresholds", keys: ["moderationThresholds"] },
  { label: "Authority", keys: ["authorityRules"] },
  { label: "Failure handling", keys: ["failurePolicy"] },
  { label: "Worker timing", keys: ["workerSettings"] },
] as const;

function ConfigurationDiff({
  activeConfiguration,
  configuration,
}: {
  activeConfiguration: OperatorModerationConfigurationDetail | null;
  configuration: OperatorModerationConfigurationDetail;
}) {
  if (!activeConfiguration) {
    return (
      <section
        aria-labelledby="configuration-diff-heading"
        className="grid gap-1"
      >
        <GovernanceSectionTitle
          id="configuration-diff-heading"
          icon={GitCompareArrows}
        >
          Change from active
        </GovernanceSectionTitle>
        <p className="text-slate-muted text-sm">
          No active configuration is available as a comparison baseline.
        </p>
      </section>
    );
  }

  const selectedPayload = moderationConfigurationPayload(configuration);
  const activePayload = moderationConfigurationPayload(activeConfiguration);
  const changedGroups = CONFIGURATION_DIFF_GROUPS.filter((group) =>
    group.keys.some(
      (key) =>
        JSON.stringify(selectedPayload[key]) !==
        JSON.stringify(activePayload[key]),
    ),
  );

  return (
    <section
      aria-labelledby="configuration-diff-heading"
      className="grid gap-3"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="grid gap-1">
          <GovernanceSectionTitle
            id="configuration-diff-heading"
            icon={GitCompareArrows}
          >
            Change from active
          </GovernanceSectionTitle>
          <p className="text-slate-muted text-sm">
            Version {configuration.version} compared with active version{" "}
            {activeConfiguration.version}.
          </p>
        </div>
        <p className="font-semibold text-slate-muted text-xs">
          {changedGroups.length} of {CONFIGURATION_DIFF_GROUPS.length} areas
          changed
        </p>
      </div>
      <div className="flex gap-1.5" aria-hidden="true">
        {CONFIGURATION_DIFF_GROUPS.map((group) => {
          const changed = changedGroups.includes(group);
          return (
            <span
              key={group.label}
              className={`h-1.5 min-w-5 flex-1 rounded-full ${
                changed ? "bg-accent" : "bg-muted"
              }`}
            />
          );
        })}
      </div>
      <ul className="grid gap-0.5 overflow-hidden rounded-xl bg-background sm:grid-cols-2">
        {CONFIGURATION_DIFF_GROUPS.map((group) => {
          const changed = changedGroups.includes(group);
          return (
            <li
              key={group.label}
              className="flex items-center justify-between gap-3 rounded-xl bg-card px-4 py-3"
            >
              <span className="font-medium text-ink text-sm">
                {group.label}
              </span>
              <span
                className={`font-semibold text-xs ${
                  changed ? "text-accent" : "text-slate-muted"
                }`}
              >
                {changed ? "Changed" : "Same"}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function ConfigurationStateSummary({
  active,
  state,
}: {
  active?: OperatorModerationConfigurationSummary;
  state: OperatorModerationConfigurationState;
}) {
  const activeStage = active
    ? ROLLOUT_STAGES.findIndex((stage) => stage.mode === active.rolloutMode)
    : -1;

  return (
    <section
      aria-labelledby="active-configuration-heading"
      className="grid gap-4 pt-2"
    >
      <div className="grid gap-1">
        <GovernanceSectionTitle
          id="active-configuration-heading"
          icon={ShieldCheck}
        >
          Active configuration
        </GovernanceSectionTitle>
        <p className="text-slate-muted text-sm">
          The policy and release mode currently controlling moderation workers.
        </p>
      </div>

      <div className="grid gap-0.5 overflow-hidden rounded-2xl bg-background">
        <div className="grid gap-6 rounded-xl bg-card p-5 sm:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] sm:p-6">
          <div>
            <p className="font-semibold text-slate-muted text-xs">
              Worker policy
            </p>
            <p className="mt-2 font-semibold text-2xl text-ink tracking-tight">
              {active ? `Version ${active.version}` : "No policy deployed"}
            </p>
            <p
              className={`mt-1 font-semibold text-sm ${active ? "text-primary" : "text-accent"}`}
            >
              {active
                ? formatRollout(active.rolloutMode)
                : "Server-safe defaults remain in control"}
            </p>
          </div>

          <div className="min-w-0">
            <div
              aria-label={
                active
                  ? `${activeStage + 1} of ${ROLLOUT_STAGES.length} rollout stages enabled`
                  : "No rollout stage enabled"
              }
              className="grid grid-cols-4 gap-1.5"
              role="img"
            >
              {ROLLOUT_STAGES.map((stage, index) => (
                <span
                  key={stage.mode}
                  className={`h-1.5 rounded-full ${
                    index <= activeStage ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {ROLLOUT_STAGES.map((stage, index) => (
                <p
                  key={stage.mode}
                  className={`font-semibold text-xs ${
                    index === activeStage ? "text-primary" : "text-slate-muted"
                  }`}
                >
                  {stage.label}
                </p>
              ))}
            </div>
            <p className="mt-4 max-w-xl text-slate-muted text-xs leading-relaxed">
              Each stage expands worker authority. New versions begin in
              observe-only mode and move forward only after server validation.
            </p>
          </div>
        </div>

        <dl className="grid gap-0.5 bg-background sm:grid-cols-2">
          <ConfigurationStateFact
            label="Policy definition"
            value={active?.policyVersion ?? "Not configured"}
          />
          <ConfigurationStateFact
            label="Server state revision"
            value={String(state.stateRowVersion)}
          />
        </dl>
      </div>
    </section>
  );
}

function ConfigurationStateFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-xl bg-card px-5 py-4 sm:px-6">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word mt-1 font-semibold text-ink text-sm">
        {value}
      </dd>
    </div>
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
          <GovernanceSectionTitle
            id="configuration-detail-heading"
            icon={FileText}
          >
            Version {configuration.version}
          </GovernanceSectionTitle>
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
      <dl className="grid gap-0.5 overflow-hidden rounded-xl bg-background sm:grid-cols-2 lg:grid-cols-3">
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
      <CollapsibleSection variant="card" summary="View saved policy fields">
        <pre className="mt-3 max-h-96 overflow-auto rounded-xl bg-input p-4 text-foreground text-xs leading-relaxed">
          {JSON.stringify(
            moderationConfigurationPayload(configuration),
            null,
            2,
          )}
        </pre>
      </CollapsibleSection>
    </section>
  );
}

function ConfigurationFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 rounded-xl bg-card px-4 py-3">
      <dt className="font-semibold text-slate-muted text-xs">{label}</dt>
      <dd className="wrap-break-word font-medium text-ink text-sm">{value}</dd>
    </div>
  );
}

function GovernanceSectionTitle({
  children,
  icon: Icon,
  id,
}: {
  children: ReactNode;
  icon: LucideIcon;
  id: string;
}) {
  return (
    <h2
      id={id}
      className="flex items-center gap-2 font-semibold text-base text-ink"
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{children}</span>
    </h2>
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
    <Notice
      action={
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      }
      role="alert"
      size="lg"
      statusIcon
      tone="danger"
    >
      <p>
        <strong>Settings could not be loaded</strong>
        <span className="mt-1 block font-normal text-slate-muted">
          Your access may have ended, or the server may be unavailable. No
          configuration details were kept on this page.
        </span>
      </p>
    </Notice>
  );
}

function ConfigurationDetailError({ onRetry }: { onRetry: () => void }) {
  return (
    <Notice
      action={
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Refresh version
        </Button>
      }
      role="alert"
      size="lg"
      statusIcon
      tone="danger"
    >
      <p className="text-slate-muted text-sm">
        This version changed or is no longer available. Refresh before taking
        action.
      </p>
    </Notice>
  );
}

function DraftTemplateError({ onRetry }: { onRetry: () => void }) {
  return (
    <Notice
      action={
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      }
      role="alert"
      size="lg"
      statusIcon
      tone="warning"
    >
      <p className="text-slate-muted text-sm">
        The safe starting template could not be loaded. No draft has been
        created.
      </p>
    </Notice>
  );
}

function GovernanceAccessNotice() {
  return (
    <Notice
      icon={<ShieldOff className="size-4" aria-hidden="true" />}
      size="lg"
      tone="neutral"
    >
      <p>
        <strong>Read-only access</strong>
        <span className="mt-1 block font-normal text-slate-muted">
          You can inspect saved versions, but your current admin access cannot
          change them.
        </span>
      </p>
    </Notice>
  );
}

function GovernanceSessionLoading() {
  return (
    <Notice
      icon={<RefreshCw className="size-4 animate-spin" aria-hidden="true" />}
      role="status"
      size="lg"
      tone="neutral"
    >
      <p>Checking recent admin verification</p>
    </Notice>
  );
}

function GovernanceSessionError({ onRetry }: { onRetry: () => void }) {
  return (
    <Notice
      action={
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="size-4" aria-hidden="true" />
          Try again
        </Button>
      }
      role="alert"
      size="lg"
      statusIcon
      tone="warning"
    >
      <p className="text-slate-muted text-sm">
        Recent admin verification could not be checked. Changes remain disabled.
      </p>
    </Notice>
  );
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
