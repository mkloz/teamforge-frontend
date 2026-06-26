import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

const TEMP_MESSAGE_ID_PREFIX = "temp-message:";

export function getMessageVersion(
  message:
    | Pick<MessageApi, "createdAt" | "updatedAt" | "version">
    | Pick<UnifiedMessage, "createdAt" | "updatedAt" | "version">,
) {
  return (
    message.version ??
    new Date(message.updatedAt ?? message.createdAt).getTime()
  );
}

export function shouldReplaceApiMessage(
  current: MessageApi | null | undefined,
  incoming: MessageApi,
) {
  if (!current) {
    return true;
  }

  return getMessageVersion(incoming) >= getMessageVersion(current);
}

export function shouldReplaceMessage(
  current: UnifiedMessage,
  incoming: UnifiedMessage,
  targetId: string,
) {
  if (isTempMessageId(targetId)) {
    return true;
  }

  if (shouldPromoteTempMessage(current.id, incoming.id)) {
    return true;
  }

  return getMessageVersion(incoming) >= getMessageVersion(current);
}

export function shouldReplaceCachedMessage(
  current: MessageApi,
  incoming: MessageApi,
  targetId: string,
) {
  if (isTempMessageId(targetId)) {
    return true;
  }

  if (shouldPromoteTempMessage(current.id, incoming.id)) {
    return true;
  }

  return shouldReplaceApiMessage(current, incoming);
}

export function pickNewerApiMessage(
  current: MessageApi | null | undefined,
  incoming: MessageApi | null | undefined,
) {
  if (!current) {
    return incoming ?? null;
  }

  if (!incoming) {
    return current;
  }

  return shouldReplaceApiMessage(current, incoming) ? incoming : current;
}

export function mergePinnedApiMessages(
  current: MessageApi[] | undefined,
  incoming: MessageApi[] | undefined,
) {
  if (!current?.length) {
    return incoming;
  }

  if (!incoming?.length) {
    return current;
  }

  const merged = createPinnedMessageMap(current);
  mergeIncomingPinnedMessages(merged, incoming);

  return [...merged.values()].sort(
    (left, right) => getMessageVersion(right) - getMessageVersion(left),
  );
}

function isTempMessageId(messageId: string) {
  return messageId.startsWith(TEMP_MESSAGE_ID_PREFIX);
}

function shouldPromoteTempMessage(currentId: string, incomingId: string) {
  return isTempMessageId(currentId) && !isTempMessageId(incomingId);
}

function createPinnedMessageMap(messages: MessageApi[]) {
  const merged = new Map<string, MessageApi>();

  for (const item of messages) {
    merged.set(item.id, item);
  }

  return merged;
}

function mergeIncomingPinnedMessages(
  merged: Map<string, MessageApi>,
  incoming: MessageApi[],
) {
  for (const item of incoming) {
    merged.set(item.id, getPinnedMessageMergeValue(merged.get(item.id), item));
  }
}

function getPinnedMessageMergeValue(
  existing: MessageApi | undefined,
  incoming: MessageApi,
) {
  return existing && !shouldReplaceApiMessage(existing, incoming)
    ? existing
    : incoming;
}
