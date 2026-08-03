import { z } from "zod";
import { groupStatusSchema } from "@/shared/schemas/enums";

export const groupLifecycleSchema = z.object({
  groupId: z.string(),
  status: groupStatusSchema,
  revision: z.number().int().positive(),
  isDormant: z.boolean(),
  isReadOnly: z.boolean(),
  activePlanBlocksArchive: z.boolean(),
  lastMeaningfulActivityAt: z.string().datetime().nullable(),
  archivedAt: z.string().datetime().nullable(),
  archiveReason: z.string().nullable(),
  capabilities: z.object({
    canArchive: z.boolean(),
    canRestore: z.boolean(),
    canTransferOwnership: z.boolean(),
  }),
});

export type GroupLifecycle = z.infer<typeof groupLifecycleSchema>;
