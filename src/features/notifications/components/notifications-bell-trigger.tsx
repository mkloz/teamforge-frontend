import { cn } from "@/shared/lib/utils";
import { Bell } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { useNotifications } from "../hooks/use-notifications";

interface NotificationsBellTriggerProps {
  onClick: () => void;
}

export function NotificationsBellTrigger({
  onClick,
}: NotificationsBellTriggerProps) {
  const { count } = useNotifications();

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      onClick={onClick}
      aria-label={
        count > 0 ? `Notifications, ${count} unread` : "Notifications"
      }
      className={cn(
        "relative rounded-xl shrink-0",
        "text-slate-muted hover:text-ink",
      )}
    >
      <Bell size={18} aria-hidden="true" />
      {count > 0 && (
        <span
          className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-spark-amber px-1 text-none font-black text-ink shadow-[0_0_8px_rgba(245,158,11,0.4)]"
          aria-hidden="true"
        >
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Button>
  );
}
