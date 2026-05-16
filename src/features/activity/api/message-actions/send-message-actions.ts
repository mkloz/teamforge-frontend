import type {
  ActivityActionContext,
  SendActivityMessageInput,
} from "@/features/activity/api/activity-action-context";
import {
  getActivityMutationKey,
  runExclusiveActivityMutation,
} from "@/features/activity/api/activity-mutation-lock";
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
import type {
  ActivityOutgoingAttachment,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

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

    return runExclusiveActivityMutation(
      getSendMessageMutationKey(target.chatId, input),
      async () => {
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
    );
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

    return runExclusiveActivityMutation(
      getActivityMutationKey(
        "message",
        retryableInput.chatId,
        message.id,
        "retry",
      ),
      () =>
        retryMessageSend({
          context,
          kind,
          message,
          retryableInput,
          selectedId,
        }),
    );
  },
};

function getSendMessageMutationKey(
  chatId: string,
  input: SendActivityMessageInput,
) {
  return getActivityMutationKey(
    "message",
    chatId,
    "send",
    input.content.trim(),
    input.replyToId ?? input.replyTo?.id ?? null,
    input.gif?.providerId ?? input.gif?.url ?? null,
    input.attachments?.map(getAttachmentMutationPart).join("|") ?? null,
  );
}

function getAttachmentMutationPart(attachment: ActivityOutgoingAttachment) {
  return [
    attachment.file.name,
    attachment.file.size,
    attachment.file.lastModified,
    attachment.duration ?? null,
  ].join(":");
}

type RetryableMessageInput = NonNullable<
  ReturnType<typeof getRetryableMessageInput>
>;

interface RetryMessageSendInput {
  context: ActivityActionContext;
  kind: "group" | "dm";
  message: UnifiedMessage;
  retryableInput: RetryableMessageInput;
  selectedId: string;
}

async function retryMessageSend({
  context,
  kind,
  message,
  retryableInput,
  selectedId,
}: RetryMessageSendInput) {
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
}
