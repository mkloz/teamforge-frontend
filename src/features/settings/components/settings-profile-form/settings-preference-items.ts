import {
  CalendarSync,
  MessageCircle,
  ShieldCheck,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import type { BooleanSettingsPreferenceKey } from "@/features/settings/components/settings-profile-form/settings-form-types";

export const NOTIFICATION_CHANNEL_ITEMS: ReadonlyArray<{
  inAppKey: BooleanSettingsPreferenceKey;
  emailKey: BooleanSettingsPreferenceKey;
  icon: typeof UserRoundPlus;
  title: string;
  description: string;
}> = [
  {
    inAppKey: "notifyFriendRequests",
    emailKey: "emailFriendRequests",
    icon: UserRoundPlus,
    title: "Friend requests",
    description: "Requests and accepted connections.",
  },
  {
    inAppKey: "notifyGroupInvites",
    emailKey: "emailGroupInvites",
    icon: UsersRound,
    title: "Group invites",
    description: "Invitations and join approvals.",
  },
  {
    inAppKey: "notifyGroupActivity",
    emailKey: "emailGroupActivity",
    icon: CalendarSync,
    title: "Group activity",
    description: "Plan changes, proposals, and group events.",
  },
  {
    inAppKey: "notifyMessages",
    emailKey: "emailMessages",
    icon: MessageCircle,
    title: "Messages",
    description: "Direct and group conversations.",
  },
  {
    inAppKey: "notifyAccount",
    emailKey: "emailAccount",
    icon: ShieldCheck,
    title: "Account security",
    description: "Sign-in and account protection updates.",
  },
] as const;
