import {
  createReactionPayloadSchema,
  DEFAULT_ACTIVITY_API_LIMIT,
  DEFAULT_ACTIVITY_API_MESSAGE_LIMIT,
  type ForwardMessagePayload,
  forwardMessagePayloadSchema,
  type GetChatMessagesParams,
  paginatedChatsSchema,
  paginatedMessagesSchema,
  paginatedSavedMessagesSchema,
  type SearchChatMessagesParams,
  type SendMessagePayload,
  sendMessagePayloadSchema,
  type UpdateMessagePayload,
  updateMessagePayloadSchema,
} from "@/features/activity/api/activity-api-contracts";
import { apiClient, parseJsonWithRequestId } from "@/shared/api/api";
import { clampApiLimit, clampApiPage } from "@/shared/api/api-constraints";
import { FileUploadApi } from "@/shared/api/file-upload";
import {
  chatApiSchema,
  linkPreviewSchema,
  messageApiSchema,
} from "@/shared/schemas";
import { publicHttpUrlSchema } from "@/shared/validators/url.validator";

export async function getChats() {
  const response = await apiClient
    .get("chats", {
      searchParams: {
        limit: DEFAULT_ACTIVITY_API_LIMIT,
      },
    })
    .json<unknown>();

  return paginatedChatsSchema.parse(response).items;
}

export async function getChatMessages(
  chatId: string,
  {
    limit = Number(DEFAULT_ACTIVITY_API_MESSAGE_LIMIT),
    page = 1,
  }: GetChatMessagesParams = {},
) {
  const response = await apiClient
    .get(`chats/${chatId}/messages`, {
      searchParams: {
        limit: String(clampApiLimit(limit)),
        page: String(clampApiPage(page)),
      },
    })
    .json<unknown>();

  return paginatedMessagesSchema.parse(response);
}

export async function getSavedMessages({
  limit = Number(DEFAULT_ACTIVITY_API_LIMIT),
  page = 1,
}: GetChatMessagesParams = {}) {
  const response = await apiClient
    .get("chats/saved-messages", {
      searchParams: {
        limit: String(clampApiLimit(limit)),
        page: String(clampApiPage(page)),
      },
    })
    .json<unknown>();

  return paginatedSavedMessagesSchema.parse(response).items;
}

export async function searchChatMessages(
  chatId: string,
  {
    limit = Number(DEFAULT_ACTIVITY_API_MESSAGE_LIMIT),
    page = 1,
    query,
  }: SearchChatMessagesParams,
) {
  const response = await apiClient
    .get(`chats/${chatId}/messages/search`, {
      searchParams: {
        limit: String(clampApiLimit(limit)),
        page: String(clampApiPage(page)),
        query,
      },
    })
    .json<unknown>();

  return paginatedMessagesSchema.parse(response);
}

export async function sendMessage(chatId: string, payload: SendMessagePayload) {
  const response = await apiClient.post(`chats/${chatId}/messages`, {
    json: sendMessagePayloadSchema.parse(payload),
  });

  return parseJsonWithRequestId(response, (value) =>
    messageApiSchema.parse(value),
  );
}

export async function updateMessage(
  chatId: string,
  messageId: string,
  payload: UpdateMessagePayload,
) {
  const response = await apiClient.patch(
    `chats/${chatId}/messages/${messageId}`,
    {
      json: updateMessagePayloadSchema.parse(payload),
    },
  );

  return parseJsonWithRequestId(response, (value) =>
    messageApiSchema.parse(value),
  );
}

export async function deleteMessage(chatId: string, messageId: string) {
  const response = await apiClient
    .delete(`chats/${chatId}/messages/${messageId}`)
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function pinMessage(chatId: string, messageId: string) {
  const response = await apiClient
    .post(`chats/${chatId}/messages/${messageId}/pin`)
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function unpinMessage(chatId: string, messageId: string) {
  const response = await apiClient
    .delete(`chats/${chatId}/messages/${messageId}/pin`)
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function pinChat(chatId: string) {
  const response = await apiClient.post(`chats/${chatId}/pin`).json<unknown>();

  return chatApiSchema.parse(response);
}

export async function unpinChat(chatId: string) {
  const response = await apiClient
    .delete(`chats/${chatId}/pin`)
    .json<unknown>();

  return chatApiSchema.parse(response);
}

export async function muteChat(chatId: string) {
  const response = await apiClient.post(`chats/${chatId}/mute`).json<unknown>();

  return chatApiSchema.parse(response);
}

export async function unmuteChat(chatId: string) {
  const response = await apiClient
    .delete(`chats/${chatId}/mute`)
    .json<unknown>();

  return chatApiSchema.parse(response);
}

export async function saveMessage(chatId: string, messageId: string) {
  const response = await apiClient
    .post(`chats/${chatId}/messages/${messageId}/save`)
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function unsaveMessage(chatId: string, messageId: string) {
  const response = await apiClient
    .delete(`chats/${chatId}/messages/${messageId}/save`)
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function forwardMessage(
  chatId: string,
  messageId: string,
  payload: ForwardMessagePayload,
) {
  const response = await apiClient.post(
    `chats/${chatId}/messages/${messageId}/forward`,
    {
      json: forwardMessagePayloadSchema.parse(payload),
    },
  );

  return parseJsonWithRequestId(response, (value) =>
    messageApiSchema.parse(value),
  );
}

export async function addReaction(
  chatId: string,
  messageId: string,
  emoji: string,
) {
  const response = await apiClient
    .post(`chats/${chatId}/messages/${messageId}/reactions`, {
      json: createReactionPayloadSchema.parse({ emoji }),
    })
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function removeReaction(
  chatId: string,
  messageId: string,
  emoji: string,
) {
  const response = await apiClient
    .delete(`chats/${chatId}/messages/${messageId}/reactions`, {
      searchParams: { emoji },
    })
    .json<unknown>();

  return messageApiSchema.parse(response);
}

export async function markChatRead(chatId: string, messageId?: string | null) {
  const response = await apiClient
    .post(`chats/${chatId}/read`, {
      json: messageId ? { messageId } : {},
    })
    .json<unknown>();

  return chatApiSchema.parse(response);
}

export async function uploadChatAttachment(file: File) {
  return FileUploadApi.uploadChatAttachment(file);
}

export async function getLinkPreview(url: string) {
  const previewUrl = publicHttpUrlSchema.parse(url);
  const response = await apiClient
    .get("chats/link-preview", {
      searchParams: {
        url: previewUrl,
      },
    })
    .json<unknown>();

  return linkPreviewSchema.parse(response);
}
