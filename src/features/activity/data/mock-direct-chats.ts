import type {
  DirectChat,
  DirectChatPreview,
} from "../types/direct-chats.types";
import {
  createMockUser,
  createMockMessage,
  createMockChat,
  createMockAttachment,
  getUnsplashImage,
  MOCK_AVATARS,
} from "./mock-utils";
import type { Message } from "@/shared/schemas";

export const CURRENT_USER_ID = "user-current";

// Helper to create ISO dates relative to now
const minsAgo = (m: number) =>
  new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();

// Participants
const PARTICIPANTS = {
  jordan: createMockUser({
    id: "u-jordan-dm",
    fullName: "Jordan Lee",
    avatar: getUnsplashImage(MOCK_AVATARS.jordan, 150, 150),
    onlineStatus: "ONLINE",
    personalityType: "ENFJ",
  }),
  sam: createMockUser({
    id: "u-sam-dm",
    fullName: "Sam Rivera",
    avatar: getUnsplashImage(MOCK_AVATARS.sam, 150, 150),
    onlineStatus: "AWAY",
    personalityType: "INFP",
  }),
  casey: createMockUser({
    id: "u-casey-dm",
    fullName: "Casey Chen",
    avatar: getUnsplashImage(MOCK_AVATARS.casey, 150, 150),
    onlineStatus: "ONLINE",
    personalityType: "ENTP",
  }),
  taylor: createMockUser({
    id: "u-taylor-dm",
    fullName: "Taylor Morgan",
    avatar: getUnsplashImage(MOCK_AVATARS.taylor, 150, 150),
    onlineStatus: "OFFLINE",
    personalityType: "INTJ",
  }),
};

// -----------------------------------------------------------------------------
// 1. MAIN DM SHOWCASE: "Jordan Lee"
// -----------------------------------------------------------------------------

const dmShowcaseId = "dm-showcase";

export const MOCK_DIRECT_CHATS: Record<string, DirectChat> = {
  [dmShowcaseId]: createMockChat({
    id: dmShowcaseId,
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: dmShowcaseId,
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      },
      {
        userId: PARTICIPANTS.jordan.id,
        chatId: dmShowcaseId,
        user: PARTICIPANTS.jordan,
      },
    ],
    createdAt: daysAgo(30),
  }),

  // -----------------------------------------------------------------------------
  // 10 EDGE CASE DMs
  // -----------------------------------------------------------------------------

  "dm-void": createMockChat({
    id: "dm-void",
    participants: [
      {
        userId: CURRENT_USER_ID,
        chatId: "dm-void",
        user: createMockUser({ id: CURRENT_USER_ID }),
      },
      {
        userId: "u-new",
        chatId: "dm-void",
        user: createMockUser({
          id: "u-new",
          fullName: "New Friend",
          avatar: null,
        }),
      },
    ],
  }),

  "dm-overflow": createMockChat({
    id: "dm-overflow",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-overflow" },
      {
        userId: "u-long",
        chatId: "dm-overflow",
        user: createMockUser({
          id: "u-long",
          fullName: "Alexandros Bartholomew Montgomery-Wickens III",
          avatar: getUnsplashImage(MOCK_AVATARS.alex, 150, 150),
        }),
      },
    ],
  }),

  "dm-failed": createMockChat({
    id: "dm-failed",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-failed" },
      {
        userId: PARTICIPANTS.sam.id,
        chatId: "dm-failed",
        user: PARTICIPANTS.sam,
      },
    ],
  }),

  "dm-muted": createMockChat({
    id: "dm-muted",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-muted" },
      {
        userId: PARTICIPANTS.casey.id,
        chatId: "dm-muted",
        user: PARTICIPANTS.casey,
      },
    ],
  }),

  "dm-sending": createMockChat({
    id: "dm-sending",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-sending" },
      {
        userId: PARTICIPANTS.taylor.id,
        chatId: "dm-sending",
        user: PARTICIPANTS.taylor,
      },
    ],
  }),

  "dm-one-way": createMockChat({
    id: "dm-one-way",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-one-way" },
      {
        userId: PARTICIPANTS.sam.id,
        chatId: "dm-one-way",
        user: PARTICIPANTS.sam,
      },
    ],
  }),

  "dm-echo": createMockChat({
    id: "dm-echo",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-echo" },
      {
        userId: PARTICIPANTS.casey.id,
        chatId: "dm-echo",
        user: PARTICIPANTS.casey,
      },
    ],
  }),

  "dm-files": createMockChat({
    id: "dm-files",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-files" },
      {
        userId: "u-files",
        chatId: "dm-files",
        user: createMockUser({
          id: "u-files",
          fullName: "File Cabinet",
          avatar: getUnsplashImage(MOCK_AVATARS.robot, 150, 150),
        }),
      },
    ],
  }),

  "dm-ancient": createMockChat({
    id: "dm-ancient",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-ancient" },
      {
        userId: "u-ancient",
        chatId: "dm-ancient",
        user: createMockUser({
          id: "u-ancient",
          fullName: "Old School",
          avatar: getUnsplashImage(MOCK_AVATARS.city, 150, 150),
        }),
      },
    ],
  }),

  "dm-unread-max": createMockChat({
    id: "dm-unread-max",
    participants: [
      { userId: CURRENT_USER_ID, chatId: "dm-unread-max" },
      {
        userId: "u-chatty",
        chatId: "dm-unread-max",
        user: createMockUser({
          id: "u-chatty",
          fullName: "Chatty Cathy",
          avatar: getUnsplashImage(MOCK_AVATARS.taylor, 150, 150),
        }),
      },
    ],
  }),
};

// -----------------------------------------------------------------------------
// PREVIEWS
// -----------------------------------------------------------------------------

export const MOCK_DIRECT_CHAT_PREVIEWS: DirectChatPreview[] = Object.values(
  MOCK_DIRECT_CHATS,
).map((chat) => {
  const otherParticipant = (chat.participants || []).find(
    (p) => p.userId !== CURRENT_USER_ID,
  )?.user;

  return {
    id: chat.id,
    participantId: otherParticipant?.id || "unknown",
    participantFullName: otherParticipant?.fullName || "Unknown User",
    participantAvatar: otherParticipant?.avatar || null,
    onlineStatus: otherParticipant?.onlineStatus || "OFFLINE",
    unreadCount: chat.id === "dm-unread-max" ? 999 : 0,
    isTyping: chat.id === "dm-showcase",
    isMuted: chat.id === "dm-muted",
    lastMessage:
      chat.id === "dm-showcase"
        ? {
            content: "Let's definitely catch up soon!",
            createdAt: minsAgo(1),
            isOwn: false,
            status: "READ",
            type: "TEXT",
          }
        : undefined,
  };
});

// -----------------------------------------------------------------------------
// MESSAGES
// -----------------------------------------------------------------------------

export const MOCK_DIRECT_MESSAGES: Record<string, Message[]> = {
  [dmShowcaseId]: [
    createMockMessage({
      senderId: "system",
      type: "SYSTEM",
      content:
        "Messages are end-to-end encrypted. No one outside of this chat, not even TeamForge, can read them.",
      createdAt: daysAgo(30),
    }),
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      sender: PARTICIPANTS.jordan,
      content: "Hey Alex! Great meeting you today at the park.",
      createdAt: daysAgo(2),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "You too! That sunrise was incredible.",
      createdAt: daysAgo(2),
    }),

    // Media heavy
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      sender: PARTICIPANTS.jordan,
      content: "Here's that portrait I took. The lighting was perfect!",
      attachments: [
        createMockAttachment({
          url: getUnsplashImage("1511367461989-f85a21fda167", 1200, 1600),
          name: "Sunrise_Portrait.jpg",
        }),
      ],
      createdAt: daysAgo(1),
    }),

    // Pinned
    createMockMessage({
      id: "dm-pinned-1",
      senderId: PARTICIPANTS.jordan.id,
      sender: PARTICIPANTS.jordan,
      content:
        "This is the spot we talked about: https://maps.google.com/?q=37.7749,-122.4194",
      isPinned: true,
      createdAt: hoursAgo(20),
    }),

    // Long messaging history logic
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      content:
        "I was thinking we could organize a larger group hike next month.",
      createdAt: hoursAgo(18),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "That sounds like a plan. Which trail were you thinking?",
      createdAt: hoursAgo(17),
    }),

    // Voice notes
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      type: "VOICE",
      content: "Voice note",
      attachments: [
        createMockAttachment({
          type: "AUDIO",
          url: "#",
          duration: 42,
          waveform: [10, 30, 20, 60, 40, 80, 20, 10, 40, 60, 30],
        }),
      ],
      createdAt: hoursAgo(16),
    }),

    // File transfer
    createMockMessage({
      senderId: CURRENT_USER_ID,
      type: "FILE",
      content: "Hiking_Guide_2026.pdf",
      attachments: [
        createMockAttachment({
          type: "FILE",
          name: "Hiking_Guide_2026.pdf",
          size: 1024 * 1024 * 5.2,
          mimeType: "application/pdf",
        }),
      ],
      createdAt: hoursAgo(12),
    }),

    // Mixed status
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "Did you get the file?",
      status: "READ",
      createdAt: hoursAgo(5),
    }),
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      content: "Yes! Reading it now. It's super detailed.",
      createdAt: hoursAgo(4),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "Awesome. Let me know what you think.",
      status: "DELIVERED",
      createdAt: hoursAgo(1),
    }),
    createMockMessage({
      senderId: PARTICIPANTS.jordan.id,
      sender: PARTICIPANTS.jordan,
      content: "Let's definitely catch up soon!",
      createdAt: minsAgo(1),
    }),
  ],

  "dm-failed": [
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "First failed attempt...",
      status: "FAILED",
      createdAt: minsAgo(10),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "Second failed attempt...",
      status: "FAILED",
      createdAt: minsAgo(5),
    }),
  ],

  "dm-sending": [
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "This is taking a while to send...",
      status: "SENDING",
      createdAt: minsAgo(1),
    }),
  ],

  "dm-one-way": Array.from({ length: 15 }).map((_, i) =>
    createMockMessage({
      senderId: PARTICIPANTS.sam.id,
      content: `Message #${i + 1} from Sam. Just keeping you updated!`,
      createdAt: hoursAgo(24 - i),
    }),
  ),

  "dm-echo": Array.from({ length: 15 }).map((_, i) =>
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: `Self-note #${i + 1}. Don't forget this!`,
      createdAt: hoursAgo(24 - i),
    }),
  ),

  "dm-ancient": [
    createMockMessage({
      senderId: "u-ancient",
      content: "Remember when we met in 2024?",
      createdAt: "2024-01-01T12:00:00Z",
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "Yeah, long time no see!",
      createdAt: "2024-01-01T12:05:00Z",
    }),
  ],
};
