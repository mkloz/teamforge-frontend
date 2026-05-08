import { Bell, Handshake, Star, UserPlus, Users } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import type { Notification } from "@/shared/schemas";

function relativeTime(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
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
        colorClass: "text-accent bg-accent/10",
        borderClass: "border-l-accent",
      };
    case "GROUP_JOIN_REQUEST":
    case "GROUP_JOIN_APPROVED":
    case "GROUP_MEMBER_LEFT":
    case "GROUP_DISBANDED":
    case "NEW_MESSAGE":
    case "MESSAGE_MENTION":
      return {
        icon: Users,
        colorClass: "text-primary bg-primary/10",
        borderClass: "border-l-primary",
      };
    case "RATING_REQUEST":
    case "RATING_RECEIVED":
      return {
        icon: Star,
        colorClass: "text-muted-foreground bg-muted",
        borderClass: "border-l-border",
      };
    case "FRIEND_REQUEST":
    case "FRIEND_ACCEPTED":
      return {
        icon: UserPlus,
        colorClass: "text-primary bg-primary/10",
        borderClass: "border-l-primary",
      };
    default:
      return {
        icon: Bell,
        colorClass: "text-muted-foreground bg-muted",
        borderClass: "border-l-border",
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
      className={cn(
        "h-auto w-full rounded-none border-none p-0 hover:bg-muted/45 focus-visible:ring-inset",
        !item.isRead && "bg-secondary/20",
      )}
    >
      <span
        className={cn(
          "flex w-full cursor-pointer items-start gap-4 border-l-4 px-4 py-4 text-left transition-all duration-200",
          config.borderClass,
        )}
      >
        {/* Icon badge */}
        <span
          className={cn(
            "mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full shadow-sm",
            config.colorClass,
          )}
          aria-hidden="true"
        >
          <Icon size={16} strokeWidth={2.5} />
        </span>

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="truncate font-bold text-ink text-sm leading-tight">
            {item.title}
          </p>
          <p className="line-clamp-2 text-slate-muted text-sm leading-snug">
            {item.message}
          </p>
          <div className="mt-1.5 flex items-center gap-2">
            <p className="font-bold text-slate-muted/50 text-xs uppercase tracking-wider">
              {relativeTime(item.createdAt)}
            </p>
            {isPending && (
              <span className="font-bold text-forge-teal text-xs uppercase tracking-wider">
                Opening...
              </span>
            )}
            {!item.isRead && (
              <span className="h-1.5 w-1.5 rounded-full bg-forge-teal shadow-[0_0_8px_rgba(13,148,136,0.3)]" />
            )}
          </div>
        </div>
      </span>
    </Button>
  );
}
