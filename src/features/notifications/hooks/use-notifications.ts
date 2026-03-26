import { useNotificationsStore } from "../store/notifications.store";

/**
 * Thin selector hook over the notifications Zustand store.
 * Both the bell trigger and the drawer consume the same store instance,
 * so read/unread state is always in sync across both components.
 */
export function useNotifications() {
  const items = useNotificationsStore((s) => s.items);
  const markRead = useNotificationsStore((s) => s.markRead);
  const markAllRead = useNotificationsStore((s) => s.markAllRead);
  const count = items.filter((n) => !n.read).length;

  return { items, count, markRead, markAllRead };
}
