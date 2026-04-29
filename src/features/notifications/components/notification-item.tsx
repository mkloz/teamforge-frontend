import { cn } from "@/shared/lib/utils";
import { Bell, Star, UserPlus, Users, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
        icon: Zap,
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
    case "PLAN_CREATED":
    case "PLAN_CONFIRMED":
    case "PLAN_UPDATED":
    case "PLAN_PROPOSAL":
    case "PLAN_STARTING_SOON":
    case "PLAN_COMPLETED":
    case "PLAN_CANCELLED":
    case "SYSTEM_ANNOUNCEMENT":
    case "ACCOUNT_SECURITY":
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
  onRead: (id: string) => void;
}

export function NotificationItem({ item, onRead }: NotificationItemProps) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;

  return (
    <Button
      variant="ghost"
      asChild
      onClick={() => onRead(item.id)}
      className={cn(
        "w-full h-auto p-0 rounded-none border-none hover:bg-muted/50 focus-visible:ring-inset",
        !item.isRead && "bg-secondary/20",
      )}
    >
      <div
        className={cn(
          "w-full flex items-start gap-4 px-4 py-3.5 border-l-4 transition-all duration-200 cursor-pointer",
          config.borderClass,
        )}
        aria-label={`${item.title}: ${item.message}`}
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
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="text-[14px] font-bold text-ink leading-tight truncate">
            {item.title}
          </p>
          <p className="text-[12.5px] text-slate-muted leading-snug line-clamp-2">
            {item.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-[10px] font-bold text-slate-muted/50 uppercase tracking-widest">
              {relativeTime(item.createdAt)}
            </p>
            {!item.isRead && (
              <span className="h-1.5 w-1.5 rounded-full bg-forge-teal shadow-[0_0_8px_rgba(13,148,136,0.3)]" />
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}
