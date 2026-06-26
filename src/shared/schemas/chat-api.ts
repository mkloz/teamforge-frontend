import { z } from "zod";

import {
  userIdentitySummaryFields,
  userOptionalPersonalityTypeField,
  userOptionalTrustScoreField,
  userPersonalityScoreFields,
  userPresenceFields,
  userProfileSummaryFields,
} from "./entity-fragments";
import { chatTypeSchema, groupStatusSchema, messageTypeSchema } from "./enums";
import {
  messageApiCoreFields,
  messageAttachmentApiFields,
} from "./message-fragments";

const chatUserSummarySchema = z.object({
  ...userIdentitySummaryFields,
  ...userProfileSummaryFields,
  ...userOptionalPersonalityTypeField,
  ...userPersonalityScoreFields,
  ...userOptionalTrustScoreField,
  ...userPresenceFields,
});

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
        user: chatUserSummarySchema,
      }),
    )
    .optional(),
  counterpart: chatUserSummarySchema.nullable().optional(),
  lastMessage: z
    .lazy(() => messageApiSchema)
    .nullable()
    .optional(),
  pinnedMessages: z.array(z.lazy(() => messageApiSchema)).optional(),
  hasUnread: z.boolean().optional(),
  unreadCount: z.number().optional(),
});

export type ChatApi = z.infer<typeof chatApiSchema>;

const messageSenderSummarySchema = z.object(userIdentitySummaryFields);

export type MessageSenderSummary = z.infer<typeof messageSenderSummarySchema>;

const messageReplyPreviewSchema = z.object({
  id: z.string(),
  type: messageTypeSchema,
  senderId: z.string(),
  content: z.string().nullable(),
  deletedAt: z.string().datetime().nullable(),
  sender: messageSenderSummarySchema.nullable().optional(),
});

export type MessageReplyPreview = z.infer<typeof messageReplyPreviewSchema>;

const messageReactionApiSchema = z.object({
  emoji: z.string(),
  createdAt: z.string().datetime(),
  messageId: z.string(),
  userId: z.string(),
});

const messageAttachmentApiSchema = z.object({
  ...messageAttachmentApiFields,
  url: z.string().url(),
});

export const messageApiSchema = z
  .object({
    ...messageApiCoreFields,
    isSaved: z.boolean().optional().default(false),
    updatedAt: z.string().datetime().optional(),
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
