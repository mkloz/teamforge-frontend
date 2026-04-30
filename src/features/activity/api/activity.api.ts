import {
  apiClient,
  parseJsonWithRequestId,
  type ApiResponseWithRequestId,
} from "@/shared/api/api";
import {
  chatApiSchema,
  createPaginatedSchema,
  friendshipApiSchema,
  groupApiSchema,
  inviteSchema,
  linkPreviewSchema,
  messageApiSchema,
  attachmentTypeSchema,
  messageTypeSchema,
  planProposalSchema,
} from "@/shared/schemas";
import { z } from "zod";

const DEFAULT_LIMIT = "100";
const DEFAULT_MESSAGE_LIMIT = "50";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const paginatedChatsSchema = createPaginatedSchema(chatApiSchema);
const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
const planProposalsSchema = z.array(planProposalSchema);
const uploadedFileUrlSchema = z.object({
  url: z.string().url(),
});
const createInvitePayloadSchema = z.object({
  groupId: z.string().min(1),
  inviteeId: z.string().min(1),
  type: z.enum(["FRIEND_INVITE", "DIRECT_INVITE"]).optional(),
  message: z.string().trim().max(500).optional(),
});

const sendMessageAttachmentSchema = z.object({
  type: attachmentTypeSchema,
  url: z.string().url(),
  name: z.string().optional(),
  size: z.number().int().nonnegative().optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: z.string().url().optional(),
  duration: z.number().int().nonnegative().optional(),
});

const sendMessagePayloadSchema = z.object({
  content: z.string().optional(),
  replyToId: z.string().nullable().optional(),
  type: messageTypeSchema.optional(),
  attachments: z.array(sendMessageAttachmentSchema).optional(),
});
const updateMessagePayloadSchema = z.object({
  content: z.string().trim().min(1),
});
const createReactionPayloadSchema = z.object({
  emoji: z.string().trim().min(1),
});

export interface CreatePlanProposalDto {
  field: "TITLE" | "DESCRIPTION" | "DATE_TIME" | "LOCATION";
  proposedValue: string;
}

export interface VotePlanProposalDto {
  vote: "APPROVE" | "REJECT";
}

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
export type UpdateMessagePayload = z.infer<typeof updateMessagePayloadSchema>;
export type PaginatedMessagesResponse = z.infer<typeof paginatedMessagesSchema>;
export type CreateInvitePayload = z.infer<typeof createInvitePayloadSchema>;
export interface GetChatMessagesParams {
  limit?: number;
  page?: number;
}

export type MessageMutationResult = ApiResponseWithRequestId<
  z.infer<typeof messageApiSchema>
>;

export class ActivityApi {
  static async getGroups() {
    const response = await apiClient
      .get("groups", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedGroupsSchema.parse(response).items;
  }

  static async getGroup(groupId: string) {
    const response = await apiClient.get(`groups/${groupId}`).json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async getChats() {
    const response = await apiClient
      .get("chats", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedChatsSchema.parse(response).items;
  }

  static async getFriendships() {
    const response = await apiClient
      .get("friends", {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedFriendshipsSchema.parse(response).items;
  }

  static async getChatMessages(
    chatId: string,
    {
      limit = Number(DEFAULT_MESSAGE_LIMIT),
      page = 1,
    }: GetChatMessagesParams = {},
  ) {
    const response = await apiClient
      .get(`chats/${chatId}/messages`, {
        searchParams: {
          limit: String(limit),
          page: String(page),
        },
      })
      .json<unknown>();

    return paginatedMessagesSchema.parse(response);
  }

  static async sendMessage(chatId: string, payload: SendMessagePayload) {
    const response = await apiClient.post(`chats/${chatId}/messages`, {
      json: sendMessagePayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      messageApiSchema.parse(value),
    );
  }

  static async updateMessage(
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

  static async deleteMessage(chatId: string, messageId: string) {
    const response = await apiClient
      .delete(`chats/${chatId}/messages/${messageId}`)
      .json<unknown>();

    return messageApiSchema.parse(response);
  }

  static async pinMessage(chatId: string, messageId: string) {
    const response = await apiClient
      .post(`chats/${chatId}/messages/${messageId}/pin`)
      .json<unknown>();

    return messageApiSchema.parse(response);
  }

  static async unpinMessage(chatId: string, messageId: string) {
    const response = await apiClient
      .delete(`chats/${chatId}/messages/${messageId}/pin`)
      .json<unknown>();

    return messageApiSchema.parse(response);
  }

  static async addReaction(chatId: string, messageId: string, emoji: string) {
    const response = await apiClient
      .post(`chats/${chatId}/messages/${messageId}/reactions`, {
        json: createReactionPayloadSchema.parse({ emoji }),
      })
      .json<unknown>();

    return messageApiSchema.parse(response);
  }

  static async removeReaction(
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

  static async markChatRead(chatId: string, messageId?: string | null) {
    const response = await apiClient
      .post(`chats/${chatId}/read`, {
        json: messageId ? { messageId } : {},
      })
      .json<unknown>();

    return chatApiSchema.parse(response);
  }

  static async uploadChatAttachment(file: File) {
    const body = new FormData();
    body.set("file", file);

    const response = await apiClient
      .post("file-upload/chat-attachment", {
        body,
      })
      .json<unknown>();

    return uploadedFileUrlSchema.parse(response);
  }

  static async getLinkPreview(url: string) {
    const response = await apiClient
      .get("chats/link-preview", {
        searchParams: {
          url,
        },
      })
      .json<unknown>();

    return linkPreviewSchema.parse(response);
  }

  static async getPlanProposals(planId: string) {
    const response = await apiClient
      .get(`plans/${planId}/proposals`)
      .json<unknown>();

    return planProposalsSchema.parse(response);
  }

  static async createPlanProposal(
    planId: string,
    payload: CreatePlanProposalDto,
  ) {
    const response = await apiClient
      .post(`plans/${planId}/proposals`, {
        json: payload,
      })
      .json<unknown>();

    return planProposalSchema.parse(response);
  }

  static async votePlanProposal(
    proposalId: string,
    payload: VotePlanProposalDto,
  ) {
    const response = await apiClient
      .post(`proposals/${proposalId}/vote`, {
        json: payload,
      })
      .json<unknown>();

    return planProposalSchema.parse(response);
  }

  static async withdrawPlanProposal(proposalId: string) {
    const response = await apiClient
      .delete(`proposals/${proposalId}`)
      .json<unknown>();

    return planProposalSchema.parse(response);
  }

  static async leaveGroup(groupId: string) {
    const response = await apiClient
      .post(`groups/${groupId}/leave`)
      .json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async removeGroupMember(groupId: string, memberId: string) {
    const response = await apiClient
      .post(`groups/${groupId}/remove-member`, {
        json: { memberId },
      })
      .json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async disbandGroup(groupId: string) {
    const response = await apiClient
      .post(`groups/${groupId}/disband`)
      .json<unknown>();

    return groupApiSchema.parse(response);
  }

  static async createInvite(payload: CreateInvitePayload) {
    const response = await apiClient
      .post("invites", {
        json: createInvitePayloadSchema.parse(payload),
      })
      .json<unknown>();

    return inviteSchema.parse(response);
  }
}
