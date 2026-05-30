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
  iconClassName: string;
} {
  switch (type) {
    case "GROUP_FORMED":
    case "GROUP_INVITE":
      return {
        avatarBadgeTone: "amber",
        icon: Handshake,
        iconClassName: "bg-spark-amber/12 text-spark-amber",
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
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOIN_APPROVED":
    case "GROUP_MEMBER_LEFT":
    case "GROUP_DISBANDED":
      return {
        avatarBadgeTone: "teal",
        icon: UsersRound,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return {
        avatarBadgeTone: "teal",
        icon: MessageCircle,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "RATING_REQUEST":
    case "RATING_RECEIVED":
      return {
        avatarBadgeTone: "amber",
        icon: Star,
        iconClassName: "bg-spark-amber/12 text-spark-amber",
      };
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return {
        avatarBadgeTone: "teal",
        icon: UserPlus,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "ACCOUNT_SECURITY":
      return {
        avatarBadgeTone: "amber",
        icon: ShieldCheck,
        iconClassName: "bg-spark-amber/12 text-spark-amber",
      };
    default:
      return {
        avatarBadgeTone: "muted",
        icon: Bell,
        iconClassName: "bg-slate-muted/10 text-slate-muted",
      };
  }
}
