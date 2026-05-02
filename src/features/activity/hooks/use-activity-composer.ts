import { useState } from "react";

import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { captureException, trackMutationOutcome } from "@/shared/lib/telemetry";
import { trackedMutationNames } from "@/shared/lib/telemetry-contract";
import { ActivityCommands } from "@/features/activity/api/activity-commands";
import type { ActivitySendMessageInput } from "@/features/activity/lib/activity-contract";
import { useActivityStore } from "@/features/activity/store/activity.store";
import { useActivityMessageActions } from "./use-activity-message-actions";

export function useActivityComposer() {
  const [sendError, setSendError] = useState<string | null>(null);
  const selectedKind = useActivityStore((state) => state.selectedKind);
  const selectedId = useActivityStore((state) => state.selectedId);
  const replyingTo = useActivityStore((state) => state.replyingTo);
  const { editingMessage, submitEdit } = useActivityMessageActions();

  async function handleSendMessage(input: ActivitySendMessageInput) {
    setSendError(null);

    try {
      if (editingMessage) {
        const result = await submitEdit(input.content);
        trackMutationOutcome(
          trackedMutationNames.activityMessageEdit,
          "success",
          {
            conversationKind: selectedKind ?? "unknown",
            requestId: result?.requestId ?? null,
          },
        );
        return;
      }

      const result = await ActivityCommands.sendMessage(
        selectedKind,
        selectedId,
        {
          ...input,
          replyTo: replyingTo,
          replyToId: replyingTo?.id ?? null,
        },
      );
      trackMutationOutcome(
        trackedMutationNames.activityMessageSend,
        "success",
        {
          conversationKind: selectedKind ?? "unknown",
          attachmentCount: input.attachments?.length ?? 0,
          hasReply: Boolean(replyingTo),
          requestId: result?.requestId ?? null,
        },
      );
    } catch (error) {
      captureException(trackedMutationNames.activityMessageSend, error, {
        conversationKind: selectedKind ?? "unknown",
        isEdit: Boolean(editingMessage),
        attachmentCount: input.attachments?.length ?? 0,
        hasReply: Boolean(replyingTo),
      });
      trackMutationOutcome(
        editingMessage
          ? trackedMutationNames.activityMessageEdit
          : trackedMutationNames.activityMessageSend,
        "error",
        {
          conversationKind: selectedKind ?? "unknown",
          attachmentCount: input.attachments?.length ?? 0,
          hasReply: Boolean(replyingTo),
        },
      );
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
