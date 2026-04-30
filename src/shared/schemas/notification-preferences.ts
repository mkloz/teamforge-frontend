import { z } from "zod";

export const notificationPreferencesSchema = z.object({
  notifyFriendRequests: z.boolean(),
  notifyGroupInvites: z.boolean(),
  notifyGroupActivity: z.boolean(),
  notifyMessages: z.boolean(),
  notifyAccount: z.boolean(),
  emailFriendRequests: z.boolean(),
  emailGroupInvites: z.boolean(),
  emailGroupActivity: z.boolean(),
  emailMessages: z.boolean(),
  emailAccount: z.boolean(),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
