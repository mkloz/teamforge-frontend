import {
  Bell,
  CalendarDays,
  Handshake,
  type LucideIcon,
  MessageCircle,
  ShieldCheck,
  Star,
  UserPlus,
  UsersRound,
} from "lucide-react";
import type { AvatarBadgeTone } from "@/shared/components/common/avatar-with-badge";
import type { IconTileTone } from "@/shared/components/ui/icon-tile";
import type { Notification } from "@/shared/schemas";

export function relativeTime(date: string): string {
  const timestamp = new Date(date).getTime();

  if (Number.isNaN(timestamp)) {
    return "recently";
  }

  const diff = Math.max(0, Date.now() - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function formatNotificationDate(date: string): string {
  const timestamp = new Date(date);

  if (Number.isNaN(timestamp.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(timestamp);
}

export function getTypeConfig(type: Notification["type"]): {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconTone: IconTileTone;
} {
  switch (type) {
    case "GROUP_FORMED":
    case "GROUP_INVITE":
      return {
        avatarBadgeTone: "amber",
        icon: Handshake,
        iconTone: "amber",
      };
    case "PLAN_CREATED":
    case "PLAN_CONFIRMED":
    case "PLAN_UPDATED":
    case "PLAN_PROPOSAL":
    case "PLAN_STARTING_SOON":
    case "PLAN_COMPLETED":
    case "PLAN_CANCELLED":
      return {
        avatarBadgeTone: "teal",
        icon: CalendarDays,
        iconTone: "teal",
      };
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOIN_APPROVED":
    case "GROUP_MEMBER_LEFT":
    case "GROUP_DISBANDED":
      return {
        avatarBadgeTone: "teal",
        icon: UsersRound,
        iconTone: "teal",
      };
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return {
        avatarBadgeTone: "teal",
        icon: MessageCircle,
        iconTone: "teal",
      };
    case "RATING_REQUEST":
    case "RATING_RECEIVED":
      return {
        avatarBadgeTone: "amber",
        icon: Star,
        iconTone: "amber",
      };
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return {
        avatarBadgeTone: "teal",
        icon: UserPlus,
        iconTone: "teal",
      };
    case "ACCOUNT_SECURITY":
      return {
        avatarBadgeTone: "amber",
        icon: ShieldCheck,
        iconTone: "amber",
      };
    default:
      return {
        avatarBadgeTone: "muted",
        icon: Bell,
        iconTone: "muted",
      };
  }
}
