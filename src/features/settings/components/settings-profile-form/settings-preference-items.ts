import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";

export const NOTIFICATION_CHANNEL_ITEMS: ReadonlyArray<{
  inAppKey: BooleanSettingsPreferenceKey;
  emailKey: BooleanSettingsPreferenceKey;
  title: string;
  description: string;
}> = [
  {
    inAppKey: "notifyFriendRequests",
    emailKey: "emailFriendRequests",
    title: "Friend requests",
    description: "Requests and accepted connections.",
  },
  {
    inAppKey: "notifyGroupInvites",
    emailKey: "emailGroupInvites",
    title: "Group invites",
    description: "Invitations and join approvals.",
  },
  {
    inAppKey: "notifyGroupActivity",
    emailKey: "emailGroupActivity",
    title: "Group activity",
    description: "Plan changes, proposals, and group events.",
  },
  {
    inAppKey: "notifyMessages",
    emailKey: "emailMessages",
    title: "Messages",
    description: "Direct and group conversations.",
  },
  {
    inAppKey: "notifyAccount",
    emailKey: "emailAccount",
    title: "Account security",
    description: "Sign-in and account protection updates.",
  },
] as const;
