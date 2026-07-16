import { z } from "zod";

import { groupRoleSchema } from "@/shared/schemas/enums";

const forgeParticipantSchema = z.object({
  userId: z.string(),
  groupId: z.string(),
  role: groupRoleSchema,
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  sortOrder: z.number().optional(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
});

export type ForgeParticipant = z.infer<typeof forgeParticipantSchema>;
