import { cn } from "@/shared/lib/utils";
import { Bell, Star, UserPlus, Users, Zap } from "lucide-react";
import type { NotificationItem as NotificationItemType } from "../types/notification.types";
import { NotificationType } from "../types/notification.types";

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; colorClass: string; borderClass: string }
> = {
  [NotificationType.GROUP_FORMED]: {
    icon: Zap,
    colorClass: "text-accent bg-accent/10",
    borderClass: "border-l-accent",
  },
  [NotificationType.JOIN_REQUEST]: {
    icon: Users,
    colorClass: "text-primary bg-primary/10",
    borderClass: "border-l-primary",
  },
  [NotificationType.RATING_PROMPT]: {
    icon: Star,
    colorClass: "text-muted-foreground bg-muted",
    borderClass: "border-l-border",
  },
  [NotificationType.FRIEND_REQUEST]: {
    icon: UserPlus,
    colorClass: "text-primary bg-primary/10",
    borderClass: "border-l-primary",
  },
  [NotificationType.SYSTEM]: {
    icon: Bell,
    colorClass: "text-muted-foreground bg-muted",
    borderClass: "border-l-border",
  },
};

interface NotificationItemProps {
  item: NotificationItemType;
  onRead: (id: string) => void;
}

export function NotificationItem({ item, onRead }: NotificationItemProps) {
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG[NotificationType.SYSTEM];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => onRead(item.id)}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3",
        "border-l-2 transition-colors duration-150",
        "hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
        config.borderClass,
        !item.read && "bg-secondary/60",
      )}
      aria-label={`${item.title}: ${item.message}`}
    >
      {/* Icon badge */}
      <span
        className={cn(
          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          config.colorClass,
        )}
        aria-hidden="true"
      >
        <Icon size={14} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground leading-snug truncate">
          {item.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">
          {item.message}
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          {relativeTime(item.timestamp)}
        </p>
      </div>

      {/* Unread dot */}
      {!item.read && (
        <span
          className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"
          aria-label="Unread"
        />
      )}
    </button>
  );
}
