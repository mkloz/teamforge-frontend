import {
  Bell,
  CalendarDays,
  Handshake,
  Loader2,
  type LucideIcon,
  MessageCircle,
  ShieldCheck,
  Star,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { Avatar } from "@/shared/components/common/avatar";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";

function relativeTime(date: string): string {
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

function getTypeConfig(type: Notification["type"]) {
  switch (type) {
    case "GROUP_FORMED":
    case "GROUP_INVITE":
      return {
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
        icon: CalendarDays,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOIN_APPROVED":
    case "GROUP_MEMBER_LEFT":
    case "GROUP_DISBANDED":
      return {
        icon: UsersRound,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return {
        icon: MessageCircle,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "RATING_REQUEST":
    case "RATING_RECEIVED":
      return {
        icon: Star,
        iconClassName: "bg-spark-amber/12 text-spark-amber",
      };
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return {
        icon: UserPlus,
        iconClassName: "bg-forge-teal/10 text-forge-teal",
      };
    case "ACCOUNT_SECURITY":
      return {
        icon: ShieldCheck,
        iconClassName: "bg-spark-amber/12 text-spark-amber",
      };
    default:
      return {
        icon: Bell,
        iconClassName: "bg-slate-muted/10 text-slate-muted",
      };
  }
}

interface NotificationItemProps {
  item: Notification;
  onSelect: (item: Notification) => void;
  isPending?: boolean;
}

export function NotificationItem({
  item,
  onSelect,
  isPending = false,
}: NotificationItemProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      onClick={() => onSelect(item)}
      disabled={isPending}
      aria-label={`${item.isRead ? "Read" : "Unread"} notification. ${item.title}. ${item.message}`}
      className={cn(
        "h-auto w-full justify-start rounded-none border-none p-0 text-left hover:bg-muted/35 focus-visible:ring-inset",
        !item.isRead && "bg-forge-teal/8 hover:bg-forge-teal/10",
      )}
    >
      <span className="flex w-full min-w-0 items-start gap-3 px-5 py-4 text-left transition-colors duration-200">
        <NotificationSource
          icon={Icon}
          iconClassName={config.iconClassName}
          item={item}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start gap-2">
            <p
              className={cn(
                "min-w-0 flex-1 truncate text-sm leading-tight",
                item.isRead
                  ? "font-semibold text-ink/80"
                  : "font-bold text-ink",
              )}
            >
              {item.title}
            </p>
            {!item.isRead && (
              <span
                className="mt-1.5 size-2 shrink-0 rounded-full bg-forge-teal"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="line-clamp-2 text-slate-muted text-sm leading-snug">
            {item.message}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <time
              dateTime={item.createdAt}
              className="font-medium text-slate-muted/70 text-xs"
            >
              {relativeTime(item.createdAt)}
            </time>
            {isPending && (
              <span className="inline-flex items-center gap-1 font-semibold text-forge-teal text-xs">
                <Loader2
                  className="size-3 shrink-0 animate-spin"
                  aria-hidden="true"
                />
                Opening
              </span>
            )}
          </div>
        </div>
      </span>
    </Button>
  );
}

interface NotificationSourceProps {
  icon: LucideIcon;
  iconClassName: string;
  item: Notification;
}

function NotificationSource({
  icon: Icon,
  iconClassName,
  item,
}: NotificationSourceProps) {
  if (item.avatarUrl) {
    return (
      <span className="relative mt-0.5 shrink-0" aria-hidden="true">
        <Avatar
          src={item.avatarUrl}
          name={item.title}
          className="size-10 border border-border/70 bg-canvas"
        />
        <span
          className={cn(
            "absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-canvas",
            iconClassName,
          )}
        >
          <Icon className="size-3 shrink-0" strokeWidth={2} />
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl",
        iconClassName,
      )}
      aria-hidden="true"
    >
      <Icon className="size-4 shrink-0" strokeWidth={2} />
    </span>
  );
}
