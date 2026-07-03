import { z } from "zod";
import {
  CHAT_ATTACHMENT_MAX_DURATION_SECONDS,
  CHAT_ATTACHMENT_MAX_SIZE_BYTES,
  CHAT_MAX_ATTACHMENTS,
} from "@/shared/api/api-constraints";
import { attachmentTypeSchema, messageTypeSchema } from "@/shared/schemas";
import { chatAttachmentUrlSchema } from "@/shared/validators/url.validator";

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

export type SendMessagePayload = z.infer<typeof sendMessagePayloadSchema>;
export type UpdateMessagePayload = z.infer<typeof updateMessagePayloadSchema>;
export type ForwardMessagePayload = z.infer<typeof forwardMessagePayloadSchema>;
