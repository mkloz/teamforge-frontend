import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

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
  if (targetId.startsWith("temp-message:")) {
    return true;
  }

  if (
    current.id.startsWith("temp-message:") &&
    !incoming.id.startsWith("temp-message:")
  ) {
    return true;
  }

  return getMessageVersion(incoming) >= getMessageVersion(current);
}

export function shouldReplaceCachedMessage(
  current: MessageApi,
  incoming: MessageApi,
  targetId: string,
) {
  if (targetId.startsWith("temp-message:")) {
    return true;
  }

  if (
    current.id.startsWith("temp-message:") &&
    !incoming.id.startsWith("temp-message:")
  ) {
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

  const merged = new Map<string, MessageApi>();

  for (const item of current) {
    merged.set(item.id, item);
  }

  for (const item of incoming) {
    const existing = merged.get(item.id);
    merged.set(
      item.id,
      existing && !shouldReplaceApiMessage(existing, item) ? existing : item,
    );
  }

  return [...merged.values()].sort(
    (left, right) => getMessageVersion(right) - getMessageVersion(left),
  );
}
