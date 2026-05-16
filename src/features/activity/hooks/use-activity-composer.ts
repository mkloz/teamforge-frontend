import { useState } from "react";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import { canReplyToMessage } from "@/features/activity/lib/message-action-capabilities";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { useActivityMessageActions } from "./use-activity-message-actions";

function getRequestId(
  result: { requestId?: string | null } | null | undefined,
) {
  return result?.requestId ?? null;
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
    const attachmentCount = input.attachments?.length ?? 0;
    const replyTarget =
      replyingTo && canReplyToMessage(replyingTo) ? replyingTo : null;
    const hasReply = Boolean(replyTarget);
    const mutationName = editingMessage
      ? trackedMutationNames.activityMessageEdit
      : trackedMutationNames.activityMessageSend;

    if (editingMessage) {
      try {
        const result = await submitEdit(input.content);
        trackMutationOutcome(
          trackedMutationNames.activityMessageEdit,
          "success",
          {
            conversationKind,
            requestId: getRequestId(result),
          },
        );
        return;
      } catch (error) {
        captureException(mutationName, error, {
          attachmentCount,
          conversationKind,
          hasReply,
          isEdit: true,
        });
        trackMutationOutcome(mutationName, "error", {
          attachmentCount,
          conversationKind,
          hasReply,
        });
        setSendError(
          getApiErrorMessage(
            error,
            "We couldn't send that message. Please try again.",
          ),
        );
        throw error;
      }
    }

    const replyToId = replyTarget ? replyTarget.id : null;

    try {
      const result = await ActivityCommands.sendMessage(
        selectedKind,
        selectedId,
        {
          ...input,
          replyTo: replyTarget,
          replyToId,
        },
      );
      trackMutationOutcome(
        trackedMutationNames.activityMessageSend,
        "success",
        {
          attachmentCount,
          conversationKind,
          hasReply,
          requestId: getRequestId(result),
        },
      );
    } catch (error) {
      captureException(mutationName, error, {
        attachmentCount,
        conversationKind,
        hasReply,
        isEdit: false,
      });
      trackMutationOutcome(mutationName, "error", {
        attachmentCount,
        conversationKind,
        hasReply,
      });
      setSendError(
        getApiErrorMessage(
          error,
          "We couldn't send that message. Please try again.",
        ),
      );
      throw error;
    }
  }

  return {
    handleSendMessage,
    sendError,
    clearSendError: () => setSendError(null),
  };
}
