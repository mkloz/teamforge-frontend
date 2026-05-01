import type { InfiniteData } from "@tanstack/react-query";

import { appQueryClient } from "@/shared/api/query-client";
import { APP_QUERY_KEYS } from "@/shared/api/query-keys";
import type { ChatApi, MessageApi, Paginated } from "@/shared/schemas";

import { ACTIVITY_CHATS_QUERY_KEY } from "./activity-query-keys";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

export const DEFAULT_ACTIVITY_MESSAGE_LIMIT = 50;

export type ActivityMessagesPageData = Paginated<MessageApi>;

export type ActivityMessagesInfiniteData = InfiniteData<
  ActivityMessagesPageData,
  unknown
>;

export function flattenMessagePages(
  data: ActivityMessagesInfiniteData | undefined,
): MessageApi[] {
  if (!data) {
    return [];
  }

  return [...data.pages]
    .reverse()
    .flatMap((page: ActivityMessagesPageData) => [...page.items].reverse());
}

export function toMessageApi(message: UnifiedMessage): MessageApi {
  return {
    id: message.id,
    type: message.type,
    content: message.content,
    status: message.status,
    isEdited: message.isEdited,
    isPinned: message.isPinned,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    version: message.version,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
        }
      : undefined,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          type: message.replyTo.type,
          senderId: message.replyTo.senderId,
          content: message.replyTo.content,
          deletedAt: message.replyTo.deletedAt,
          sender: message.replyTo.sender
            ? {
                id: message.replyTo.sender.id,
                name: message.replyTo.sender.name,
                avatar: message.replyTo.sender.avatar,
              }
            : undefined,
        }
      : undefined,
    reactions:
      message.reactions?.map((reaction) => ({
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        messageId: reaction.messageId,
        userId: reaction.userId,
      })) ?? [],
    attachments:
      message.attachments?.map((attachment) => ({
        id: attachment.id,
        type: attachment.type,
        url: attachment.url,
        name: attachment.name ?? null,
        size: attachment.size ?? null,
        mimeType: attachment.mimeType ?? null,
        thumbnailUrl: attachment.thumbnailUrl ?? null,
        duration: attachment.duration ?? null,
        waveform: attachment.waveform,
        createdAt: attachment.createdAt,
      })) ?? [],
  };
}

function toUnifiedMessage(message: MessageApi): UnifiedMessage {
  return {
    id: message.id,
    type: message.type,
    content: message.content,
    status: message.status,
    isEdited: message.isEdited,
    isPinned: message.isPinned,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    chatId: message.chatId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    version: message.version,
    sender: message.sender
      ? {
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
          trustScore: 0,
        }
      : undefined,
    replyTo: message.replyTo
      ? {
          id: message.replyTo.id,
          type: message.replyTo.type,
          content: message.replyTo.content ?? "Message unavailable",
          status: "SENT",
          isEdited: false,
          isPinned: false,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt,
          editedAt: null,
          deletedAt: message.replyTo.deletedAt,
          chatId: message.chatId,
          senderId: message.replyTo.senderId,
          replyToId: null,
          version: 0,
          sender: message.replyTo.sender
            ? {
                id: message.replyTo.sender.id,
                name: message.replyTo.sender.name,
                avatar: message.replyTo.sender.avatar,
                trustScore: 0,
              }
            : undefined,
          isOwn: false,
          isSystem: message.replyTo.type === "SYSTEM",
          reactions: [],
          attachments: [],
        }
      : undefined,
    reactions:
      message.reactions?.map((reaction) => ({
        emoji: reaction.emoji,
        createdAt: reaction.createdAt,
        messageId: reaction.messageId,
        userId: reaction.userId,
      })) ?? [],
    attachments: message.attachments ?? [],
    isOwn: false,
    isSystem: message.type === "SYSTEM",
  };
}

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

function shouldReplaceCachedMessage(
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

function normalizeMessageContent(content: string) {
  return content.trim().replace(/\s+/g, " ");
}

function createAttachmentSignature(
  attachments:
    | UnifiedMessage["attachments"]
    | MessageApi["attachments"]
    | undefined,
) {
  return (attachments ?? [])
    .map((attachment) =>
      [
        attachment.type,
        attachment.name ?? "",
        attachment.size ?? "",
        attachment.mimeType ?? "",
        attachment.duration ?? "",
      ].join(":"),
    )
    .join("|");
}

function areMessagesEquivalent(
  optimisticMessage: UnifiedMessage,
  incomingMessage: UnifiedMessage,
) {
  if (
    optimisticMessage.chatId !== incomingMessage.chatId ||
    optimisticMessage.senderId !== incomingMessage.senderId ||
    optimisticMessage.type !== incomingMessage.type ||
    optimisticMessage.replyToId !== incomingMessage.replyToId
  ) {
    return false;
  }

  if (
    normalizeMessageContent(optimisticMessage.content) !==
    normalizeMessageContent(incomingMessage.content)
  ) {
    return false;
  }

  if (
    createAttachmentSignature(optimisticMessage.attachments) !==
    createAttachmentSignature(incomingMessage.attachments)
  ) {
    return false;
  }

  return (
    Math.abs(
      new Date(incomingMessage.createdAt).getTime() -
        new Date(optimisticMessage.createdAt).getTime(),
    ) <
    2 * 60 * 1000
  );
}

export function findMatchingOptimisticMessage(
  messages: UnifiedMessage[],
  incomingMessage: UnifiedMessage,
) {
  return messages
    .filter(
      (message) =>
        message.id.startsWith("temp-message:") &&
        message.status === "SENDING" &&
        areMessagesEquivalent(message, incomingMessage),
    )
    .sort(
      (left, right) =>
        Math.abs(
          new Date(incomingMessage.createdAt).getTime() -
            new Date(left.createdAt).getTime(),
        ) -
        Math.abs(
          new Date(incomingMessage.createdAt).getTime() -
            new Date(right.createdAt).getTime(),
        ),
    )[0];
}

function emptyMessagesPage(): ActivityMessagesPageData {
  return {
    items: [],
    meta: {
      totalItemsCount: 0,
      itemsPerPage: DEFAULT_ACTIVITY_MESSAGE_LIMIT,
      currentPage: 1,
      totalPages: 1,
    },
  };
}

function dedupeMessagePages(pages: ActivityMessagesPageData[]) {
  const seen = new Set<string>();

  return pages.map((page) => {
    const dedupedItems = page.items.filter((item) => {
      if (seen.has(item.id)) {
        return false;
      }

      seen.add(item.id);
      return true;
    });
    const removedCount = page.items.length - dedupedItems.length;

    if (removedCount === 0) {
      return page;
    }

    return {
      ...page,
      items: dedupedItems,
      meta: {
        ...page.meta,
        totalItemsCount: Math.max(0, page.meta.totalItemsCount - removedCount),
      },
    };
  });
}

export const ActivityMessageCache = {
  getMessages(chatId: string) {
    return this.getMessageCaches(chatId).flatMap(([, data]) =>
      flattenMessagePages(data).map(toUnifiedMessage),
    );
  },

  insert(chatId: string, message: UnifiedMessage) {
    const messageApi = toMessageApi(message);

    this.updateMessagesCache(chatId, (current) => {
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
  },

  replace(chatId: string, targetId: string, replacement: UnifiedMessage) {
    const replacementApi = toMessageApi(replacement);

    this.updateMessagesCache(chatId, (current) => {
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
  },

  remove(chatId: string, messageId: string) {
    this.updateMessagesCache(chatId, (current) => {
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
  },

  syncChatLastMessageFromMessagesCache(chatId: string) {
    const latestMessage = this.getLatestCachedMessage(chatId);

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: latestMessage,
              }
            : chat,
        ) ?? current,
    );
  },

  updateStatus(
    chatId: string,
    targetId: string,
    status: UnifiedMessage["status"],
  ) {
    this.updateMessagesCache(chatId, (current) => {
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
  },

  getMessageCaches(chatId: string) {
    return appQueryClient.getQueriesData<ActivityMessagesInfiniteData>({
      queryKey: APP_QUERY_KEYS.activity.messages(chatId),
    });
  },

  getLatestCachedMessage(chatId: string) {
    return this.getMessageCaches(chatId)
      .map(
        ([, data]) =>
          data?.pages.find((page) => page.items.length > 0)?.items[0] ?? null,
      )
      .filter((message): message is MessageApi => message !== null)
      .sort(
        (left, right) => getMessageVersion(right) - getMessageVersion(left),
      )[0];
  },

  updateMessagesCache(
    chatId: string,
    updater: (
      data: ActivityMessagesInfiniteData | undefined,
    ) => ActivityMessagesInfiniteData | undefined,
  ) {
    appQueryClient.setQueriesData<ActivityMessagesInfiniteData>(
      {
        queryKey: APP_QUERY_KEYS.activity.messages(chatId),
      },
      (current) => updater(current),
    );
  },
};
