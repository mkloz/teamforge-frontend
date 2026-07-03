import type { z } from "zod";
import type {
  createInvitePayloadSchema,
  updateGroupPayloadSchema,
} from "@/shared/schemas";

export type CreateInvitePayload = z.infer<typeof createInvitePayloadSchema>;
export type UpdateGroupPayload = z.infer<typeof updateGroupPayloadSchema>;
