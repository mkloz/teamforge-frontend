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
  costTypeSchema,
  createInvitePayloadSchema,
  createPaginatedSchema,
  createRatingPayloadSchema,
  type DeferGroupReviewPayload,
  deferGroupReviewPayloadSchema,
  friendshipApiSchema,
  groupApiSchema,
  locationModeSchema,
  messageApiSchema,
  messageTypeSchema,
  planCategorySchema,
  planProposalFieldSchema,
  planProposalSchema,
  type planSchema,
  ratingEntitySchema,
  savedMessageApiSchema,
  updateGroupPayloadSchema,
} from "@/shared/schemas";
import {
  chatAttachmentUrlSchema,
  managedAssetReferenceSchema,
} from "@/shared/validators/url.validator";

export const DEFAULT_ACTIVITY_API_LIMIT = "100";
export const DEFAULT_ACTIVITY_API_MESSAGE_LIMIT = "50";

export const paginatedGroupsSchema = createPaginatedSchema(groupApiSchema);
export const paginatedChatsSchema = createPaginatedSchema(chatApiSchema);
export const paginatedFriendshipsSchema =
  createPaginatedSchema(friendshipApiSchema);
export const paginatedMessagesSchema = createPaginatedSchema(messageApiSchema);
export const paginatedSavedMessagesSchema = createPaginatedSchema(
  savedMessageApiSchema,
);
export const planProposalsSchema = z.array(planProposalSchema);
export const paginatedRatingsSchema = createPaginatedSchema(ratingEntitySchema);
export {
  createInvitePayloadSchema,
  createRatingPayloadSchema,
  deferGroupReviewPayloadSchema,
  updateGroupPayloadSchema,
};

const sendMessageAttachmentSchema = z.object({
  type: attachmentTypeSchema,
  url: chatAttachmentUrlSchema,
  name: z.string().optional(),
  size: z
    .number()
    .int()
    .nonnegative()
    .max(CHAT_ATTACHMENT_MAX_SIZE_BYTES)
    .optional(),
  mimeType: z.string().optional(),
  thumbnailUrl: chatAttachmentUrlSchema.optional(),
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

export const forwardMessagePayloadSchema = z.object({
  targetChatId: z.string().trim().min(1).max(128),
});

const updatePlanPayloadBaseSchema = z.object({
  title: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(1000).nullable().optional(),
  category: planCategorySchema.optional(),
  coverImage: managedAssetReferenceSchema.nullable().optional(),
  dateTime: z.string().datetime().nullable().optional(),
  locationMode: locationModeSchema.optional(),
  location: z.string().trim().max(200).nullable().optional(),
  locationLat: z.number().finite().min(-90).max(90).nullable().optional(),
  locationLng: z.number().finite().min(-180).max(180).nullable().optional(),
  cost: costTypeSchema.optional(),
  costAmount: z.number().nonnegative().nullable().optional(),
  costDetails: z.string().trim().max(500).nullable().optional(),
});

type UpdatePlanPayloadInput = z.infer<typeof updatePlanPayloadBaseSchema>;

export const updatePlanPayloadSchema = updatePlanPayloadBaseSchema.superRefine(
  validateUpdatePlanLocationFields,
);

function validateUpdatePlanLocationFields(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  const coordinatePresence = getPlanCoordinatePresence(input);

  validateTbdPlanLocation(input, context);
  validateResolvedPlanLocation(input, context);
  validateCoordinateLocationMode(input, context, coordinatePresence);
  validateCoordinatePair(context, coordinatePresence);
}

function getPlanCoordinatePresence(input: UpdatePlanPayloadInput) {
  return {
    hasLat: hasPlanCoordinate(input.locationLat),
    hasLng: hasPlanCoordinate(input.locationLng),
  };
}

function hasPlanCoordinate(coordinate: number | null | undefined) {
  return coordinate !== undefined && coordinate !== null;
}

function validateTbdPlanLocation(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  if (input.locationMode !== "TBD" || !input.location) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "TBD plans cannot include a location.",
    path: ["location"],
  });
}

function validateResolvedPlanLocation(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
) {
  if (!input.locationMode || input.locationMode === "TBD" || input.location) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "A location is required unless the plan is TBD.",
    path: ["location"],
  });
}

function validateCoordinateLocationMode(
  input: UpdatePlanPayloadInput,
  context: z.RefinementCtx,
  coordinatePresence: ReturnType<typeof getPlanCoordinatePresence>,
) {
  if (allowsPlanCoordinates(input.locationMode)) {
    return;
  }

  if (!hasAnyPlanCoordinate(coordinatePresence)) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "Coordinates are only allowed for in-person plans.",
    path: getCoordinateLocationModeIssuePath(coordinatePresence),
  });
}

function allowsPlanCoordinates(
  locationMode: UpdatePlanPayloadInput["locationMode"],
) {
  return !locationMode || locationMode === "IN_PERSON";
}

function hasAnyPlanCoordinate({
  hasLat,
  hasLng,
}: ReturnType<typeof getPlanCoordinatePresence>) {
  return hasLat || hasLng;
}

function getCoordinateLocationModeIssuePath({
  hasLat,
}: ReturnType<typeof getPlanCoordinatePresence>) {
  return hasLat ? ["locationLat"] : ["locationLng"];
}

function validateCoordinatePair(
  context: z.RefinementCtx,
  { hasLat, hasLng }: ReturnType<typeof getPlanCoordinatePresence>,
) {
  if (hasLat === hasLng) {
    return;
  }

  context.addIssue({
    code: "custom",
    message: "Latitude and longitude must be provided together.",
    path: hasLat ? ["locationLng"] : ["locationLat"],
  });
}

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

export interface SearchChatMessagesParams extends GetChatMessagesParams {
  query: string;
}

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
export type UpdateMessagePayload = z.infer<typeof updateMessagePayloadSchema>;
export type ForwardMessagePayload = z.infer<typeof forwardMessagePayloadSchema>;
export type CreateInvitePayload = z.infer<typeof createInvitePayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof updateGroupPayloadSchema>;
export type UpdatePlanPayload = z.infer<typeof updatePlanPayloadSchema>;
export type CreateGroupPlanPayload = z.infer<typeof updatePlanPayloadSchema>;
export type CreatePlanProposalDto = z.infer<
  typeof createPlanProposalPayloadSchema
>;
export type { CreateRatingPayload, DeferGroupReviewPayload };

export type GroupMutationResult = ApiResponseWithRequestId<
  z.infer<typeof groupApiSchema>
>;
export type PlanMutationResult = ApiResponseWithRequestId<
  z.infer<typeof planSchema>
>;
