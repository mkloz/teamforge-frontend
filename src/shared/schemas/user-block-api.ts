import { z } from "zod";

export const userBlockApiSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  blockedAt: z.string().datetime(),
});

export type UserBlockApi = z.infer<typeof userBlockApiSchema>;
