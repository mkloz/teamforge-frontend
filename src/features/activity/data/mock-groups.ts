import type { Message } from "@/shared/schemas";
import type {
  Group,
  GroupPreview,
  PlanHistoryItem,
} from "../types/groups.types";
import {
  createMockAttachment,
  createMockGroup,
  createMockGroupMember,
  createMockMessage,
  createMockPlan,
  createMockUser,
  getUnsplashImage,
  MOCK_AVATARS,
} from "./mock-utils";

export const CURRENT_USER_ID = "user-current";

// Helper to create ISO dates relative to now
const minsAgo = (m: number) =>
  new Date(Date.now() - m * 60 * 1000).toISOString();
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) =>
  new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

// Users for variety
const USERS = {
  jordan: createMockUser({
    id: "u-jordan",
    fullName: "Marcus Thorne",
    avatar: getUnsplashImage(MOCK_AVATARS.jordan, 150, 150),
    personalityType: "ENTJ",
  }),
  sam: createMockUser({
    id: "u-sam",
    fullName: "Elena Rodriguez",
    avatar: getUnsplashImage(MOCK_AVATARS.sam, 150, 150),
    personalityType: "INFJ",
  }),
  casey: createMockUser({
    id: "u-casey",
    fullName: "Sophia Chen",
    avatar: getUnsplashImage(MOCK_AVATARS.casey, 150, 150),
    personalityType: "ENFP",
  }),
  taylor: createMockUser({
    id: "u-taylor",
    fullName: "David Park",
    avatar: getUnsplashImage(MOCK_AVATARS.taylor, 150, 150),
    personalityType: "INTJ",
  }),
};

// -----------------------------------------------------------------------------
// 1. MAIN GROUP SHOWCASE: "Trail Blazers"
// -----------------------------------------------------------------------------

const groupShowcaseId = "group-showcase";

const groupShowcasePlanHistory: PlanHistoryItem[] = [
  {
    id: "h-1",
    title: "City Sunrise Run",
    category: "SPORTS",
    dateTime: daysAgo(10),
    coverImage: getUnsplashImage("1476480862126-209bfaa8edc8", 400, 300),
    status: "COMPLETED",
    location: "Golden Gate Park",
    rating: 4.8,
  },
  {
    id: "h-2",
    title: "Gear Swap & Coffee",
    category: "SOCIAL",
    dateTime: daysAgo(30),
    coverImage: getUnsplashImage("1495474472287-4d71bcdd2085", 400, 300),
    status: "COMPLETED",
    location: "Blue Bottle Coffee",
    rating: 4.5,
  },
];

export const MOCK_GROUPS: Record<string, Group> = {
  [groupShowcaseId]: createMockGroup({
    id: groupShowcaseId,
    name: "Trail Blazers",
    description:
      "The most active hiking group in the city. We explore hidden trails, share gear tips, and forge lasting friendships in the wild. All levels welcome, but a positive attitude is mandatory!",
    avatar: getUnsplashImage(MOCK_AVATARS.hiker, 200, 200),
    members: [
      createMockGroupMember({
        userId: CURRENT_USER_ID,
        role: "ADMIN",
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex (You)" }),
      }),
      createMockGroupMember({
        userId: USERS.jordan.id,
        role: "MODERATOR",
        user: USERS.jordan,
      }),
      createMockGroupMember({ userId: USERS.sam.id, user: USERS.sam }),
      createMockGroupMember({ userId: USERS.casey.id, user: USERS.casey }),
    ],
    plan: createMockPlan({
      id: "p-showcase",
      title: "Weekend Hiking Adventure",
      description:
        "A 12km loop through the Northern Range. We'll stop for lunch at the summit. Bring 2L water and sturdy boots!",
      category: "OUTDOORS",
      coverImage: getUnsplashImage("1501555088652-021faa106b9b", 800, 400),
      dateTime: daysFromNow(2),
      location: "Northern Range Trailhead",
      status: "CONFIRMED",
    }),
    planHistory: groupShowcasePlanHistory,
    chat: {
      id: "chat-showcase",
      type: "GROUP",
      createdAt: daysAgo(5),
      groupId: groupShowcaseId,
      pinnedMessages: [
        createMockMessage({
          id: "msg-pinned-1",
          senderId: CURRENT_USER_ID,
          content:
            "📌 Official Gear List: Please check the pinned messages for the full checklist.",
          createdAt: hoursAgo(18),
          isPinned: true,
          status: "READ",
          sender: createMockUser({
            id: CURRENT_USER_ID,
            fullName: "Alex (You)",
          }),
        }),
      ],
    },
  }),

  // -----------------------------------------------------------------------------
  // 10 EDGE CASE GROUPS
  // -----------------------------------------------------------------------------

  "group-empty": createMockGroup({
    id: "group-empty",
    name: "The Void",
    description: "Testing an empty group with no history or messages.",
    members: [
      createMockGroupMember({ userId: CURRENT_USER_ID, role: "ADMIN" }),
    ],
    plan: undefined, // Explicitly empty plan
  }),

  "group-new": createMockGroup({
    id: "group-new",
    name: "New Beginnings",
    description: "Just formed! No plans yet.",
    members: [
      createMockGroupMember({ userId: CURRENT_USER_ID, role: "ADMIN" }),
      createMockGroupMember({ userId: USERS.sam.id, user: USERS.sam }),
    ],
    plan: createMockPlan({
      status: "DRAFT",
      title: "Deciding on our first trip...",
    }),
  }),

  "group-planning-hell": createMockGroup({
    id: "group-planning-hell",
    name: "Planning Hell",
    description: "Too many updates to keep track of.",
  }),

  "group-emoji": createMockGroup({
    id: "group-emoji",
    name: "Emoji Enthusiasts 🌈✨",
    avatar: getUnsplashImage("1493612276216-ee39255c0721", 200, 200),
  }),

  "group-attachments": createMockGroup({
    id: "group-attachments",
    name: "The Photo Album",
    avatar: getUnsplashImage("1554048612-b6a482bc67e5", 200, 200),
  }),

  "group-full": createMockGroup({
    id: "group-full",
    name: "Maximum Capacity",
    maxMembers: 10,
    members: Array.from({ length: 10 }).map((_, i) =>
      createMockGroupMember({
        userId: `u-full-${i}`,
        user: createMockUser({
          id: `u-full-${i}`,
          fullName: `Member ${i + 1}`,
          avatar: `https://i.pravatar.cc/150?u=${i}`,
        }),
      }),
    ),
  }),

  "group-long-name": createMockGroup({
    id: "group-long-name",
    name: "The Extraordinary League of Super Hiking Adventurers and Nature Enthusiasts and Outdoor People Who Like to Walk Very Far",
    description:
      "This group name and description are intentionally extremely long to test layout overflows and truncation logic in the sidebar and detail panels.",
  }),

  "group-deleted": createMockGroup({
    id: "group-deleted",
    name: "Redacted Memories",
    avatar: getUnsplashImage("1516975080664-ed2fc6a32937", 200, 200),
  }),

  "group-edited": createMockGroup({
    id: "group-edited",
    name: "The Revisionists",
    avatar: getUnsplashImage("1455390582262-044cdead277a", 200, 200),
  }),

  "group-history-heavy": createMockGroup({
    id: "group-history-heavy",
    name: "Legacy Legends",
    planHistory: Array.from({ length: 8 }).map((_, i) => ({
      id: `h-heavy-${i}`,
      title: `Epic Quest #${i + 1}`,
      category: "TRAVEL",
      dateTime: daysAgo(i * 15 + 10),
      coverImage: getUnsplashImage(
        `1503220317375-aaad61436b1b?sig=${i}`,
        400,
        300,
      ),
      status: "COMPLETED",
      rating: 4.0 + (i % 2) * 0.5,
    })),
  }),
};

// -----------------------------------------------------------------------------
// PREVIEWS
// -----------------------------------------------------------------------------

export const MOCK_GROUP_PREVIEWS: GroupPreview[] = Object.values(
  MOCK_GROUPS,
).map((g) => ({
  id: g.id,
  name: g.name,
  avatar: g.avatar,
  status: g.status,
  planTitle: g.plan?.title || "No active plan",
  planCategory: g.plan?.category || "OTHER",
  planCoverImage: g.plan?.coverImage || "",
  planDateTime: g.plan?.dateTime || "",
  planStatus: g.plan?.status || "DRAFT",
  memberCount: g.members?.length || 0,
  memberAvatars: (g.members || []).slice(0, 4).map((m) => m.user?.avatar || ""),
  unreadCount: g.id === "group-full" ? 999 : 0,
  lastMessage:
    g.id === "group-showcase"
      ? {
          content: "Can't wait for the hike! 🏔️",
          sender: {
            fullName: USERS.jordan.fullName,
            avatar: USERS.jordan.avatar || "",
          },
          createdAt: minsAgo(2),
          isSystem: false,
          type: "TEXT",
        }
      : undefined,
}));

// -----------------------------------------------------------------------------
// MESSAGES
// -----------------------------------------------------------------------------

export const MOCK_GROUP_MESSAGES: Record<string, Message[]> = {
  [groupShowcaseId]: [
    createMockMessage({
      senderId: "system",
      type: "SYSTEM",
      content: "Group 'Trail Blazers' created by Alex.",
      createdAt: daysAgo(5),
    }),
    createMockMessage({
      senderId: USERS.jordan.id,
      sender: USERS.jordan,
      content: "Hey everyone! Welcome to the group.",
      createdAt: daysAgo(4),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      sender: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex (You)" }),
      content: "Thanks Jordan! Looking forward to our first hike.",
      createdAt: daysAgo(4),
    }),
    createMockMessage({
      senderId: "system",
      type: "PLAN_UPDATE",
      content: "Alex proposed a new plan: Weekend Hiking Adventure.",
      createdAt: daysAgo(3),
    }),
    createMockMessage({
      senderId: USERS.sam.id,
      sender: USERS.sam,
      content: "I'm in! I've been wanting to visit the Northern Range.",
      createdAt: daysAgo(2),
    }),

    // Multi-line and long text
    createMockMessage({
      senderId: USERS.taylor.id,
      sender: USERS.taylor,
      content:
        "This project looks mathematically sound. I've analyzed the terrain and we should expect a 12% incline over the first 4km.\n\nRequired gear:\n- Hiking boots\n- 2L Water\n- Light snacks\n- Sunscreen\n- First aid kit",
      createdAt: daysAgo(1),
    }),

    // Image grid (sent via multiple messages or attachments)
    createMockMessage({
      senderId: USERS.casey.id,
      sender: USERS.casey,
      content: "Check out these photos from my last trip there!",
      attachments: [
        createMockAttachment({
          url: getUnsplashImage("1464822759023-fed622ff2c3b"),
          name: "view1.jpg",
        }),
        createMockAttachment({
          url: getUnsplashImage("1501555088652-021faa106b9b"),
          name: "view2.jpg",
        }),
      ],
      createdAt: hoursAgo(20),
    }),

    // Pinned messages logic (isPinned usually true)
    createMockMessage({
      id: "msg-pinned-1",
      senderId: CURRENT_USER_ID,
      content:
        "📌 Official Gear List: Please check the pinned messages for the full checklist.",
      isPinned: true,
      createdAt: hoursAgo(18),
    }),

    // Voice message
    createMockMessage({
      senderId: USERS.jordan.id,
      sender: USERS.jordan,
      type: "VOICE",
      content: "Voice note",
      attachments: [
        createMockAttachment({
          type: "AUDIO",
          url: "#",
          duration: 15,
          waveform: [20, 50, 30, 80, 40, 90, 30, 20, 50],
        }),
      ],
      createdAt: hoursAgo(15),
    }),

    // File
    createMockMessage({
      senderId: USERS.taylor.id,
      sender: USERS.taylor,
      type: "FILE",
      content: "Trail_Map_Detail.pdf",
      attachments: [
        createMockAttachment({
          type: "FILE",
          name: "Trail_Map_Detail.pdf",
          size: 1024 * 1024 * 2.5,
          mimeType: "application/pdf",
        }),
      ],
      createdAt: hoursAgo(12),
    }),

    // Replies
    createMockMessage({
      id: "msg-reply-target",
      senderId: USERS.sam.id,
      sender: USERS.sam,
      content: "Does anyone have a spare compass?",
      createdAt: hoursAgo(10),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "I have an extra one you can borrow!",
      replyToId: "msg-reply-target",
      createdAt: hoursAgo(9),
    }),

    // Reactions
    createMockMessage({
      senderId: USERS.jordan.id,
      content: "Weather forecast looks perfect for Saturday! ☀️",
      reactions: [
        {
          emoji: "🙌",
          userId: CURRENT_USER_ID,
          messageId: "m1",
          createdAt: hoursAgo(5),
        },
        {
          emoji: "🔥",
          userId: USERS.sam.id,
          messageId: "m1",
          createdAt: hoursAgo(4),
        },
      ],
      createdAt: hoursAgo(6),
    }),

    // Status variants
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "I'll be bringing some homemade granola bars for everyone.",
      status: "READ",
      createdAt: hoursAgo(3),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "See you all at the trailhead!",
      status: "SENT",
      createdAt: minsAgo(15),
    }),

    // EXTREME EDGE CASES
    createMockMessage({
      senderId: USERS.casey.id,
      content: "Look at this panorama I took! It's super wide.",
      attachments: [
        createMockAttachment({
          url: getUnsplashImage("1464822759023-fed622ff2c3b", 2400, 600),
          name: "panorama.jpg",
        }),
      ],
      createdAt: minsAgo(10),
    }),

    createMockMessage({
      senderId: USERS.sam.id,
      content:
        "This message has way too many reactions to test the wrapping logic of the reaction pills in the UI.",
      reactions: [
        {
          emoji: "🙌",
          userId: CURRENT_USER_ID,
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "🔥",
          userId: USERS.sam.id,
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "❤️",
          userId: USERS.jordan.id,
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "🏔️",
          userId: USERS.taylor.id,
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "🚀",
          userId: "u-ext-1",
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "✨",
          userId: "u-ext-2",
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "💯",
          userId: "u-ext-3",
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
        {
          emoji: "👍",
          userId: "u-ext-4",
          messageId: "m-ext",
          createdAt: minsAgo(8),
        },
      ],
      createdAt: minsAgo(8),
    }),

    createMockMessage({
      senderId: USERS.taylor.id,
      content: "Multiple file attachments in a single message.",
      attachments: [
        createMockAttachment({
          type: "FILE",
          name: "Safety_Guidelines.pdf",
          size: 512000,
        }),
        createMockAttachment({
          type: "FILE",
          name: "Emergency_Contacts.docx",
          size: 128000,
        }),
        createMockAttachment({
          type: "FILE",
          name: "Trail_Map.png",
          size: 2048000,
        }),
      ],
      createdAt: minsAgo(5),
    }),

    createMockMessage({
      senderId: USERS.jordan.id,
      content: "Can't wait for the hike! 🏔️",
      createdAt: minsAgo(2),
    }),
  ],

  "group-planning-hell": Array.from({ length: 12 }).map((_, i) =>
    createMockMessage({
      senderId: "system",
      type: "PLAN_UPDATE",
      content:
        i % 2 === 0 ? "Location changed to Site B" : "Time updated to 4:00 PM",
      createdAt: hoursAgo(24 - i),
    }),
  ),

  "group-emoji": [
    createMockMessage({
      senderId: USERS.sam.id,
      content: "🚀",
      createdAt: hoursAgo(1),
    }),
    createMockMessage({
      senderId: USERS.casey.id,
      content: "✨✨✨",
      createdAt: minsAgo(30),
    }),
    createMockMessage({
      senderId: CURRENT_USER_ID,
      content: "🔥💯",
      createdAt: minsAgo(5),
    }),
  ],

  "group-attachments": [
    createMockMessage({
      senderId: USERS.jordan.id,
      attachments: Array.from({ length: 4 }).map((_, i) =>
        createMockAttachment({
          url: getUnsplashImage(`1506744038136-46273834b3fb?sig=${i}`),
          name: `pic_${i}.jpg`,
        }),
      ),
      createdAt: hoursAgo(2),
    }),
  ],

  "group-deleted": [
    createMockMessage({
      senderId: USERS.sam.id,
      content: "Wait, don't read this!",
      createdAt: hoursAgo(5),
      deletedAt: daysAgo(0),
    }),
    createMockMessage({
      senderId: USERS.sam.id,
      content: "Oops, deleted another one.",
      createdAt: hoursAgo(4),
      deletedAt: daysAgo(0),
    }),
  ],

  "group-edited": [
    createMockMessage({
      senderId: USERS.casey.id,
      content: "I will be late... actually I'll be early!",
      isEdited: true,
      editedAt: minsAgo(5),
      createdAt: minsAgo(10),
    }),
  ],
};
