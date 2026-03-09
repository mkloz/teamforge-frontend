import { useState } from "react";
import type { NotificationItem } from "../types/notification.types";
import { NotificationType } from "../types/notification.types";

// Seed data — will be replaced with API calls in a later build step
const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "1",
    type: NotificationType.GROUP_FORMED,
    title: "Group forged!",
    message: "Your group for Saturday Hike is ready. 3 members matched.",
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    read: false,
  },
  {
    id: "2",
    type: NotificationType.FRIEND_REQUEST,
    title: "Friend request",
    message: "Alex M. sent you a friend request.",
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    read: false,
  },
  {
    id: "3",
    type: NotificationType.RATING_PROMPT,
    title: "Rate your experience",
    message: "How was the Board Games Night last Friday?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
  },
  {
    id: "4",
    type: NotificationType.SYSTEM,
    title: "Welcome to TeamForge",
    message: "Your profile is set up. Ready to forge your first group?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
    read: true,
  },
];

export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>(SEED_NOTIFICATIONS);

  const count = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return { items, count, markRead, markAllRead };
}
