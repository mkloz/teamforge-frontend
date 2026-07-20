import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CopyPlus } from "lucide-react";
import { useId, useRef, useState } from "react";

import { controlErrorMessage } from "@/features/admin/components/moderation-configuration-actions";
import {
  OPERATOR_MODERATION_ROLLOUT_MODES,
  type OperatorModerationConfigurationPayload,
  operatorControlMutations,
  operatorModerationConfigurationPayloadSchema,
} from "@/features/operator/public/operator-governance";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";

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
      className="grid gap-4 border-border border-t pt-6"
    >
      <div className="grid gap-1">
        <h2
          id="configuration-draft-heading"
          className="font-semibold text-base text-ink"
        >
          Create a draft from {sourceLabel}
        </h2>
        <p className="max-w-3xl text-slate-muted text-sm leading-relaxed">
          Review these fields before saving. A new draft is kept separate from
          the active policy.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <TextField
          label="Policy version"
          value={fields.policyVersion}
          onChange={(value) => updateField("policyVersion", value)}
        />
        <TextField
          label="Prompt version"
          value={fields.promptVersion}
          onChange={(value) => updateField("promptVersion", value)}
        />
        <TextField
          label="Schema version"
          value={fields.schemaVersion}
          onChange={(value) => updateField("schemaVersion", value)}
        />
        <TextField
          label="Threshold version"
          value={fields.thresholdVersion}
          onChange={(value) => updateField("thresholdVersion", value)}
        />
        <TextField
          label="Moderation model"
          value={fields.moderationModel}
          onChange={(value) => updateField("moderationModel", value)}
        />
        <TextField
          label="Assessment model"
          value={fields.assessmentModel}
          onChange={(value) => updateField("assessmentModel", value)}
        />
        <label className="grid gap-1.5 font-semibold text-ink text-sm">
          Rollout
          <select
            className="h-10 rounded-xl border border-input-border bg-input px-3 font-normal text-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            value={fields.rolloutMode}
            onChange={(event) => updateField("rolloutMode", event.target.value)}
          >
            {OPERATOR_MODERATION_ROLLOUT_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {rolloutLabel(mode)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <details className="border-border border-y py-4">
        <summary className="cursor-pointer font-semibold text-ink text-sm">
          Edit thresholds, authority, failures, and worker timing
        </summary>
        <p className="mt-2 max-w-3xl text-slate-muted text-xs leading-relaxed">
          These fields use the exact saved JSON shape. The form validates them
          against the frontend copy of the server contract before sending.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <JsonField
            label="Moderation thresholds"
            value={fields.moderationThresholds}
            onChange={(value) => updateField("moderationThresholds", value)}
          />
          <JsonField
            label="Authority rules"
            value={fields.authorityRules}
            onChange={(value) => updateField("authorityRules", value)}
          />
          <JsonField
            label="Failure policy"
            value={fields.failurePolicy}
            onChange={(value) => updateField("failurePolicy", value)}
          />
          <JsonField
            label="Worker timing"
            value={fields.workerSettings}
            onChange={(value) => updateField("workerSettings", value)}
          />
        </div>
      </details>

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
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="grid gap-1.5 font-semibold text-ink text-sm">
      {label}
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function JsonField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  const id = useId();
  return (
    <label htmlFor={id} className="grid gap-1.5 font-semibold text-ink text-sm">
      {label}
      <Textarea
        id={id}
        className="min-h-48 font-mono text-xs leading-relaxed"
        spellCheck={false}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function rolloutLabel(mode: string) {
  if (mode === "SHADOW") return "Observe only";
  if (mode === "APPROVAL") return "Human approval";
  if (mode === "AUTONOMOUS_LIMITED") return "Limited automatic safeguards";
  return "Automatic safeguards";
}
