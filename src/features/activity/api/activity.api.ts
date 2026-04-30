import {
  apiClient,
  parseJsonWithRequestId,
  type ApiResponseWithRequestId,
} from "@/shared/api/api";
import { FileUploadApi } from "@/shared/api/file-upload";
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
  planSchema,
  planProposalSchema,
  createRatingPayloadSchema,
  createRatingResultSchema,
  ratingEntitySchema,
  type CreateRatingPayload,
} from "@/shared/schemas";
import { z } from "zod";

const DEFAULT_LIMIT = "100";
const DEFAULT_MESSAGE_LIMIT = "50";

const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
const paginatedChatsSchema = createPaginatedSchema(chatApiSchema);
const paginatedFriendshipsSchema = createPaginatedSchema(friendshipApiSchema);
const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
const planProposalsSchema = z.array(planProposalSchema);
const paginatedRatingsSchema = createPaginatedSchema(ratingEntitySchema);
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
const updateGroupPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  avatar: z.string().trim().max(2048).nullable().optional(),
});
const updatePlanPayloadSchema = z.object({
  coverImage: z.string().trim().max(2048).nullable().optional(),
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
export type UpdateGroupPayload = z.infer<typeof updateGroupPayloadSchema>;
export type UpdatePlanPayload = z.infer<typeof updatePlanPayloadSchema>;
export interface GetChatMessagesParams {
  limit?: number;
  page?: number;
}

export type MessageMutationResult = ApiResponseWithRequestId<
  z.infer<typeof messageApiSchema>
>;
export type CreateRatingMutationResult = ApiResponseWithRequestId<
  z.infer<typeof createRatingResultSchema>
>;
export type GroupMutationResult = ApiResponseWithRequestId<
  z.infer<typeof groupApiSchema>
>;
export type InviteMutationResult = ApiResponseWithRequestId<
  z.infer<typeof inviteSchema>
>;
export type FriendshipMutationResult = ApiResponseWithRequestId<
  z.infer<typeof friendshipApiSchema>
>;
export type PlanMutationResult = ApiResponseWithRequestId<
  z.infer<typeof planSchema>
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

  static async updateGroup(
    groupId: string,
    payload: UpdateGroupPayload,
  ): Promise<GroupMutationResult> {
    const response = await apiClient.patch(`groups/${groupId}`, {
      json: updateGroupPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }

  static async updatePlan(
    planId: string,
    payload: UpdatePlanPayload,
  ): Promise<PlanMutationResult> {
    const response = await apiClient.patch(`plans/${planId}`, {
      json: updatePlanPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) => planSchema.parse(value));
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
    const [friendsResponse, blockedResponse] = await Promise.all([
      apiClient
        .get("friends", {
          searchParams: {
            limit: DEFAULT_LIMIT,
          },
        })
        .json<unknown>(),
      apiClient
        .get("friends/blocked", {
          searchParams: {
            limit: DEFAULT_LIMIT,
          },
        })
        .json<unknown>(),
    ]);

    const friends = paginatedFriendshipsSchema.parse(friendsResponse).items;
    const blocked = paginatedFriendshipsSchema.parse(blockedResponse).items;

    return [...friends, ...blocked].sort(
      (left, right) => right.version - left.version,
    );
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
    return FileUploadApi.uploadChatAttachment(file);
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

  static async getGroupRatings(groupId: string) {
    const response = await apiClient
      .get(`ratings/groups/${groupId}`, {
        searchParams: {
          limit: DEFAULT_LIMIT,
        },
      })
      .json<unknown>();

    return paginatedRatingsSchema.parse(response).items;
  }

  static async createRating(payload: CreateRatingPayload) {
    const response = await apiClient.post("ratings", {
      json: createRatingPayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      createRatingResultSchema.parse(value),
    );
  }

  static async leaveGroup(groupId: string) {
    const response = await apiClient.post(`groups/${groupId}/leave`);

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }

  static async removeGroupMember(groupId: string, memberId: string) {
    const response = await apiClient.post(`groups/${groupId}/remove-member`, {
      json: { memberId },
    });

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }

  static async disbandGroup(groupId: string) {
    const response = await apiClient.post(`groups/${groupId}/disband`);

    return parseJsonWithRequestId(response, (value) =>
      groupApiSchema.parse(value),
    );
  }

  static async createInvite(payload: CreateInvitePayload) {
    const response = await apiClient.post("invites", {
      json: createInvitePayloadSchema.parse(payload),
    });

    return parseJsonWithRequestId(response, (value) =>
      inviteSchema.parse(value),
    );
  }

  static async blockUser(userId: string) {
    const response = await apiClient.post(`friends/${userId}/block`);

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }

  static async unblockUser(userId: string) {
    const response = await apiClient.delete(`friends/${userId}/block`);

    return parseJsonWithRequestId(response, (value) =>
      friendshipApiSchema.parse(value),
    );
  }
}
