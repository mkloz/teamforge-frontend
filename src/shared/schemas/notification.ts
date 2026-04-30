import { z } from "zod";
import { notificationTypeSchema, entityTypeSchema } from "./enums";

export const notificationSchema = z
  .object({
    id: z.string(),
    type: notificationTypeSchema,
    title: z.string(),
    message: z.string(),
    link: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    isRead: z.boolean(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime().optional(),
    version: z.number().optional(),
    entityType: entityTypeSchema.nullable(),
    entityId: z.string().nullable(),
    receiverId: z.string(),
  })
  .transform((notification) => {
    const updatedAt = notification.updatedAt ?? notification.createdAt;

    return {
      ...notification,
      updatedAt,
      version: notification.version ?? Date.parse(updatedAt),
    };
  });

export type Notification = z.infer<typeof notificationSchema>;

export const notificationUnreadCountSchema = z.object({
  unreadCount: z.number(),
});

export type NotificationUnreadCount = z.infer<
  typeof notificationUnreadCountSchema
>;
