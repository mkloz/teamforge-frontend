import { z } from "zod";

import { chatApiSchema, messageApiSchema } from "./chat-api";
import { onlineStatusSchema } from "./enums";
import { groupApiSchema } from "./group-api";
import { notificationSchema } from "./notification";
import { planProposalSchema, planSchema } from "./plan";

export const realtimeEventSchema = z.enum([
  "realtime.ready",
  "chat.subscribe",
  "chat.unsubscribe",
  "chat.typing",
  "presence.changed",
  "message.new",
  "message.updated",
  "plan.subscribe",
  "plan.unsubscribe",
  "plan.updated",
  "group.updated",
  "notification.new",
  "chat.read",
]);

export const planUpdateKindSchema = z.enum([
  "updated",
  "confirmed",
  "completed",
  "cancelled",
  "proposal_created",
  "proposal_voted",
  "proposal_approved",
  "proposal_rejected",
  "proposal_withdrawn",
]);

export const groupUpdateReasonSchema = z.enum([
  "updated",
  "member_left",
  "member_removed",
  "disbanded",
]);

export const realtimeReadyPayloadSchema = z.object({
  userId: z.string(),
});

export const realtimeEventMetaSchema = z.object({
  entityKey: z.string().nullable(),
  entityVersion: z.number().nullable(),
  eventId: z.string(),
  occurredAt: z.string(),
});

export const realtimeMessagePayloadSchema = realtimeEventMetaSchema.extend({
  chatId: z.string(),
  message: messageApiSchema,
});

export const realtimeChatTypingPayloadSchema = z.object({
  chatId: z.string(),
  isTyping: z.boolean(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
});

export const realtimePresenceChangedPayloadSchema = z.object({
  onlineStatus: onlineStatusSchema,
  user: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().nullable(),
  }),
});

export const realtimeNotificationPayloadSchema = realtimeEventMetaSchema.extend(
  {
    notification: notificationSchema,
  },
);

export const realtimeChatReadPayloadSchema = realtimeEventMetaSchema.extend({
  userId: z.string(),
  chatId: z.string(),
  chat: chatApiSchema,
});

export const realtimePlanUpdatedPayloadSchema = realtimeEventMetaSchema.extend({
  groupId: z.string(),
  kind: planUpdateKindSchema,
  planId: z.string(),
  plan: planSchema,
  proposal: planProposalSchema.nullable(),
});

export const realtimeGroupUpdatedPayloadSchema = realtimeEventMetaSchema.extend(
  {
    group: groupApiSchema,
    reason: groupUpdateReasonSchema,
  },
);

export type RealtimeEventName = z.infer<typeof realtimeEventSchema>;
export type PlanUpdateKind = z.infer<typeof planUpdateKindSchema>;
export type GroupUpdateReason = z.infer<typeof groupUpdateReasonSchema>;
export type RealtimeReadyPayload = z.infer<typeof realtimeReadyPayloadSchema>;
export type RealtimeEventMeta = z.infer<typeof realtimeEventMetaSchema>;
export type RealtimeMessagePayload = z.infer<
  typeof realtimeMessagePayloadSchema
>;
export type RealtimeChatTypingPayload = z.infer<
  typeof realtimeChatTypingPayloadSchema
>;
export type RealtimePresenceChangedPayload = z.infer<
  typeof realtimePresenceChangedPayloadSchema
>;
export type RealtimeNotificationPayload = z.infer<
  typeof realtimeNotificationPayloadSchema
>;
export type RealtimeChatReadPayload = z.infer<
  typeof realtimeChatReadPayloadSchema
>;
export type RealtimePlanUpdatedPayload = z.infer<
  typeof realtimePlanUpdatedPayloadSchema
>;
export type RealtimeGroupUpdatedPayload = z.infer<
  typeof realtimeGroupUpdatedPayloadSchema
>;
