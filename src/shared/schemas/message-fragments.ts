import { z } from "zod";

import {
  attachmentTypeSchema,
  messageStatusSchema,
  messageTypeSchema,
} from "./enums";

export const messageAttachmentCoreFields = {
  id: z.string(),
  type: attachmentTypeSchema,
  url: z.string(),
  name: z.string().nullable(),
  size: z.number().nullable(),
  mimeType: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  duration: z.number().nullable(),
  waveform: z.array(z.number()),
};

export const messageAttachmentApiFields = {
  ...messageAttachmentCoreFields,
  createdAt: z.string().datetime(),
};

export const messageContentFields = {
  id: z.string(),
  type: messageTypeSchema,
  content: z.string(),
  status: messageStatusSchema,
  isEdited: z.boolean(),
  isPinned: z.boolean(),
};

export const messageThreadFields = {
  chatId: z.string(),
  senderId: z.string(),
  replyToId: z.string().nullable(),
  forwardedFromMessageId: z.string().nullable().optional(),
  forwardedFromChatId: z.string().nullable().optional(),
  forwardedFromSenderId: z.string().nullable().optional(),
  forwardedFromSenderName: z.string().nullable().optional(),
};

const messageLifecycleDateTimeFields = {
  createdAt: z.string().datetime(),
  editedAt: z.string().datetime().nullable(),
  deletedAt: z.string().datetime().nullable(),
};

export const messageApiCoreFields = {
  ...messageContentFields,
  ...messageLifecycleDateTimeFields,
  ...messageThreadFields,
};
