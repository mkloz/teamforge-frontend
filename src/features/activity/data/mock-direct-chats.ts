import type {
  DirectChat,
  DirectChatPreview,
} from "../types/direct-chats.types";
import {
  createMockMessage,
  createMockChat,
  createMockAttachment,
  createMockUser,
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
  {
    id: "dm-long-name",
    participantId: "user-overflow",
    participantFullName: "Alexandros Bartholomew Montgomery-Wickens III",
    participantAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
    onlineStatus: "AWAY",
    lastSeen: minutesAgo(5),
    lastMessage: {
      content:
        "This is a very long message content to test truncation in the conversation list preview as well. It should ideally end with an ellipsis.",
      createdAt: hoursAgo(1),
      isOwn: false,
      status: "READ",
      type: "TEXT",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-unread-max",
    participantId: "user-chatter",
    participantFullName: "Chatty Cathy",
    participantAvatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "Did you see my last 99 messages?",
      createdAt: minutesAgo(1),
      isOwn: false,
      status: "DELIVERED",
      type: "TEXT",
    },
    unreadCount: 999,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-empty",
    participantId: "user-new",
    participantFullName: "New Friend",
    participantAvatar: null,
    onlineStatus: "ONLINE",
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
];

export const MOCK_DIRECT_CHATS: Record<string, DirectChat> = {
  "dm-playground": createMockChat({
    id: "dm-playground",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-playground",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-designer",
        chatId: "dm-playground",
        user: createMockUser({
          id: "user-designer",
          fullName: "✨ DM Design Playground",
          avatar:
            "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
          onlineStatus: "ONLINE",
        }),
      },
    ],
    createdAt: hoursAgo(100),
  }),
  "dm-1": createMockChat({
    id: "dm-1",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-1",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-jordan",
        chatId: "dm-1",
        user: createMockUser({
          id: "user-jordan",
          fullName: "Jordan Lee",
          avatar:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
          onlineStatus: "ONLINE",
        }),
      },
    ],
    createdAt: daysAgo(30),
  }),
  "dm-2": createMockChat({
    id: "dm-2",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-2",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-sam",
        chatId: "dm-2",
        user: createMockUser({
          id: "user-sam",
          fullName: "Sam Rivera",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
          onlineStatus: "AWAY",
        }),
      },
    ],
    createdAt: daysAgo(45),
  }),
  "dm-3": createMockChat({
    id: "dm-3",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-3",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-casey",
        chatId: "dm-3",
        user: createMockUser({
          id: "user-casey",
          fullName: "Casey Chen",
          avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
          onlineStatus: "ONLINE",
        }),
      },
    ],
    createdAt: daysAgo(20),
  }),
  "dm-4": createMockChat({
    id: "dm-4",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-4",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-taylor",
        chatId: "dm-4",
        user: createMockUser({
          id: "user-taylor",
          fullName: "Taylor Morgan",
          avatar:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
          onlineStatus: "OFFLINE",
        }),
      },
    ],
    createdAt: daysAgo(60),
  }),
  "dm-long-name": createMockChat({
    id: "dm-long-name",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-long-name",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-overflow",
        chatId: "dm-long-name",
        user: createMockUser({
          id: "user-overflow",
          fullName: "Alexandros Bartholomew Montgomery-Wickens III",
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80",
          onlineStatus: "AWAY",
        }),
      },
    ],
    createdAt: daysAgo(5),
  }),
  "dm-unread-max": createMockChat({
    id: "dm-unread-max",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-unread-max",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-chatter",
        chatId: "dm-unread-max",
        user: createMockUser({
          id: "user-chatter",
          fullName: "Chatty Cathy",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
          onlineStatus: "ONLINE",
        }),
      },
    ],
    createdAt: daysAgo(1),
  }),
  "dm-empty": createMockChat({
    id: "dm-empty",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-empty",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: "user-new",
        chatId: "dm-empty",
        user: createMockUser({
          id: "user-new",
          fullName: "New Friend",
          avatar: null,
          onlineStatus: "ONLINE",
        }),
      },
    ],
    createdAt: minutesAgo(10),
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
          waveform: [10, 20, 30, 40, 50, 40, 30, 20, 10, 20, 30, 40, 50],
        }),
      ],
    }),
    createMockMessage({
      id: "dm-p-4",
      chatId: "dm-playground",
      senderId: "user-designer",
      content: "This is a failed message to test the retry UI.",
      createdAt: hoursAgo(22),
      status: "FAILED",
    }),
    createMockMessage({
      id: "dm-p-5",
      chatId: "dm-playground",
      senderId: CURRENT_USER_ID,
      content: "And I am currently sending this one...",
      createdAt: hoursAgo(0.1),
      status: "SENDING",
    }),
    createMockMessage({
      id: "dm-p-6",
      chatId: "dm-playground",
      senderId: "user-designer",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      createdAt: hoursAgo(20),
      status: "READ",
    }),
    createMockMessage({
      id: "dm-p-7",
      chatId: "dm-playground",
      senderId: "user-designer",
      content:
        "Line 1\nLine 2\nLine 3 with some more text to see how multiple lines behave in the bubble.",
      createdAt: hoursAgo(19),
      status: "READ",
    }),
    createMockMessage({
      id: "dm-p-8",
      chatId: "dm-playground",
      senderId: "user-designer",
      content:
        "Check out https://google.com and also https://github.com/teamforge",
      createdAt: hoursAgo(18),
      status: "READ",
    }),
    createMockMessage({
      id: "dm-p-9",
      chatId: "dm-playground",
      senderId: "user-designer",
      content: "👍🔥",
      createdAt: hoursAgo(17),
      status: "READ",
    }),
    createMockMessage({
      id: "dm-p-10",
      chatId: "dm-playground",
      senderId: "system",
      content: "Encryption is enabled. Your messages are private.",
      createdAt: hoursAgo(50),
      type: "SYSTEM",
      status: "SENT",
    }),
    createMockMessage({
      id: "dm-p-11",
      chatId: "dm-playground",
      senderId: "user-designer",
      content: "Here is the project brief for the upcoming forge.",
      createdAt: hoursAgo(16),
      status: "READ",
      attachments: [
        createMockAttachment({
          id: "dm-patt-3",
          type: "FILE",
          name: "Project_Brief_v2.pdf",
          size: 2048576,
          mimeType: "application/pdf",
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
