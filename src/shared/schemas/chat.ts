import { z } from "zod";
import {
  attachmentTypeSchema,
  chatTypeSchema,
  messageStatusSchema,
  messageTypeSchema,
} from "./enums";
import type { User } from "./user";
import { userSchema } from "./user";

const chatParticipantData = {
  userId: z.string(),
  chatId: z.string(),
};

export type ChatParticipant = z.infer<
  z.ZodObject<typeof chatParticipantData>
> & {
  user?: User;
};

export const chatParticipantSchema: z.ZodSchema<ChatParticipant> = z.lazy(() =>
  z.object(chatParticipantData).extend({
    user: userSchema.optional(),
  }),
);

const reactionData = {
  emoji: z.string(),
  createdAt: z.string().datetime(),
  messageId: z.string(),
  userId: z.string(),
};

export type Reaction = z.infer<z.ZodObject<typeof reactionData>> & {
  user?: User;
};

export const reactionSchema: z.ZodSchema<Reaction> = z.lazy(() =>
  z.object(reactionData).extend({
    user: userSchema.optional(),
  }),
);

const attachmentData = {
  id: z.string(),
  type: attachmentTypeSchema,
  url: z.string(),
  name: z.string().nullable(),
  size: z.number().nullable(),
  mimeType: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  duration: z.number().nullable(),
  waveform: z.array(z.number()),
  createdAt: z.string().datetime(),
};

export type Attachment = z.infer<z.ZodObject<typeof attachmentData>>;

export const attachmentSchema: z.ZodSchema<Attachment> = z.lazy(() =>
  z.object(attachmentData),
);

const messageData = {
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
  forwardedFromMessageId: z.string().nullable().optional(),
  forwardedFromChatId: z.string().nullable().optional(),
  forwardedFromSenderId: z.string().nullable().optional(),
  forwardedFromSenderName: z.string().nullable().optional(),
  pinnedInChatId: z.string().nullable().optional(),
};

export type Message = z.infer<z.ZodObject<typeof messageData>> & {
  sender?: User;
  replyTo?: Message;
  reactions?: Reaction[];
  attachments?: Attachment[];
};

export const messageSchema: z.ZodSchema<Message> = z.lazy(() =>
  z.object(messageData).extend({
    sender: userSchema.optional(),
    replyTo: messageSchema.optional(),
    reactions: z.array(reactionSchema).optional(),
    attachments: z.array(attachmentSchema).optional(),
  }),
);

const chatData = {
  id: z.string(),
  type: chatTypeSchema,
  createdAt: z.string().datetime(),
  groupId: z.string().nullable(),
  notesOwnerId: z.string().nullable().optional(),
};

export type Chat = z.infer<z.ZodObject<typeof chatData>> & {
  participants?: ChatParticipant[];
  messages?: Message[];
  pinnedMessages?: Message[];
  isMuted?: boolean;
  isBlocked?: boolean;
  mutualGroups?: { id: string; name: string; avatar: string | null }[];
};

export const chatSchema: z.ZodSchema<Chat> = z.lazy(() =>
  z.object(chatData).extend({
    participants: z.array(chatParticipantSchema).optional(),
    messages: z.array(messageSchema).optional(),
    pinnedMessages: z.array(messageSchema).optional(),
    isMuted: z.boolean().optional(),
    isBlocked: z.boolean().optional(),
  }),
);
