import { z } from "zod";

export const webPushPublicKeyStateSchema = z.object({
  enabled: z.boolean(),
  publicKey: z.string(),
});

export type WebPushPublicKeyState = z.infer<typeof webPushPublicKeyStateSchema>;

export const webPushSubscriptionSchema = z.object({
  id: z.string(),
  endpoint: z.string(),
  expirationTime: z.string().datetime().nullable(),
  userAgent: z.string().nullable(),
  disabledAt: z.string().datetime().nullable(),
  lastSeenAt: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  userId: z.string(),
});

export type WebPushSubscription = z.infer<typeof webPushSubscriptionSchema>;

export const webPushSubscriptionListSchema = z.array(webPushSubscriptionSchema);

export const webPushTestIssueCodeSchema = z.enum([
  "certificate-error",
  "network-error",
  "no-subscriptions",
  "push-disabled",
  "push-service-error",
  "subscription-expired",
  "unknown-error",
  "vapid-auth-error",
]);

export const webPushTestDispatchSchema = z.object({
  enabled: z.boolean(),
  issue: webPushTestIssueCodeSchema.nullable(),
  diagnostics: z.array(
    z.object({
      issue: webPushTestIssueCodeSchema,
      count: z.number().int().min(0),
    }),
  ),
  subscriptionCount: z.number().int().min(0),
  sentCount: z.number().int().min(0),
  failedCount: z.number().int().min(0),
  disabledCount: z.number().int().min(0),
});

export type WebPushTestDispatch = z.infer<typeof webPushTestDispatchSchema>;
