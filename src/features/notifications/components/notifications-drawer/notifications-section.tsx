import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Notification } from "@/shared/schemas";

import { NotificationItem } from "./notification-item";

interface NotificationsSectionProps {
  label: string;
  items: Notification[];
  pendingNotificationId: string | null;
  pendingReadToggleNotificationId: string | null;
  onSelect: (item: Notification) => void;
  onToggleRead: (item: Notification) => void;
}

export function NotificationsSection({
  label,
  items,
  pendingNotificationId,
  pendingReadToggleNotificationId,
  onSelect,
  onToggleRead,
}: NotificationsSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  if (items.length === 0) {
    return null;
  }

  return (
    <section
      aria-label={
        label === "Today" ? "Today's notifications" : `${label} notifications`
      }
    >
      <div className="sticky top-0 z-10 border-border/60 border-b bg-canvas px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-slate-muted text-xs">{label}</p>
          <span className="rounded-full bg-slate-muted/10 px-2 py-0.5 font-semibold text-slate-muted text-xs tabular-nums">
            {items.length}
          </span>
        </div>
      </div>
      <ul className="divide-y divide-border/55">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <motion.li
              key={item.id}
              initial={
                shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
              }
              animate={
                shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
              }
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
              transition={{
                duration: shouldReduceMotion ? 0.08 : 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <NotificationItem
                item={item}
                onSelect={onSelect}
                onToggleRead={onToggleRead}
                isPending={pendingNotificationId === item.id}
                isTogglingRead={pendingReadToggleNotificationId === item.id}
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </section>
  );
}
