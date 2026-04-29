import { z } from "zod";

import {
  activityAccessSchema,
  activityStatusSchema,
  activityVisibilitySchema,
  attachmentTypeSchema,
  chatTypeSchema,
  costTypeSchema,
  forgeModeSchema,
  genderSchema,
  groupRoleSchema,
  groupStatusSchema,
  locationModeSchema,
  messageStatusSchema,
  messageTypeSchema,
  onlineStatusSchema,
  personalityTypeSchema,
  planCategorySchema,
  planStatusSchema,
} from "@/shared/schemas/enums";
import { planProposalSchema } from "@/shared/schemas/plan";

export const activityParticipantSchema = z.object({
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
  onlineStatus: onlineStatusSchema.optional(),
  trustScore: z.number(),
});

export type ActivityParticipant = z.infer<typeof activityParticipantSchema>;

export const activityChatParticipantSchema = z.object({
  userId: z.string(),
  chatId: z.string(),
  user: activityParticipantSchema.optional(),
});

export type ActivityChatParticipant = z.infer<
  typeof activityChatParticipantSchema
>;

export const activityMutualGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
});

export type ActivityMutualGroup = z.infer<typeof activityMutualGroupSchema>;

export const unifiedAttachmentSchema = z.object({
  id: z.string(),
  type: attachmentTypeSchema,
  url: z.string(),
  name: z.string().nullable(),
  size: z.number().nullable(),
  mimeType: z.string().nullable(),
  thumbnailUrl: z.string().nullable(),
  duration: z.number().nullable(),
  waveform: z.array(z.number()),
  createdAt: z.string(),
});

export type UnifiedAttachment = z.infer<typeof unifiedAttachmentSchema>;

export const unifiedReactionSchema = z.object({
  emoji: z.string(),
  createdAt: z.string(),
  messageId: z.string(),
  userId: z.string(),
  user: activityParticipantSchema.optional(),
});

export type UnifiedReaction = z.infer<typeof unifiedReactionSchema>;

export type UnifiedMessage = z.infer<typeof unifiedMessageSchema>;

export const unifiedMessageSchema: z.ZodType<{
  id: string;
  type: z.infer<typeof messageTypeSchema>;
  content: string;
  status: z.infer<typeof messageStatusSchema>;
  isEdited: boolean;
  isPinned: boolean;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  chatId: string;
  senderId: string;
  replyToId: string | null;
  pinnedInChatId?: string | null;
  sender?: ActivityParticipant;
  replyTo?: UnifiedMessage;
  reactions?: UnifiedReaction[];
  attachments?: UnifiedAttachment[];
  isOwn: boolean;
  hasVoted?: boolean;
  isSystem?: boolean;
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: messageTypeSchema,
    content: z.string(),
    status: messageStatusSchema,
    isEdited: z.boolean(),
    isPinned: z.boolean(),
    createdAt: z.string(),
    editedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
    chatId: z.string(),
    senderId: z.string(),
    replyToId: z.string().nullable(),
    pinnedInChatId: z.string().nullable().optional(),
    sender: activityParticipantSchema.optional(),
    replyTo: unifiedMessageSchema.optional(),
    reactions: z.array(unifiedReactionSchema).optional(),
    attachments: z.array(unifiedAttachmentSchema).optional(),
    isOwn: z.boolean(),
    hasVoted: z.boolean().optional(),
    isSystem: z.boolean().optional(),
  }),
);

export const directChatSchema = z.object({
  id: z.string(),
  type: chatTypeSchema,
  createdAt: z.string(),
  groupId: z.string().nullable(),
  participants: z.array(activityChatParticipantSchema).optional(),
  pinnedMessages: z.array(unifiedMessageSchema).optional(),
  isMuted: z.boolean().optional(),
  isBlocked: z.boolean().optional(),
  mutualGroups: z.array(activityMutualGroupSchema).optional(),
});

export type DirectChat = z.infer<typeof directChatSchema>;

export const activitySummarySchema = z.object({
  id: z.string(),
  title: z.string(),
  city: z.string().nullable(),
  status: activityStatusSchema,
  visibility: activityVisibilitySchema,
  access: activityAccessSchema,
  forgeMode: forgeModeSchema,
});

export type ActivitySummary = z.infer<typeof activitySummarySchema>;

export const planSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  category: planCategorySchema,
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  dateTime: z.string().nullable(),
  locationMode: locationModeSchema,
  location: z.string().nullable(),
  locationLat: z.number().nullable(),
  locationLng: z.number().nullable(),
  cost: costTypeSchema,
  costAmount: z.number().nullable(),
  costDetails: z.string().nullable(),
  completedAt: z.string().nullable(),
  cancelledAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  groupId: z.string(),
  proposals: z.array(planProposalSchema).optional(),
});

export type Plan = z.infer<typeof planSchema>;

export const groupMemberSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  compatibilityScore: z.number().nullable(),
  user: activityParticipantSchema.optional(),
});

export type GroupMember = z.infer<typeof groupMemberSchema>;

export const planHistoryItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: planCategorySchema,
  dateTime: z.string().nullable(),
  coverImage: z.string().nullable(),
  status: planStatusSchema,
  location: z.string().optional(),
  rating: z.number().optional(),
});

export type PlanHistoryItem = z.infer<typeof planHistoryItemSchema>;

export const groupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  avatar: z.string().nullable(),
  status: groupStatusSchema,
  maxMembers: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
  disbandedAt: z.string().nullable(),
  activityId: z.string(),
  activity: activitySummarySchema.optional(),
  members: z.array(groupMemberSchema).optional(),
  plan: planSchema.nullable().optional(),
  chat: z
    .object({
      id: z.string(),
      pinnedMessages: z.array(unifiedMessageSchema).optional(),
      mutualGroups: z.array(activityMutualGroupSchema).optional(),
    })
    .optional(),
  planHistory: z.array(planHistoryItemSchema).optional(),
});

export type Group = z.infer<typeof groupSchema>;
