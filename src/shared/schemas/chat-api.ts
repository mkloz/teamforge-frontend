import { z } from "zod";

import {
  attachmentTypeSchema,
  chatTypeSchema,
  genderSchema,
  groupStatusSchema,
  messageStatusSchema,
  messageTypeSchema,
  onlineStatusSchema,
  personalityTypeSchema,
} from "./enums";

export const chatApiSchema = z.object({
  id: z.string(),
  type: chatTypeSchema,
  createdAt: z.string().datetime(),
  groupId: z.string().nullable(),
  isPinned: z.boolean().optional().default(false),
  isMuted: z.boolean().optional().default(false),
  group: z
    .object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      status: groupStatusSchema,
      activityId: z.string(),
    })
    .nullable()
    .optional(),
  participants: z
    .array(
      z.object({
        userId: z.string(),
        isMuted: z.boolean(),
        isBlocked: z.boolean(),
        isPinned: z.boolean().optional().default(false),
        joinedAt: z.string().datetime(),
        leftAt: z.string().datetime().nullable(),
        lastReadMessageId: z.string().nullable(),
        user: z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().nullable(),
          bio: z.string().nullable().optional(),
          age: z.number().nullable().optional(),
          gender: genderSchema.nullable().optional(),
          city: z.string().nullable().optional(),
          personalityType: personalityTypeSchema.nullable().optional(),
          oceanO: z.number().nullable().optional(),
          oceanC: z.number().nullable().optional(),
          oceanE: z.number().nullable().optional(),
          oceanA: z.number().nullable().optional(),
          oceanN: z.number().nullable().optional(),
          trustScore: z.number().optional(),
          onlineStatus: onlineStatusSchema.optional(),
        }),
      }),
    )
    .optional(),
  counterpart: z
    .object({
      id: z.string(),
      name: z.string(),
      avatar: z.string().nullable(),
      bio: z.string().nullable().optional(),
      age: z.number().nullable().optional(),
      gender: genderSchema.nullable().optional(),
      city: z.string().nullable().optional(),
      personalityType: personalityTypeSchema.nullable().optional(),
      oceanO: z.number().nullable().optional(),
      oceanC: z.number().nullable().optional(),
      oceanE: z.number().nullable().optional(),
      oceanA: z.number().nullable().optional(),
      oceanN: z.number().nullable().optional(),
      trustScore: z.number().optional(),
      onlineStatus: onlineStatusSchema.optional(),
    })
    .nullable()
    .optional(),
  lastMessage: z
    .lazy(() => messageApiSchema)
    .nullable()
    .optional(),
  pinnedMessages: z.array(z.lazy(() => messageApiSchema)).optional(),
  hasUnread: z.boolean().optional(),
  unreadCount: z.number().optional(),
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

export const messageApiSchema = z
  .object({
    id: z.string(),
    type: messageTypeSchema,
    content: z.string(),
    status: messageStatusSchema,
    isEdited: z.boolean(),
    isPinned: z.boolean(),
    isSaved: z.boolean().optional().default(false),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    editedAt: z.string().datetime().nullable(),
    deletedAt: z.string().datetime().nullable(),
    chatId: z.string(),
    senderId: z.string(),
    replyToId: z.string().nullable(),
    forwardedFromMessageId: z.string().nullable().optional(),
    forwardedFromChatId: z.string().nullable().optional(),
    forwardedFromSenderId: z.string().nullable().optional(),
    forwardedFromSenderName: z.string().nullable().optional(),
    version: z.number().optional(),
    sender: messageSenderSummarySchema.optional(),
    replyTo: messageReplyPreviewSchema.nullable().optional(),
    reactions: z.array(messageReactionApiSchema).optional(),
    attachments: z.array(messageAttachmentApiSchema).optional(),
  })
  .transform((message) => {
    const updatedAt = message.updatedAt ?? message.createdAt;

    return {
      ...message,
      updatedAt,
      version: message.version ?? Date.parse(updatedAt),
    };
  });

export type MessageApi = z.infer<typeof messageApiSchema>;

export const savedMessageApiSchema = z.object({
  messageId: z.string(),
  userId: z.string(),
  savedAt: z.string().datetime(),
  chat: z.object({
    id: z.string(),
    type: chatTypeSchema,
    groupId: z.string().nullable(),
  }),
  message: messageApiSchema,
});

export type SavedMessageApi = z.infer<typeof savedMessageApiSchema>;

export const linkPreviewSchema = z.object({
  url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url().optional(),
  siteName: z.string().optional(),
  favicon: z.string().url().optional(),
});

export type LinkPreview = z.infer<typeof linkPreviewSchema>;
