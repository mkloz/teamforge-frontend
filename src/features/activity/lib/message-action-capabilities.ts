import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

const SYNTHETIC_PROPOSAL_MESSAGE_PREFIX = "proposal:";
const OPTIMISTIC_MESSAGE_PREFIX = "temp-message:";

type MessageActionTarget = Pick<
  UnifiedMessage,
  "attachments" | "id" | "isOwn" | "status" | "type"
>;

export function isSyntheticProposalMessageId(messageId: string) {
  return messageId.startsWith(SYNTHETIC_PROPOSAL_MESSAGE_PREFIX);
}

export function isOptimisticMessageId(messageId: string) {
  return messageId.startsWith(OPTIMISTIC_MESSAGE_PREFIX);
}

export function isPersistedChatMessage(
  message: Pick<UnifiedMessage, "id" | "status">,
) {
  return (
    message.status !== "SENDING" &&
    !isSyntheticProposalMessageId(message.id) &&
    !isOptimisticMessageId(message.id)
  );
}

export function canUsePersistedMessageMutation(
  message: Pick<UnifiedMessage, "id" | "status">,
) {
  return isPersistedChatMessage(message) && message.status !== "FAILED";
}

export function canReactToMessage(message: MessageActionTarget) {
  return canUsePersistedMessageMutation(message);
}

export function canReplyToMessage(message: MessageActionTarget) {
  return canUsePersistedMessageMutation(message);
}

export function canPinMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) && message.type !== "PLAN_UPDATE"
  );
}

export function canSaveMessage(message: MessageActionTarget) {
  return (
    message.status !== "SENDING" &&
    message.status !== "FAILED" &&
    message.type !== "SYSTEM"
  );
}

export function canEditMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) &&
    message.isOwn &&
    message.type === "TEXT" &&
    (message.attachments?.length ?? 0) === 0
  );
}

export function canDeleteMessage(message: MessageActionTarget) {
  return (
    message.isOwn &&
    !isSyntheticProposalMessageId(message.id) &&
    (message.status === "FAILED" || canUsePersistedMessageMutation(message))
  );
}
