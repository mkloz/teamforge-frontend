import { useState } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type {
  ActivitySendMessageInput,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { canReplyToMessage } from "@/features/activity/lib/message-action-capabilities";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import {
  type TrackedMutationName,
  trackedMutationNames,
} from "@/shared/lib/telemetry-contract";
import { useActivityMessageActions } from "./use-activity-message-actions";

const SEND_MESSAGE_ERROR_MESSAGE =
  "We couldn't send that message. Please try again.";

type SendableConversationKind = "dm" | "group";

interface ComposerTelemetryContext {
  attachmentCount: number;
  conversationKind: string;
  hasReply: boolean;
}

interface ExecuteComposerMutationParams {
  context: ComposerTelemetryContext;
  isEdit: boolean;
  mutationName: TrackedMutationName;
  run: () => Promise<{ requestId?: string | null } | null | undefined>;
}

interface ExecuteComposerMutationWithErrorMessageParams
  extends ExecuteComposerMutationParams {
  setSendError: (message: string | null) => void;
}

interface SubmitComposerInputParams {
  editingMessage: UnifiedMessage | null;
  input: ActivitySendMessageInput;
  mutationName: TrackedMutationName;
  replyTarget: UnifiedMessage | null;
  selectedId: string | null;
  selectedKind: SendableConversationKind;
  setSendError: (message: string | null) => void;
  submitEdit: ReturnType<typeof useActivityMessageActions>["submitEdit"];
  telemetryContext: ComposerTelemetryContext;
}

function getRequestId(
  result: { requestId?: string | null } | null | undefined,
) {
  return result?.requestId ?? null;
}

function isSendableConversationKind(
  kind: string | null,
): kind is SendableConversationKind {
  return kind === "group" || kind === "dm";
}

function getReplyTarget(replyingTo: UnifiedMessage | null) {
  return replyingTo && canReplyToMessage(replyingTo) ? replyingTo : null;
}

function getMutationName(isEdit: boolean) {
  return isEdit
    ? trackedMutationNames.activityMessageEdit
    : trackedMutationNames.activityMessageSend;
}

function getTelemetryContext(
  input: ActivitySendMessageInput,
  conversationKind: string,
  replyTarget: UnifiedMessage | null,
): ComposerTelemetryContext {
  return {
    attachmentCount: input.attachments?.length ?? 0,
    conversationKind,
    hasReply: Boolean(replyTarget),
  };
}

function getSuccessTelemetryPayload(
  { attachmentCount, conversationKind, hasReply }: ComposerTelemetryContext,
  requestId: string | null,
  isEdit: boolean,
) {
  return isEdit
    ? {
        conversationKind,
        requestId,
      }
    : {
        attachmentCount,
        conversationKind,
        hasReply,
        requestId,
      };
}

function getErrorTelemetryPayload({
  attachmentCount,
  conversationKind,
  hasReply,
}: ComposerTelemetryContext) {
  return {
    attachmentCount,
    conversationKind,
    hasReply,
  };
}

async function executeComposerMutation({
  context,
  isEdit,
  mutationName,
  run,
}: ExecuteComposerMutationParams) {
  try {
    const result = await run();
    trackMutationOutcome(
      mutationName,
      "success",
      getSuccessTelemetryPayload(context, getRequestId(result), isEdit),
    );
  } catch (error) {
    const errorTelemetry = getErrorTelemetryPayload(context);

    captureException(mutationName, error, {
      ...errorTelemetry,
      isEdit,
    });
    trackMutationOutcome(mutationName, "error", errorTelemetry);
    throw error;
  }
}

async function executeComposerMutationWithErrorMessage({
  setSendError,
  ...mutationParams
}: ExecuteComposerMutationWithErrorMessageParams) {
  try {
    await executeComposerMutation(mutationParams);
  } catch (error) {
    setSendError(getApiErrorMessage(error, SEND_MESSAGE_ERROR_MESSAGE));
    throw error;
  }
}

async function submitComposerInput({
  editingMessage,
  input,
  mutationName,
  replyTarget,
  selectedId,
  selectedKind,
  setSendError,
  submitEdit,
  telemetryContext,
}: SubmitComposerInputParams) {
  if (editingMessage) {
    await executeComposerMutationWithErrorMessage({
      context: telemetryContext,
      isEdit: true,
      mutationName,
      run: () => submitEdit(input.content),
      setSendError,
    });
    return;
  }

  const replyToId = replyTarget ? replyTarget.id : null;

  await executeComposerMutationWithErrorMessage({
    context: telemetryContext,
    isEdit: false,
    mutationName,
    run: () =>
      ActivityCommands.sendMessage(selectedKind, selectedId, {
        ...input,
        replyTo: replyTarget,
        replyToId,
      }),
    setSendError,
  });
}

export function useActivityComposer() {
  const [sendError, setSendError] = useState<string | null>(null);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const { editingMessage, submitEdit } = useActivityMessageActions();

  async function handleSendMessage(input: ActivitySendMessageInput) {
    setSendError(null);
    const conversationKind = selectedKind ?? "unknown";
    const replyTarget = getReplyTarget(replyingTo);
    const isEdit = Boolean(editingMessage);
    const mutationName = getMutationName(isEdit);
    const telemetryContext = getTelemetryContext(
      input,
      conversationKind,
      replyTarget,
    );

    if (!isSendableConversationKind(selectedKind)) {
      return;
    }

    await submitComposerInput({
      editingMessage,
      input,
      mutationName,
      replyTarget,
      selectedId,
      selectedKind,
      setSendError,
      submitEdit,
      telemetryContext,
    });
  }

  return {
    handleSendMessage,
    sendError,
    clearSendError: () => setSendError(null),
  };
}
