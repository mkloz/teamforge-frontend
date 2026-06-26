import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  isOptimisticMessageId,
  isSyntheticProposalMessageId,
} from "@/features/activity/lib/message-action-capabilities/message-id-state";

const restrictedMutationMessageTypes = ["PLAN_UPDATE", "SYSTEM"] as const;

function isPersistedChatMessage(
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

export function isPlanUpdateMessage(message: Pick<UnifiedMessage, "type">) {
  return message.type === "PLAN_UPDATE";
}

export function hasRestrictedMutationType(
  message: Pick<UnifiedMessage, "type">,
) {
  return restrictedMutationMessageTypes.some((type) => type === message.type);
}

export function isOwnTextMessage(
  message: Pick<UnifiedMessage, "isOwn" | "type">,
) {
  return message.isOwn && message.type === "TEXT";
}

export function hasNoAttachments(message: Pick<UnifiedMessage, "attachments">) {
  return (message.attachments?.length ?? 0) === 0;
}

export function isFailedMessage(message: Pick<UnifiedMessage, "status">) {
  return message.status === "FAILED";
}
