import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyPlus, Cpu, FileKey2, Gauge, PencilRuler } from "lucide-react";
import { useId, useRef, useState } from "react";

import { controlErrorMessage } from "@/features/admin/components/moderation-configuration-actions";
import {
  OPERATOR_MODERATION_ROLLOUT_MODES,
  type OperatorModerationConfigurationPayload,
  operatorControlMutations,
  operatorModerationConfigurationPayloadSchema,
} from "@/features/operator/public/operator-governance";
import { Button } from "@/shared/components/ui/button";
import { CollapsibleSection } from "@/shared/components/ui/collapsible-section";
import { Field, FieldLabel } from "@/shared/components/ui/field";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";

interface ModerationConfigurationEditorProps {
  commandsEnabled: boolean;
  onCommandError: (error: unknown) => void;
  onCreated: (configurationId: string) => void;
  source: OperatorModerationConfigurationPayload;
  sourceLabel: string;
}

export function ModerationConfigurationEditor({
  commandsEnabled,
  onCommandError,
  onCreated,
  source,
  sourceLabel,
}: ModerationConfigurationEditorProps) {
  const queryClient = useQueryClient();
  const [fields, setFields] = useState(() => textFields(source));
  const [validationError, setValidationError] = useState<string | null>(null);
  const commandKey = useRef<string | null>(null);
  const createDraft = useMutation(
    operatorControlMutations.createConfigurationDraft({
      onError: onCommandError,
      queryClient,
    }),
  );

  function updateField(name: keyof DraftTextFields, value: string) {
    setFields((current) => ({ ...current, [name]: value }));
    setValidationError(null);
    commandKey.current = null;
    createDraft.reset();
  }

  function submitDraft() {
    if (!commandsEnabled) return;

    const payloadResult = parsePayload(fields);
    if (!payloadResult.success) {
      setValidationError(payloadResult.message);
      return;
    }

    commandKey.current ??= globalThis.crypto.randomUUID();
    createDraft.mutate(
      {
        idempotencyKey: commandKey.current,
        payload: payloadResult.payload,
        reasonCode: "POLICY_CONFIGURATION_UPDATE",
      },
      {
        onSuccess: (result) => {
          commandKey.current = null;
          onCreated(result.id);
        },
      },
    );
  }

  return (
    <section
      aria-labelledby="configuration-draft-heading"
      className="grid gap-4 pt-2"
    >
      <div className="grid gap-1">
        <h2
          id="configuration-draft-heading"
          className="flex items-center gap-2 font-semibold text-base text-ink"
        >
          <PencilRuler className="size-4 shrink-0" aria-hidden="true" />
          <span>
            {commandsEnabled
              ? `Create a draft from ${sourceLabel}`
              : `Review draft fields from ${sourceLabel}`}
          </span>
        </h2>
        <p className="max-w-3xl text-slate-muted text-sm leading-relaxed">
          {commandsEnabled
            ? "Review these fields before saving. A new draft is kept separate from the active policy."
            : "These fields are read-only. Saved configuration details and version history remain available for review."}
        </p>
      </div>

      <div className="grouped-surface grid overflow-hidden rounded-2xl">
        <fieldset className="grid gap-4 rounded-xl bg-card p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
          <legend className="mb-1">
            <span className="flex items-center gap-2 font-semibold text-ink text-sm">
              <FileKey2 className="size-4 shrink-0" aria-hidden="true" />
              Policy identity
            </span>
          </legend>
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Policy"
            value={fields.policyVersion}
            onChange={(value) => updateField("policyVersion", value)}
          />
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Prompt"
            value={fields.promptVersion}
            onChange={(value) => updateField("promptVersion", value)}
          />
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Schema"
            value={fields.schemaVersion}
            onChange={(value) => updateField("schemaVersion", value)}
          />
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Thresholds"
            value={fields.thresholdVersion}
            onChange={(value) => updateField("thresholdVersion", value)}
          />
        </fieldset>

        <fieldset className="grid gap-4 rounded-xl bg-card p-5 sm:grid-cols-2 sm:p-6">
          <legend className="mb-1">
            <span className="flex items-center gap-2 font-semibold text-ink text-sm">
              <Cpu className="size-4 shrink-0" aria-hidden="true" />
              Runtime models
            </span>
          </legend>
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Moderation"
            value={fields.moderationModel}
            onChange={(value) => updateField("moderationModel", value)}
          />
          <TextField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Assessment"
            value={fields.assessmentModel}
            onChange={(value) => updateField("assessmentModel", value)}
          />
        </fieldset>

        <fieldset className="rounded-xl bg-card p-5 sm:p-6">
          <legend>
            <span className="flex items-center gap-2 font-semibold text-ink text-sm">
              <Gauge className="size-4 shrink-0" aria-hidden="true" />
              Release posture
            </span>
          </legend>
          <p className="mt-1 text-slate-muted text-xs leading-relaxed">
            Choose how much authority this version gives moderation workers.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {OPERATOR_MODERATION_ROLLOUT_MODES.map((mode) => {
              const checked = fields.rolloutMode === mode;
              return (
                <label
                  key={mode}
                  className={cn(
                    "cursor-pointer rounded-xl border px-4 py-3 transition-colors",
                    checked
                      ? "border-primary/45 bg-primary/8"
                      : "border-border bg-background/20",
                    (!commandsEnabled || createDraft.isPending) &&
                      "cursor-default",
                  )}
                >
                  <input
                    className="sr-only"
                    type="radio"
                    name="rollout-mode"
                    value={mode}
                    checked={checked}
                    disabled={!commandsEnabled || createDraft.isPending}
                    onChange={(event) =>
                      updateField("rolloutMode", event.target.value)
                    }
                  />
                  <span
                    className={cn(
                      "font-semibold text-sm",
                      checked ? "text-foreground" : "text-ink",
                    )}
                  >
                    {rolloutLabel(mode)}
                  </span>
                  <span className="mt-1 block text-slate-muted text-xs leading-relaxed">
                    {rolloutDescription(mode)}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      <CollapsibleSection
        variant="card"
        summary={
          commandsEnabled
            ? "Edit thresholds, authority, failures, and worker timing"
            : "View thresholds, authority, failures, and worker timing"
        }
        triggerClassName="px-5 py-4"
        contentClassName="px-5 pb-5"
      >
        <p className="mt-2 max-w-3xl text-slate-muted text-xs leading-relaxed">
          These fields use the exact saved JSON shape. The form validates them
          against the frontend copy of the server contract before sending.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <JsonField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Moderation thresholds"
            value={fields.moderationThresholds}
            onChange={(value) => updateField("moderationThresholds", value)}
          />
          <JsonField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Authority rules"
            value={fields.authorityRules}
            onChange={(value) => updateField("authorityRules", value)}
          />
          <JsonField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Failure policy"
            value={fields.failurePolicy}
            onChange={(value) => updateField("failurePolicy", value)}
          />
          <JsonField
            readOnly={!commandsEnabled || createDraft.isPending}
            label="Worker timing"
            value={fields.workerSettings}
            onChange={(value) => updateField("workerSettings", value)}
          />
        </div>
      </CollapsibleSection>

      {validationError ? (
        <p className="text-destructive text-sm" role="alert">
          {validationError}
        </p>
      ) : createDraft.isError ? (
        <p className="text-destructive text-sm" role="alert">
          {controlErrorMessage(createDraft.error)}
        </p>
      ) : null}

      <Button
        type="button"
        className="w-fit"
        disabled={!commandsEnabled || createDraft.isPending}
        loading={createDraft.isPending}
        onClick={submitDraft}
      >
        <CopyPlus className="size-4" aria-hidden="true" />
        Create draft
      </Button>
    </section>
  );
}

interface DraftTextFields {
  assessmentModel: string;
  authorityRules: string;
  failurePolicy: string;
  moderationModel: string;
  moderationThresholds: string;
  policyVersion: string;
  promptVersion: string;
  rolloutMode: string;
  schemaVersion: string;
  thresholdVersion: string;
  workerSettings: string;
}

function textFields(
  payload: OperatorModerationConfigurationPayload,
): DraftTextFields {
  return {
    assessmentModel: payload.assessmentModel,
    authorityRules: JSON.stringify(payload.authorityRules, null, 2),
    failurePolicy: JSON.stringify(payload.failurePolicy, null, 2),
    moderationModel: payload.moderationModel,
    moderationThresholds: JSON.stringify(payload.moderationThresholds, null, 2),
    policyVersion: payload.policyVersion,
    promptVersion: payload.promptVersion,
    rolloutMode: payload.rolloutMode,
    schemaVersion: payload.schemaVersion,
    thresholdVersion: payload.thresholdVersion,
    workerSettings: JSON.stringify(payload.workerSettings, null, 2),
  };
}

function parsePayload(
  fields: DraftTextFields,
):
  | { success: true; payload: OperatorModerationConfigurationPayload }
  | { success: false; message: string } {
  try {
    const payloadJson = `{
      "assessmentModel": ${JSON.stringify(fields.assessmentModel.trim())},
      "authorityRules": ${fields.authorityRules},
      "failurePolicy": ${fields.failurePolicy},
      "moderationModel": ${JSON.stringify(fields.moderationModel.trim())},
      "moderationThresholds": ${fields.moderationThresholds},
      "policyVersion": ${JSON.stringify(fields.policyVersion.trim())},
      "promptVersion": ${JSON.stringify(fields.promptVersion.trim())},
      "rolloutMode": ${JSON.stringify(fields.rolloutMode)},
      "schemaVersion": ${JSON.stringify(fields.schemaVersion.trim())},
      "thresholdVersion": ${JSON.stringify(fields.thresholdVersion.trim())},
      "workerSettings": ${fields.workerSettings}
    }`;
    const parsed = operatorModerationConfigurationPayloadSchema.safeParse(
      JSON.parse(payloadJson),
    );
    if (!parsed.success) {
      return {
        success: false,
        message:
          parsed.error.issues[0]?.message ??
          "Review the version fields before creating the draft.",
      };
    }
    return { success: true, payload: parsed.data };
  } catch {
    return {
      success: false,
      message: "One of the policy JSON fields is not valid JSON.",
    };
  }
}

function TextField({
  label,
  onChange,
  readOnly,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  const id = useId();
  if (readOnly) {
    const configured = value.trim() !== "" && value !== "unconfigured";
    return (
      <div className="min-w-0">
        <p className="font-semibold text-slate-muted text-xs">{label}</p>
        <p
          className={cn(
            "wrap-break-word mt-1 font-semibold text-sm",
            configured ? "text-ink" : "text-accent",
          )}
        >
          {configured ? value : "Not configured"}
        </p>
      </div>
    );
  }

  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="font-semibold text-ink">
        {label}
      </FieldLabel>
      <Input
        id={id}
        readOnly={readOnly}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function JsonField({
  label,
  onChange,
  readOnly,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  value: string;
}) {
  const id = useId();
  return (
    <Field className="gap-1.5">
      <FieldLabel htmlFor={id} className="font-semibold text-ink">
        {label}
      </FieldLabel>
      <Textarea
        id={id}
        className="min-h-48 font-mono text-xs leading-relaxed"
        readOnly={readOnly}
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

function rolloutLabel(mode: string) {
  if (mode === "SHADOW") return "Observe only";
  if (mode === "APPROVAL") return "Human approval";
  if (mode === "AUTONOMOUS_LIMITED") return "Limited automatic safeguards";
  return "Automatic safeguards";
}

function rolloutDescription(mode: string) {
  if (mode === "SHADOW") return "Measure decisions without taking action.";
  if (mode === "APPROVAL") return "Require an operator before every action.";
  if (mode === "AUTONOMOUS_LIMITED") {
    return "Allow only the server-approved safeguards.";
  }
  return "Apply all configured safeguards automatically.";
}
