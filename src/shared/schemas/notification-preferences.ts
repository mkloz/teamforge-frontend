import { z } from "zod";
import {
  themeAppearanceValues,
  themeColorValues,
  themeStyleValues,
} from "@/shared/constants/theme-preferences";

const themeAppearanceSchema = z.enum(themeAppearanceValues);
const themeStyleSchema = z.enum(themeStyleValues);
const themeColorSchema = z.enum(themeColorValues);
export const presencePrecisionSchema = z.enum([
  "HIDDEN",
  "APPROXIMATE",
  "EXACT",
]);

export const notificationPreferencesSchema = z.object({
  notifyFriendRequests: z.boolean(),
  notifyGroupInvites: z.boolean(),
  notifyGroupActivity: z.boolean(),
  notifyMessages: z.boolean(),
  notifyAccount: z.boolean(),
  notificationHardMute: z.boolean(),
  notificationTimeZoneId: z.string().nullable(),
  quietHoursStartMinute: z.number().int().min(0).max(1439).nullable(),
  quietHoursEndMinute: z.number().int().min(0).max(1439).nullable(),
  planReminderLeadMinutes: z.union([
    z.literal(30),
    z.literal(60),
    z.literal(180),
    z.literal(1440),
  ]),
  emailFriendRequests: z.boolean(),
  emailGroupInvites: z.boolean(),
  emailGroupActivity: z.boolean(),
  emailMessages: z.boolean(),
  emailAccount: z.boolean(),
  autoMatchingEnabled: z.boolean(),
  minCompatibilityScore: z.number().int().min(0).max(100),
  themeAppearance: themeAppearanceSchema,
  themeStyle: themeStyleSchema,
  themeColor: themeColorSchema,
  showAgeOnProfile: z.boolean(),
  showGenderOnProfile: z.boolean(),
  showCityOnProfile: z.boolean(),
  showFriendsListOnProfile: z.boolean(),
  presencePrecision: presencePrecisionSchema,
  presenceFriendsVisible: z.boolean(),
  presenceGroupsVisible: z.boolean(),
  presencePlanGuestsVisible: z.boolean(),
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;
