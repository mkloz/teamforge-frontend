import { z } from "zod";

export const authSessionSchema = z.object({
  id: z.string(),
  userAgent: z.string().nullable(),
  ipAddress: z.string().nullable(),
  createdAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
  isCurrent: z.boolean(),
});

export type AuthSession = z.infer<typeof authSessionSchema>;

export const authSessionListSchema = z.object({
  items: z.array(authSessionSchema),
});

export type AuthSessionList = z.infer<typeof authSessionListSchema>;
