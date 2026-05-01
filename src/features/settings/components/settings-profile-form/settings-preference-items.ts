import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";

export const NOTIFICATION_PREFERENCE_ITEMS: Array<{
  key: BooleanSettingsPreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "notifyFriendRequests",
    title: "Friend requests",
    description: "New requests and accepted connections.",
  },
  {
    key: "notifyGroupInvites",
    title: "Group invites",
    description: "Invitations and join approvals for new groups.",
  },
  {
    key: "notifyGroupActivity",
    title: "Group activity",
    description: "Plan changes, proposal updates, and lifecycle events.",
  },
  {
    key: "notifyMessages",
    title: "Messages",
    description: "Direct and group chat message activity.",
  },
  {
    key: "notifyAccount",
    title: "Account security",
    description: "Important sign-in and account protection updates.",
  },
] as const;

export const EMAIL_PREFERENCE_ITEMS: Array<{
  key: BooleanSettingsPreferenceKey;
  title: string;
  description: string;
}> = [
  {
    key: "emailFriendRequests",
    title: "Friend requests",
    description: "Send inbox alerts for new requests and accepted connections.",
  },
  {
    key: "emailGroupInvites",
    title: "Group invites",
    description: "Send inbox alerts for invitations and join approvals.",
  },
  {
    key: "emailGroupActivity",
    title: "Group activity",
    description:
      "Send inbox alerts for plan changes, proposals, and group events.",
  },
  {
    key: "emailMessages",
    title: "Messages",
    description: "Send inbox alerts when new direct or group messages arrive.",
  },
  {
    key: "emailAccount",
    title: "Account security",
    description: "Send inbox alerts for password and session security events.",
  },
] as const;
