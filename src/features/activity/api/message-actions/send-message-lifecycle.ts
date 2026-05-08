export {
  applyMessageFailed,
  applyMessageSent,
  applyOptimisticMessageSending,
  applyRetryMessageSending,
} from "@/features/activity/api/message-actions/send-message-cache-lifecycle";
export { sendMessageToApi } from "@/features/activity/api/message-actions/send-message-delivery";
export type { OutgoingMessageTarget } from "@/features/activity/api/message-actions/send-message-target";
export {
  resolveNewMessageTarget,
  resolveRetryMessageTarget,
} from "@/features/activity/api/message-actions/send-message-target";
