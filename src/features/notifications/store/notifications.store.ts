import { create } from "zustand";
import type { NotificationItem } from "../types/notification.types";
import { NotificationType } from "../types/notification.types";

// Seed data — replaced with API calls in a later build step
const SEED: NotificationItem[] = [
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

interface NotificationsState {
  items: NotificationItem[];
  markRead: (id: string) => void;
  markAllRead: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set) => ({
  items: SEED,
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((n) => ({ ...n, read: true })),
    })),
}));
