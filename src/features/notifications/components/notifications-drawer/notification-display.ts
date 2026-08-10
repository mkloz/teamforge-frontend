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

interface NotificationTypeConfig {
  avatarBadgeTone: AvatarBadgeTone;
  icon: LucideIcon;
  iconTone: IconTileTone;
}

function createTypeConfig(
  avatarBadgeTone: AvatarBadgeTone,
  icon: LucideIcon,
  iconTone: IconTileTone,
): NotificationTypeConfig {
  return {
    avatarBadgeTone,
    icon,
    iconTone,
  };
}

const GROUP_FORMED_TYPE_CONFIG = createTypeConfig("amber", Handshake, "amber");
const PLAN_TYPE_CONFIG = createTypeConfig("teal", CalendarDays, "teal");
const GROUP_ACTIVITY_TYPE_CONFIG = createTypeConfig("teal", UsersRound, "teal");
const MESSAGE_TYPE_CONFIG = createTypeConfig("teal", MessageCircle, "teal");
const RATING_TYPE_CONFIG = createTypeConfig("amber", Star, "amber");
const FRIEND_TYPE_CONFIG = createTypeConfig("teal", UserPlus, "teal");
const ACCOUNT_SECURITY_TYPE_CONFIG = createTypeConfig(
  "amber",
  ShieldCheck,
  "amber",
);
const DEFAULT_TYPE_CONFIG = createTypeConfig("muted", Bell, "muted");

const NOTIFICATION_TYPE_CONFIGS: Partial<
  Record<Notification["type"], NotificationTypeConfig>
> = {
  FRIEND_REQUEST: FRIEND_TYPE_CONFIG,
  FRIEND_ACCEPTED: FRIEND_TYPE_CONFIG,
  GROUP_FORMED: GROUP_FORMED_TYPE_CONFIG,
  GROUP_INVITE: GROUP_FORMED_TYPE_CONFIG,
  GROUP_JOIN_REQUEST: GROUP_ACTIVITY_TYPE_CONFIG,
  GROUP_JOIN_APPROVED: GROUP_ACTIVITY_TYPE_CONFIG,
  GROUP_MEMBER_LEFT: GROUP_ACTIVITY_TYPE_CONFIG,
  GROUP_DISBANDED: GROUP_ACTIVITY_TYPE_CONFIG,
  PLAN_CREATED: PLAN_TYPE_CONFIG,
  PLAN_CONFIRMED: PLAN_TYPE_CONFIG,
  PLAN_UPDATED: PLAN_TYPE_CONFIG,
  PLAN_PROPOSAL: PLAN_TYPE_CONFIG,
  PLAN_STARTING_SOON: PLAN_TYPE_CONFIG,
  PLAN_COMPLETED: PLAN_TYPE_CONFIG,
  PLAN_CANCELLED: PLAN_TYPE_CONFIG,
  NEW_MESSAGE: MESSAGE_TYPE_CONFIG,
  MESSAGE_MENTION: MESSAGE_TYPE_CONFIG,
  RATING_REQUEST: RATING_TYPE_CONFIG,
  RATING_RECEIVED: RATING_TYPE_CONFIG,
  GROUP_PROPOSAL_READY: GROUP_FORMED_TYPE_CONFIG,
  GROUP_PROPOSAL_REMINDER: GROUP_FORMED_TYPE_CONFIG,
  ACCOUNT_SECURITY: ACCOUNT_SECURITY_TYPE_CONFIG,
};

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
  const config = NOTIFICATION_TYPE_CONFIGS[type] ?? DEFAULT_TYPE_CONFIG;

  return { ...config };
}
