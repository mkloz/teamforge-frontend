import {
  AnimatePresence,
  domAnimation,
  LazyMotion,
  m,
  useReducedMotion,
} from "framer-motion";
import type { Notification } from "@/shared/schemas";

import { NotificationItem } from "./notification-item";

interface NotificationsSectionProps {
  label: string;
  items: Notification[];
  pendingNotificationId: string | null;
  pendingReadToggleNotificationId: string | null;
  isReadActionDisabled?: boolean;
  onSelect: (item: Notification) => void;
  onToggleRead: (item: Notification) => void;
}

export function NotificationsSection({
  label,
  items,
  pendingNotificationId,
  pendingReadToggleNotificationId,
  isReadActionDisabled = false,
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
      <div className="sticky top-0 z-10 bg-canvas/92 px-5 pt-4 pb-2 backdrop-blur-md">
        <p className="font-semibold text-slate-muted text-xs">
          {label}
          <span className="ml-1.5 text-slate-muted/55">{items.length}</span>
        </p>
      </div>
      <ul className="grouped-surface flex flex-col px-3 pb-4">
        <LazyMotion features={domAnimation}>
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <m.li
                key={item.id}
                className="relative overflow-hidden bg-card first:rounded-t-2xl last:rounded-b-2xl"
                initial={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 4 }
                }
                animate={
                  shouldReduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }
                }
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -2 }
                }
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
                  isReadActionDisabled={isReadActionDisabled}
                  isTogglingRead={pendingReadToggleNotificationId === item.id}
                />
              </m.li>
            ))}
          </AnimatePresence>
        </LazyMotion>
      </ul>
    </section>
  );
}
