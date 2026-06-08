import {
  flattenMessagePages,
  toUnifiedMessage,
} from "@/features/activity/api/messages/message-mappers";
import { getMessageVersion } from "@/features/activity/api/messages/message-versioning";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import type { MessageApi } from "@/shared/schemas";

import { getMessageCaches } from "./message-cache-primitives";

export function getMessages(chatId: string): UnifiedMessage[] {
  return getMessageCaches(chatId).flatMap(([, data]) =>
    flattenMessagePages(data).map(toUnifiedMessage),
  );
}

export function getLatestCachedMessage(chatId: string) {
  return getMessageCaches(chatId)
    .map(
      ([, data]) =>
        data?.pages.find((page) => page.items.length > 0)?.items[0] ?? null,
    )
    .filter((message): message is MessageApi => message !== null)
    .sort(
      (left, right) => getMessageVersion(right) - getMessageVersion(left),
    )[0];
}
