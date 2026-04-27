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
    type: NotificationType.JOIN_REQUEST,
    title: "New member request",
    message: "Sarah wants to join 'Sunday Board Games'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5),
    read: false,
  },
  {
    id: "4",
    type: NotificationType.RATING_PROMPT,
    title: "Rate your experience",
    message: "How was the Board Games Night last Friday?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3),
    read: true,
  },
  {
    id: "5",
    type: NotificationType.GROUP_FORMED,
    title: "New group formed!",
    message: "You've been added to 'Evening Jazz at Blue Note'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    read: true,
  },
  {
    id: "6",
    type: NotificationType.FRIEND_REQUEST,
    title: "New friend",
    message: "Jamie L. accepted your friend request.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
    read: true,
  },
  {
    id: "7",
    type: NotificationType.SYSTEM,
    title: "Weekly Summary",
    message: "You made 4 new connections this week. Keep it up!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
    read: true,
  },
  {
    id: "8",
    type: NotificationType.JOIN_REQUEST,
    title: "Pending request",
    message: "Your request to join 'Morning Yoga' was accepted.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 18),
    read: true,
  },
  {
    id: "9",
    type: NotificationType.GROUP_FORMED,
    title: "Adventure awaits!",
    message: "The 'Mountain Biking' group is now ACTIVE. Chat is open.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22),
    read: true,
  },
  {
    id: "10",
    type: NotificationType.SYSTEM,
    title: "Welcome to TeamForge",
    message: "Your profile is set up. Ready to forge your first group?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
    read: true,
  },
  {
    id: "11",
    type: NotificationType.RATING_PROMPT,
    title: "Past Event",
    message: "Don't forget to rate your 'Coding Meetup' group.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    read: true,
  },
  {
    id: "12",
    type: NotificationType.SYSTEM,
    title: "Security Update",
    message: "Your password was successfully updated.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
    read: true,
  },
  {
    id: "13",
    type: NotificationType.FRIEND_REQUEST,
    title: "Friend suggestion",
    message: "Mark D. is also interested in 'Tennis'. Want to connect?",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    read: true,
  },
  {
    id: "14",
    type: NotificationType.SYSTEM,
    title: "App Update",
    message: "Version 2.1 is here! Check out the new Activity feed.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
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
