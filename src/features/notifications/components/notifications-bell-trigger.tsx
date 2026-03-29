import { cn } from "@/shared/lib/utils";
import { Bell } from "lucide-react";
import { useNotifications } from "../hooks/use-notifications";

interface NotificationsBellTriggerProps {
  onClick: () => void;
}

export function NotificationsBellTrigger({
  onClick,
}: NotificationsBellTriggerProps) {
  const { count } = useNotifications();

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={
        count > 0 ? `Notifications, ${count} unread` : "Notifications"
      }
      className={cn(
        "relative flex h-9 w-9 items-center justify-center rounded-xl",
        "text-muted-foreground hover:text-foreground hover:bg-muted",
        "transition-colors duration-150",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <Bell size={18} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-accent-foreground"
          aria-hidden="true"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}
