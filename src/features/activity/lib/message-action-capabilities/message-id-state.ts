const SYNTHETIC_PROPOSAL_MESSAGE_PREFIX = "proposal:";
const OPTIMISTIC_MESSAGE_PREFIX = "temp-message:";

export function isSyntheticProposalMessageId(messageId: string) {
  return messageId.startsWith(SYNTHETIC_PROPOSAL_MESSAGE_PREFIX);
}

export function isOptimisticMessageId(messageId: string) {
  return messageId.startsWith(OPTIMISTIC_MESSAGE_PREFIX);
}
