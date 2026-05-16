import { z } from "zod";

import {
  attachmentTypeSchema,
  messageStatusSchema,
  messageTypeSchema,
  planProposalVoteSchema,
} from "@/shared/schemas/enums";
import { planProposalSchema } from "@/shared/schemas/plan";

import {
  type ActivityParticipant,
  activityParticipantSchema,
} from "./activity-participant.schemas";

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
  isSaved?: boolean;
  createdAt: string;
  updatedAt: string;
  editedAt: string | null;
  deletedAt: string | null;
  chatId: string;
  senderId: string;
  replyToId: string | null;
  forwardedFromMessageId?: string | null;
  forwardedFromChatId?: string | null;
  forwardedFromSenderId?: string | null;
  forwardedFromSenderName?: string | null;
  version: number;
  pinnedInChatId?: string | null;
  sender?: ActivityParticipant;
  replyTo?: UnifiedMessage;
  reactions?: UnifiedReaction[];
  attachments?: UnifiedAttachment[];
  isOwn: boolean;
  hasVoted?: boolean;
  isSystem?: boolean;
  proposal?: z.infer<typeof planProposalSchema>;
  proposalEligibleVoterCount?: number;
  proposalVoters?: Array<{
    id: string;
    name: string;
    avatar: string | null;
    vote: z.infer<typeof planProposalVoteSchema>;
  }>;
}> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: messageTypeSchema,
    content: z.string(),
    status: messageStatusSchema,
    isEdited: z.boolean(),
    isPinned: z.boolean(),
    isSaved: z.boolean().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
    editedAt: z.string().nullable(),
    deletedAt: z.string().nullable(),
    chatId: z.string(),
    senderId: z.string(),
    replyToId: z.string().nullable(),
    forwardedFromMessageId: z.string().nullable().optional(),
    forwardedFromChatId: z.string().nullable().optional(),
    forwardedFromSenderId: z.string().nullable().optional(),
    forwardedFromSenderName: z.string().nullable().optional(),
    version: z.number(),
    pinnedInChatId: z.string().nullable().optional(),
    sender: activityParticipantSchema.optional(),
    replyTo: unifiedMessageSchema.optional(),
    reactions: z.array(unifiedReactionSchema).optional(),
    attachments: z.array(unifiedAttachmentSchema).optional(),
    isOwn: z.boolean(),
    hasVoted: z.boolean().optional(),
    isSystem: z.boolean().optional(),
    proposal: planProposalSchema.optional(),
    proposalEligibleVoterCount: z.number().optional(),
    proposalVoters: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          avatar: z.string().nullable(),
          vote: planProposalVoteSchema,
        }),
      )
      .optional(),
  }),
);
