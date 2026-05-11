import { z } from "zod";
import type { ApiResponseWithRequestId } from "@/shared/api/api";
import {
  CHAT_ATTACHMENT_MAX_DURATION_SECONDS,
  CHAT_ATTACHMENT_MAX_SIZE_BYTES,
  CHAT_MAX_ATTACHMENTS,
} from "@/shared/api/api-constraints";
import {
  attachmentTypeSchema,
  type CreateRatingPayload,
  chatApiSchema,
  createPaginatedSchema,
  createRatingPayloadSchema,
  type createRatingResultSchema,
  friendshipApiSchema,
  groupApiSchema,
  type inviteSchema,
  locationModeSchema,
  messageApiSchema,
  messageTypeSchema,
  planProposalFieldSchema,
  planProposalSchema,
  type planSchema,
  ratingEntitySchema,
} from "@/shared/schemas";
import {
  managedAssetReferenceSchema,
  managedUploadUrlSchema,
} from "@/shared/validators/url.validator";

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
  url: managedUploadUrlSchema,
  name: z.string().optional(),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(CHAT_ATTACHMENT_MAX_SIZE_BYTES)
    .optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: managedUploadUrlSchema.optional(),
  duration: z
    .number()
    .int()
    .nonnegative()
    .max(CHAT_ATTACHMENT_MAX_DURATION_SECONDS)
    .optional(),
});

export const sendMessagePayloadSchema = z.object({
  content: z.string().optional(),
  replyToId: z.string().max(128).nullable().optional(),
  type: messageTypeSchema.optional(),
  attachments: z
    .array(sendMessageAttachmentSchema)
    .max(CHAT_MAX_ATTACHMENTS)
    .optional(),
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
  avatar: managedUploadUrlSchema.nullable().optional(),
});

export const updatePlanPayloadSchema = z
  .object({
    coverImage: managedAssetReferenceSchema.nullable().optional(),
    locationMode: locationModeSchema.optional(),
    location: z.string().trim().max(200).nullable().optional(),
    locationLat: z.number().finite().min(-90).max(90).nullable().optional(),
    locationLng: z.number().finite().min(-180).max(180).nullable().optional(),
  })
  .superRefine((input, context) => {
    const hasLat =
      input.locationLat !== undefined && input.locationLat !== null;
    const hasLng =
      input.locationLng !== undefined && input.locationLng !== null;

    if (input.locationMode === "TBD" && input.location) {
      context.addIssue({
        code: "custom",
        message: "TBD plans cannot include a location.",
        path: ["location"],
      });
    }

    if (input.locationMode && input.locationMode !== "TBD" && !input.location) {
      context.addIssue({
        code: "custom",
        message: "A location is required unless the plan is TBD.",
        path: ["location"],
      });
    }

    if (
      input.locationMode &&
      input.locationMode !== "IN_PERSON" &&
      (hasLat || hasLng)
    ) {
      context.addIssue({
        code: "custom",
        message: "Coordinates are only allowed for in-person plans.",
        path: hasLat ? ["locationLat"] : ["locationLng"],
      });
    }

    if (hasLat !== hasLng) {
      context.addIssue({
        code: "custom",
        message: "Latitude and longitude must be provided together.",
        path: hasLat ? ["locationLng"] : ["locationLat"],
      });
    }
  });

export const createPlanProposalPayloadSchema = z.object({
  field: planProposalFieldSchema,
  proposedValue: z.string().trim().min(1),
});

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
export type CreatePlanProposalDto = z.infer<
  typeof createPlanProposalPayloadSchema
>;
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
