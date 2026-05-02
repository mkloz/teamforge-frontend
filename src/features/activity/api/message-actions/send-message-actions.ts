import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "@/features/activity/api/activity-action-context";
import {
  buildOptimisticMessage,
  getRetryableMessageInput,
} from "@/features/activity/api/activity-outgoing-message";
import {
  applyMessageFailed,
  applyMessageSent,
  applyOptimisticMessageSending,
  applyRetryMessageSending,
  resolveNewMessageTarget,
  resolveRetryMessageTarget,
  sendMessageToApi,
} from "@/features/activity/api/message-actions/send-message-lifecycle";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const ActivitySendMessageActions = {
  async sendMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    input: SendActivityMessageInput,
  ) {
    const target = await resolveNewMessageTarget({
      context,
      kind,
      selectedId,
    });

    if (!target) {
      return null;
    }

    const optimisticMessage = buildOptimisticMessage(
      target.currentUserParticipant,
      target.chatId,
      input,
    );

    applyOptimisticMessageSending(
      context,
      target.chatId,
      optimisticMessage,
      input,
    );

    try {
      const messageResult = await sendMessageToApi(context, target, input);

      applyMessageSent(
        context,
        target.chatId,
        optimisticMessage,
        messageResult.message,
      );
      return {
        message: messageResult.message,
        requestId: messageResult.requestId,
      };
    } catch (error) {
      applyMessageFailed(context, target.chatId, optimisticMessage);
      throw error;
    }
  },

  async retryMessage(
    context: ActivityActionContext,
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const retryableInput = getRetryableMessageInput(message.id);

    if (!retryableInput || message.status !== "FAILED") {
      return null;
    }

    const target = await resolveRetryMessageTarget({
      chatId: retryableInput.chatId,
      context,
      kind,
      selectedId,
    });

    if (!target) {
      return null;
    }

    applyRetryMessageSending(context, target.chatId, message);

    try {
      const sentMessageResult = await sendMessageToApi(
        context,
        target,
        retryableInput.input,
      );

      applyMessageSent(
        context,
        target.chatId,
        message,
        sentMessageResult.message,
      );
      return {
        message: sentMessageResult.message,
        requestId: sentMessageResult.requestId,
      };
    } catch (error) {
      applyMessageFailed(context, target.chatId, message);
      throw error;
    }
  },
};
