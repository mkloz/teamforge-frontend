import type { SendActivityMessageInput } from "@/features/activity/api/activity-action-context";

interface RetryableMessageInput {
  chatId: string;
  input: SendActivityMessageInput;
}

const retryableMessageInputs = new Map<string, RetryableMessageInput>();

export function rememberRetryableMessage(
  messageId: string,
  chatId: string,
  input: SendActivityMessageInput,
) {
  retryableMessageInputs.set(messageId, { chatId, input });
}

export function getRetryableMessageInput(messageId: string) {
  return retryableMessageInputs.get(messageId) ?? null;
}

export function dropRetryableMessage(messageId: string) {
  retryableMessageInputs.delete(messageId);
}

export function hasRetryableMessage(messageId: string) {
  return retryableMessageInputs.has(messageId);
}
