import type { Notification } from "@/shared/schemas";

import { NotificationItem } from "./notification-item";

interface NotificationsSectionProps {
  label: string;
  items: Notification[];
  pendingNotificationId: string | null;
  onSelect: (item: Notification) => void;
}

export function NotificationsSection({
  label,
  items,
  pendingNotificationId,
  onSelect,
}: NotificationsSectionProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={
        label === "Today" ? "Today's notifications" : `${label} notifications`
      }
    >
      <div className="sticky top-0 z-10 border-border/50 border-b bg-card/95 px-6 py-4 backdrop-blur-md">
        <p className="font-black text-slate-muted/60 text-xs uppercase tracking-[0.16em]">
          {label}
        </p>
      </div>
      {items.map((item) => (
        <NotificationItem
          key={item.id}
          item={item}
          onSelect={onSelect}
          isPending={pendingNotificationId === item.id}
        />
      ))}
    </section>
  );
}
