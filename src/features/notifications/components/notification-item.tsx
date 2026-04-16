import { cn } from "@/shared/lib/utils";
import { Bell, Star, UserPlus, Users, Zap } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
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
    <Button
      variant="ghost"
      asChild
      onClick={() => onRead(item.id)}
      className={cn(
        "w-full h-auto p-0 rounded-none border-none hover:bg-muted/50 focus-visible:ring-inset",
        !item.read && "bg-secondary/20",
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
          <p className="text-[14px] font-bold text-white leading-tight truncate">
            {item.title}
          </p>
          <p className="text-[12.5px] text-slate-muted leading-snug line-clamp-2">
            {item.message}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <p className="text-[10px] font-bold text-slate-muted/50 uppercase tracking-widest">
              {relativeTime(item.timestamp)}
            </p>
            {!item.read && (
              <span className="h-1.5 w-1.5 rounded-full bg-forge-teal shadow-[0_0_8px_rgba(13,148,136,0.3)]" />
            )}
          </div>
        </div>
      </div>
    </Button>
  );
}
