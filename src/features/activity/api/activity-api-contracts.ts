import type { ApiResponseWithRequestId } from "@/shared/api/api";
import {
  attachmentTypeSchema,
  chatApiSchema,
  createPaginatedSchema,
  createRatingPayloadSchema,
  createRatingResultSchema,
  friendshipApiSchema,
  groupApiSchema,
  inviteSchema,
  messageApiSchema,
  messageTypeSchema,
  planProposalSchema,
  planSchema,
  ratingEntitySchema,
  type CreateRatingPayload,
} from "@/shared/schemas";
import { z } from "zod";

export const DEFAULT_ACTIVITY_API_LIMIT = "100";
export const DEFAULT_ACTIVITY_API_MESSAGE_LIMIT = "50";

export const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
export const paginatedChatsSchema = createPaginatedSchema(chatApiSchema);
export const paginatedFriendshipsSchema =
  createPaginatedSchema(friendshipApiSchema);
export const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
export const planProposalsSchema = z.array(planProposalSchema);
export const paginatedRatingsSchema = createPaginatedSchema(ratingEntitySchema);
export { createRatingPayloadSchema };

export const createInvitePayloadSchema = z.object({
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

export const sendMessagePayloadSchema = z.object({
  content: z.string().optional(),
  replyToId: z.string().nullable().optional(),
  type: messageTypeSchema.optional(),
  attachments: z.array(sendMessageAttachmentSchema).optional(),
});

export const updateMessagePayloadSchema = z.object({
  content: z.string().trim().min(1),
});

export const createReactionPayloadSchema = z.object({
  emoji: z.string().trim().min(1),
});

export const updateGroupPayloadSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  avatar: z.string().trim().max(2048).nullable().optional(),
});

export const updatePlanPayloadSchema = z.object({
  coverImage: z.string().trim().max(2048).nullable().optional(),
});

export interface CreatePlanProposalDto {
  field: "TITLE" | "DESCRIPTION" | "DATE_TIME" | "LOCATION";
  proposedValue: string;
}

export interface VotePlanProposalDto {
  vote: "APPROVE" | "REJECT";
}

export interface GetChatMessagesParams {
  limit?: number;
  page?: number;
}

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
export type UpdateMessagePayload = z.infer<typeof updateMessagePayloadSchema>;
export type PaginatedMessagesResponse = z.infer<typeof paginatedMessagesSchema>;
export type CreateInvitePayload = z.infer<typeof createInvitePayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof updateGroupPayloadSchema>;
export type UpdatePlanPayload = z.infer<typeof updatePlanPayloadSchema>;
export type { CreateRatingPayload };

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
