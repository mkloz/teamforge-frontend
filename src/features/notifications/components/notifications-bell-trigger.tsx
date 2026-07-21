import { Bell } from "lucide-react";
import { useUnreadNotificationCount } from "@/features/notifications/public/notification-drawer";
import { Button } from "@/shared/components/ui/button";
import { CountBadge } from "@/shared/components/ui/count-badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/lib/utils";

interface NotificationsBellTriggerProps {
  onClick: () => void;
}

export function NotificationsBellTrigger({
  onClick,
}: NotificationsBellTriggerProps) {
  const { count } = useUnreadNotificationCount();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={
            count > 0 ? `Notifications, ${count} unread` : "Notifications"
          }
          className={cn(
            "relative size-10 shrink-0 rounded-lg",
            "text-slate-muted hover:text-ink",
          )}
        >
          <Bell size={18} strokeWidth={2} aria-hidden="true" />
          {count > 0 && (
            <CountBadge
              aria-hidden="true"
              count={count}
              max={9}
              size="xs"
              tone="amber"
              className="absolute top-0.5 right-0.5 z-10 h-3.5 min-w-3.5 px-0.5 ring-2 ring-canvas"
            />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {count > 0 ? `${count} unread notifications` : "Notifications"}
      </TooltipContent>
    </Tooltip>
  );
}
