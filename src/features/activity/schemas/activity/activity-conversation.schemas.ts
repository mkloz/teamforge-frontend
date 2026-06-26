import { z } from "zod";

import { chatTypeSchema } from "@/shared/schemas/enums";
import { unifiedMessageSchema } from "./activity-message.schemas";
import { activityParticipantSchema } from "./activity-participant.schemas";

const activityChatParticipantSchema = z.object({
  userId: z.string(),
  chatId: z.string(),
  lastReadMessageId: z.string().nullable().optional(),
  user: activityParticipantSchema.optional(),
});

export const activityMutualGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
});

const directChatSchema = z.object({
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
