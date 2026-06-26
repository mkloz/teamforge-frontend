import type { MessageActionTarget } from "@/features/activity/lib/message-action-capabilities/message-action-target";
import { isSyntheticProposalMessageId } from "@/features/activity/lib/message-action-capabilities/message-id-state";
import {
  canUsePersistedMessageMutation,
  hasNoAttachments,
  hasRestrictedMutationType,
  isFailedMessage,
  isOwnTextMessage,
  isPlanUpdateMessage,
} from "@/features/activity/lib/message-action-capabilities/message-state-predicates";

export function canReactToMessage(message: MessageActionTarget) {
  return canUsePersistedMessageMutation(message);
}

export function canReplyToMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) &&
    (!isPlanUpdateMessage(message) || Boolean(message.proposal))
  );
}

export function canPinMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) && !isPlanUpdateMessage(message)
  );
}

export function canSaveMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) &&
    !hasRestrictedMutationType(message)
  );
}

export function canEditMessage(message: MessageActionTarget) {
  return (
    canUsePersistedMessageMutation(message) &&
    isOwnTextMessage(message) &&
    hasNoAttachments(message)
  );
}

export function canDeleteMessage(message: MessageActionTarget) {
  return (
    message.isOwn &&
    !isPlanUpdateMessage(message) &&
    !isSyntheticProposalMessageId(message.id) &&
    (isFailedMessage(message) || canUsePersistedMessageMutation(message))
  );
}
