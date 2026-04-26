import type {
  DirectChat,
  DirectChatPreview,
} from "../types/direct-chats.types";
import {
  createMockMessage,
  createMockChat,
  createMockAttachment,
} from "./mock-utils";
import type { Message } from "@/shared/schemas";

// Helper to create ISO dates relative to now
const minutesAgo = (m: number) =>
  new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

export const CURRENT_USER_ID = "user-current";

export const MOCK_DIRECT_CHAT_PREVIEWS: DirectChatPreview[] = [
  {
    id: "dm-playground",
    participantId: "user-designer",
    participantFullName: "✨ DM Design Playground",
    participantAvatar:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "DM visual tests are live! 📱✨",
      createdAt: minutesAgo(1),
      isOwn: false,
      status: "READ",
      type: "TEXT",
    },
    unreadCount: 5,
    isTyping: true,
    isMuted: false,
  },
  {
    id: "dm-1",
    participantId: "user-jordan",
    participantFullName: "Jordan Lee",
    participantAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "Yeah, definitely! Can't wait.",
      createdAt: minutesAgo(1),
      isOwn: true,
      status: "READ",
      type: "TEXT",
    },
    unreadCount: 2,
    isTyping: true,
    isMuted: false,
  },
  {
    id: "dm-2",
    participantId: "user-sam",
    participantFullName: "Sam Rivera",
    participantAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
    onlineStatus: "AWAY",
    lastSeen: minutesAgo(15),
    lastMessage: {
      content: "Thanks for the recommendations!",
      createdAt: hoursAgo(1),
      isOwn: true,
      status: "DELIVERED",
      type: "TEXT",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-3",
    participantId: "user-casey",
    participantFullName: "Casey Chen",
    participantAvatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "The React study group was great!",
      createdAt: hoursAgo(3),
      isOwn: false,
      status: "READ",
      type: "TEXT",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-4",
    participantId: "user-taylor",
    participantFullName: "Taylor Morgan",
    participantAvatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    onlineStatus: "OFFLINE",
    lastSeen: hoursAgo(5),
    lastMessage: {
      content: "See you next week!",
      createdAt: daysAgo(1),
      isOwn: true,
      status: "READ",
      type: "TEXT",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: true,
  },
];

export const MOCK_DIRECT_CHATS: Record<string, DirectChat> = {
  "dm-playground": createMockChat({
    id: "dm-playground",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-playground" },
      { userId: "user-designer", chatId: "dm-playground" },
    ],
    createdAt: hoursAgo(100),
  }),
  "dm-1": createMockChat({
    id: "dm-1",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-1" },
      { userId: "user-jordan", chatId: "dm-1" },
    ],
    createdAt: daysAgo(30),
  }),
  "dm-2": createMockChat({
    id: "dm-2",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-2" },
      { userId: "user-sam", chatId: "dm-2" },
    ],
    createdAt: daysAgo(45),
  }),
  "dm-3": createMockChat({
    id: "dm-3",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-3" },
      { userId: "user-casey", chatId: "dm-3" },
    ],
    createdAt: daysAgo(20),
  }),
  "dm-4": createMockChat({
    id: "dm-4",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-4" },
      { userId: "user-taylor", chatId: "dm-4" },
    ],
    createdAt: daysAgo(60),
  }),
};

export const MOCK_DIRECT_MESSAGES: Record<string, Message[]> = {
  "dm-playground": [
    createMockMessage({
      id: "dm-p-1",
      chatId: "dm-playground",
      senderId: "user-designer",
      content:
        "👋 Welcome to the DM Design Sandbox. This chat mirrors all UI possibilities for 1-on-1 messaging.",
      createdAt: hoursAgo(48),
      status: "READ",
    }),
    createMockMessage({
      id: "dm-p-2",
      chatId: "dm-playground",
      senderId: "user-designer",
      content:
        "Let's start with a single large photo (1200w). In DMs, this should feel very personal and high-quality.",
      createdAt: hoursAgo(24),
      status: "READ",
      attachments: [
        createMockAttachment({
          id: "dm-patt-1",
          type: "IMAGE",
          url: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=1200&q=80",
          name: "Portrait.jpg",
        }),
      ],
    }),
    createMockMessage({
      id: "dm-p-3",
      chatId: "dm-playground",
      senderId: CURRENT_USER_ID,
      content: "Nice! Here's a quick voice note response.",
      createdAt: hoursAgo(23.5),
      status: "READ",
      attachments: [
        createMockAttachment({
          id: "dm-patt-2",
          type: "AUDIO",
          url: "#",
          duration: 4,
          name: "Memo_1.m4a",
        }),
      ],
    }),
  ],
  "dm-1": [
    createMockMessage({
      id: "dm1-msg-1",
      chatId: "dm-1",
      senderId: "user-jordan",
      content: "Hey! How's the trail prep going?",
      createdAt: hoursAgo(2),
      status: "READ",
    }),
    createMockMessage({
      id: "dm1-msg-2",
      chatId: "dm-1",
      senderId: CURRENT_USER_ID,
      content: "Going well! I got new hiking boots yesterday",
      createdAt: hoursAgo(1.5),
      status: "READ",
    }),
  ],
};
