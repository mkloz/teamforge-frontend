import { toMessageApi } from "@/features/activity/api/messages/message-mappers";
import {
  getMessageVersion,
  shouldReplaceApiMessage,
  shouldReplaceMessage,
} from "@/features/activity/api/messages/message-versioning";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

export function removePinnedUiMessage(
  current: UnifiedMessage[] | undefined,
  messageId: string,
) {
  return current?.filter((item) => item.id !== messageId) ?? [];
}

export function removePinnedApiMessage(
  current: MessageApi[] | undefined,
  messageId: string,
) {
  return current?.filter((item) => item.id !== messageId) ?? [];
}

export function syncPinnedApiMessage(
  current: MessageApi[] | undefined,
  message: UnifiedMessage,
) {
  const messageApi = toMessageApi(message);
  const existing = current?.find((item) => item.id === message.id);
  const nextMessage =
    existing && !shouldReplaceApiMessage(existing, messageApi)
      ? existing
      : messageApi;

  return syncPinnedList(current, message.id, message.isPinned, nextMessage);
}

export function syncPinnedUiMessage(
  current: UnifiedMessage[] | undefined,
  message: UnifiedMessage,
) {
  const existing = current?.find((item) => item.id === message.id);
  const nextMessage =
    existing && !shouldReplaceMessage(existing, message, message.id)
      ? existing
      : message;

  return syncPinnedList(current, message.id, message.isPinned, nextMessage);
}

type VersionedPinnedMessage =
  | Pick<MessageApi, "createdAt" | "id" | "updatedAt" | "version">
  | Pick<UnifiedMessage, "createdAt" | "id" | "updatedAt" | "version">;

function syncPinnedList<T extends VersionedPinnedMessage>(
  current: T[] | undefined,
  messageId: string,
  isPinned: boolean,
  nextMessage: T,
) {
  const withoutExisting =
    current?.filter((item) => item.id !== messageId) ?? [];

  if (!isPinned) {
    return withoutExisting;
  }

  return [nextMessage, ...withoutExisting].sort(
    (left, right) => getMessageVersion(right) - getMessageVersion(left),
  );
}
