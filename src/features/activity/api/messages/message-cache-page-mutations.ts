import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { updateMessagesCache } from "./message-cache-primitives";
import type { ActivityMessagesInfiniteData } from "./message-cache-types";
import { toMessageApi } from "./message-mappers";
import { dedupeMessagePages, emptyMessagesPage } from "./message-page-cache";
import { shouldReplaceCachedMessage } from "./message-versioning";

export function insertCachedMessage(chatId: string, message: UnifiedMessage) {
  const messageApi = toMessageApi(message);

  updateMessagesCache(chatId, (current) => {
    const base =
      current ??
      ({
        pages: [emptyMessagesPage()],
        pageParams: [1],
      } satisfies ActivityMessagesInfiniteData);
    const firstPage = base.pages[0] ?? emptyMessagesPage();

    return {
      ...base,
      pages: [
        {
          ...firstPage,
          items: [messageApi, ...firstPage.items],
          meta: {
            ...firstPage.meta,
            totalItemsCount: firstPage.meta.totalItemsCount + 1,
          },
        },
        ...base.pages.slice(1),
      ],
    };
  });
}

export function replaceCachedMessage(
  chatId: string,
  targetId: string,
  replacement: UnifiedMessage,
) {
  const replacementApi = toMessageApi(replacement);

  updateMessagesCache(chatId, (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      pages: dedupeMessagePages(
        current.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === targetId
              ? shouldReplaceCachedMessage(item, replacementApi, targetId)
                ? replacementApi
                : item
              : item,
          ),
        })),
      ),
    };
  });
}

export function removeCachedMessage(chatId: string, messageId: string) {
  updateMessagesCache(chatId, (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      pages: current.pages.map((page) => {
        const nextItems = page.items.filter((item) => item.id !== messageId);
        const removedCount = page.items.length - nextItems.length;

        return {
          ...page,
          items: nextItems,
          meta: {
            ...page.meta,
            totalItemsCount: Math.max(
              0,
              page.meta.totalItemsCount - removedCount,
            ),
          },
        };
      }),
    };
  });
}

export function updateCachedMessageStatus(
  chatId: string,
  targetId: string,
  status: UnifiedMessage["status"],
) {
  updateMessagesCache(chatId, (current) => {
    if (!current) {
      return current;
    }

    return {
      ...current,
      pages: current.pages.map((page) => ({
        ...page,
        items: page.items.map((item) =>
          item.id === targetId ? { ...item, status } : item,
        ),
      })),
    };
  });
}
