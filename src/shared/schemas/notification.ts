import { z } from "zod";
import { notificationTypeSchema, entityTypeSchema } from "./enums";

export const notificationSchema = z.object({
  id: z.string(),
  type: notificationTypeSchema,
  title: z.string(),
  message: z.string(),
  link: z.string().nullable(),
  avatarUrl: z.string().nullable(),
  isRead: z.boolean(),
  createdAt: z.string().datetime(),
  entityType: entityTypeSchema.nullable(),
  entityId: z.string().nullable(),
  receiverId: z.string(),
});

export type Notification = z.infer<typeof notificationSchema>;

export const notificationUnreadCountSchema = z.object({
  unreadCount: z.number(),
});

export type NotificationUnreadCount = z.infer<
  typeof notificationUnreadCountSchema
>;
