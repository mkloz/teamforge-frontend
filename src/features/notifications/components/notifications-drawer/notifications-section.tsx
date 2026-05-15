import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
      <div className="sticky top-0 z-10 border-border/50 border-b bg-card/95 px-6 py-4 backdrop-blur-md">
        <p className="font-black text-slate-muted/60 text-xs uppercase tracking-widest">
          {label}
        </p>
      </div>
      <AnimatePresence initial={false}>
        {items.map((item) => (
          <motion.div
            key={item.id}
            initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }}
            animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }}
            transition={{
              duration: shouldReduceMotion ? 0.08 : 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <NotificationItem
              item={item}
              onSelect={onSelect}
              isPending={pendingNotificationId === item.id}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </section>
  );
}
