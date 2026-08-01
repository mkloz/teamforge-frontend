import { z } from "zod";

import { groupRoleSchema } from "@/shared/schemas/enums";

const forgeParticipantSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  compatibilityScore: z.number().nullable().optional(),
  sortOrder: z.number().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
    trustScore: z.number().nullable().optional(),
  }),
});

export type ForgeParticipant = z.infer<typeof forgeParticipantSchema>;

export const friendCompatibilityPreviewSchema = z.object({
  items: z.array(
    z.object({
      groupFit: z.number().min(0).max(100).nullable(),
      personalFit: z.number().min(0).max(100).nullable(),
      userId: z.string(),
    }),
  ),
});

export type FriendCompatibilityPreview = z.infer<
  typeof friendCompatibilityPreviewSchema
>["items"][number];
