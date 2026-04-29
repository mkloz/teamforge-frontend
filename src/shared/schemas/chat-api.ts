import { z } from "zod";

import {
  attachmentTypeSchema,
  chatTypeSchema,
  messageStatusSchema,
  messageTypeSchema,
} from "./enums";

export const chatApiSchema = z.object({
  id: z.string(),
  type: chatTypeSchema,
  createdAt: z.string().datetime(),
  groupId: z.string().nullable(),
});

export type ChatApi = z.infer<typeof chatApiSchema>;

export const messageSenderSummarySchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
});

export type MessageSenderSummary = z.infer<typeof messageSenderSummarySchema>;

export const messageReplyPreviewSchema = z.object({
  id: z.string(),
  type: messageTypeSchema,
  senderId: z.string(),
  content: z.string().nullable(),
  deletedAt: z.string().datetime().nullable(),
  sender: messageSenderSummarySchema.nullable().optional(),
});

export type MessageReplyPreview = z.infer<typeof messageReplyPreviewSchema>;

export const messageReactionApiSchema = z.object({
  emoji: z.string(),
  createdAt: z.string().datetime(),
  messageId: z.string(),
  userId: z.string(),
});

export type MessageReactionApi = z.infer<typeof messageReactionApiSchema>;

export const messageAttachmentApiSchema = z.object({
  id: z.string(),
  type: attachmentTypeSchema,
  url: z.string().url(),
  name: z.string().nullable(),
  size: z.number().nullable(),
  mimeType: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  duration: z.number().nullable(),
  waveform: z.array(z.number()),
  createdAt: z.string().datetime(),
});

export type MessageAttachmentApi = z.infer<typeof messageAttachmentApiSchema>;

export const messageApiSchema = z.object({
  id: z.string(),
  type: messageTypeSchema,
  content: z.string(),
  status: messageStatusSchema,
  isEdited: z.boolean(),
  isPinned: z.boolean(),
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
  chatId: z.string(),
  senderId: z.string(),
  replyToId: z.string().nullable(),
  sender: messageSenderSummarySchema.optional(),
  replyTo: messageReplyPreviewSchema.nullable().optional(),
  reactions: z.array(messageReactionApiSchema).optional(),
  attachments: z.array(messageAttachmentApiSchema).optional(),
});

export type MessageApi = z.infer<typeof messageApiSchema>;

export const linkPreviewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  siteName: z.string().optional(),
  favicon: z.string().url().optional(),
});

export type LinkPreview = z.infer<typeof linkPreviewSchema>;
