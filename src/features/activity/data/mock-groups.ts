import type { Group, GroupPreview } from "../types/groups.types";
import {
  createMockUser,
  createMockMessage,
  createMockGroup,
  createMockPlan,
  createMockGroupMember,
  createMockAttachment,
} from "./mock-utils";
import type { Message } from "@/shared/schemas";

// Helper to create ISO dates relative to now
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

export const CURRENT_USER_ID = "user-current";

export const MOCK_GROUP_PREVIEWS: GroupPreview[] = [
  {
    id: "design-playground",
    name: "✨ UI Design Playground",
    avatar:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
    planTitle: "Visual Test Suite",
    planCategory: "TECH",
    planCoverImage:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
    planDateTime: daysFromNow(1),
    planStatus: "DRAFT",
    status: "ACTIVE",
    memberCount: 2,
    memberAvatars: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "Welcome to the interactive playground! 🚀",
      sender: {
        fullName: "System",
        avatar: null,
      },
      createdAt: hoursAgo(0.1),
      isSystem: true,
      type: "SYSTEM",
    },
    unreadCount: 0,
  },
  {
    id: "group-1",
    name: "Trail Blazers",
    avatar:
      "https://images.unsplash.com/photo-1551632432-c735e7a93522?w=200&h=200&fit=crop&q=80",
    planTitle: "Weekend Hiking Adventure",
    planCategory: "OUTDOORS",
    planCoverImage:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=60",
    planDateTime: daysFromNow(3),
    planStatus: "CONFIRMED",
    status: "ACTIVE",
    memberCount: 4,
    memberAvatars: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "Yeah, definitely! Can't wait.",
      type: "TEXT",
      sender: {
        fullName: "Sam",
        avatar: null,
      },
      createdAt: hoursAgo(0.4),
      isSystem: false,
    },
    unreadCount: 3,
  },
  {
    id: "group-long-name",
    name: "The Extraordinary League of Super Hiking Adventurers and Nature Enthusiasts and Outdoor People Who Like to Walk Very Far",
    avatar:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=200&fit=crop&q=80",
    planTitle:
      "The Great Expedition to the Highest Peaks of the Northern Range",
    planCategory: "OUTDOORS",
    planCoverImage:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
    planDateTime: daysFromNow(10),
    planStatus: "PROPOSED",
    status: "PLANNING",
    memberCount: 5,
    memberAvatars: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content:
        "Let's make sure everyone brings enough water for the long haul.",
      type: "TEXT",
      sender: { fullName: "Arthur", avatar: null },
      createdAt: hoursAgo(2),
      isSystem: false,
    },
    unreadCount: 0,
  },
  {
    id: "group-unread-max",
    name: "Chatty Group",
    avatar:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200&h=200&fit=crop&q=80",
    planTitle: "Coffee and Code",
    planCategory: "SOCIAL",
    planCoverImage:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80",
    planDateTime: daysFromNow(1),
    planStatus: "CONFIRMED",
    status: "ACTIVE",
    memberCount: 3,
    memberAvatars: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "I'm sending so many messages right now!",
      type: "TEXT",
      sender: { fullName: "Sam", avatar: null },
      createdAt: hoursAgo(0.01),
      isSystem: false,
    },
    unreadCount: 999,
  },
  {
    id: "group-full",
    name: "Maximum Efficiency",
    avatar:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=200&h=200&fit=crop&q=80",
    planTitle: "Strategy Session",
    planCategory: "TECH",
    planCoverImage:
      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&q=80",
    planDateTime: daysFromNow(2),
    planStatus: "CONFIRMED",
    status: "ACTIVE",
    memberCount: 8,
    memberAvatars: [
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "Group is full and ready to go!",
      type: "SYSTEM",
      sender: { fullName: "System", avatar: null },
      createdAt: hoursAgo(5),
      isSystem: true,
    },
    unreadCount: 0,
  },
];

export const MOCK_GROUPS: Record<string, Group> = {
  "design-playground": createMockGroup({
    id: "design-playground",
    name: "✨ UI Design Playground",
    avatar:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
    description:
      "A centralized test suite for verifying UnifiedMessage visual states and interactions.",
    createdAt: hoursAgo(720),
    members: [
      createMockGroupMember({
        userId: CURRENT_USER_ID,
        role: "ADMIN",
        joinedAt: hoursAgo(72),
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      }),
      createMockGroupMember({
        userId: "user-designer",
        role: "MEMBER",
        joinedAt: hoursAgo(70),
        user: createMockUser({ id: "user-designer", fullName: "Designer" }),
      }),
    ],
    plan: createMockPlan({
      id: "plan-playground",
      title: "Visual Test Suite",
      description: "Testing all possible message variants.",
      category: "TECH",
      coverImage:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      dateTime: daysFromNow(1),
      location: "Design Studio",
      status: "DRAFT",
    }),
  }),
  "group-1": createMockGroup({
    id: "group-1",
    name: "Trail Blazers",
    avatar:
      "https://images.unsplash.com/photo-1551632432-c735e7a93522?w=200&h=200&fit=crop&q=80",
    description:
      "Outdoor enthusiast and trail runner. Always looking for new adventures!",
    createdAt: hoursAgo(500),
    members: [
      createMockGroupMember({
        userId: CURRENT_USER_ID,
        role: "MEMBER",
        joinedAt: hoursAgo(48),
        user: createMockUser({ id: CURRENT_USER_ID, fullName: "Alex" }),
      }),
      createMockGroupMember({
        userId: "user-jordan",
        role: "ADMIN",
        joinedAt: hoursAgo(50),
        user: createMockUser({ id: "user-jordan", fullName: "Jordan" }),
      }),
    ],
    plan: createMockPlan({
      id: "plan-1",
      title: "Weekend Hiking Adventure",
      category: "OUTDOORS",
      coverImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=60",
      dateTime: daysFromNow(3),
      status: "CONFIRMED",
    }),
  }),
  "group-long-name": createMockGroup({
    id: "group-long-name",
    name: "The Extraordinary League of Super Hiking Adventurers and Nature Enthusiasts and Outdoor People Who Like to Walk Very Far",
    description:
      "This is a very long group description to test how it is handled in the group detail panel. It should be scrollable or truncated with a 'show more' option depending on the UI design.",
    members: [
      createMockGroupMember({ userId: CURRENT_USER_ID, role: "MEMBER" }),
      createMockGroupMember({
        userId: "user-1",
        role: "MEMBER",
        user: createMockUser({ id: "user-1", fullName: "Arthur" }),
      }),
      createMockGroupMember({
        userId: "user-2",
        role: "MEMBER",
        user: createMockUser({ id: "user-2", fullName: "Beth" }),
      }),
      createMockGroupMember({
        userId: "user-3",
        role: "MEMBER",
        user: createMockUser({ id: "user-3", fullName: "Charles" }),
      }),
      createMockGroupMember({
        userId: "user-4",
        role: "MEMBER",
        user: createMockUser({ id: "user-4", fullName: "Diana" }),
      }),
    ],
    plan: createMockPlan({
      id: "plan-long",
      title: "The Great Expedition to the Highest Peaks of the Northern Range",
      status: "PROPOSED",
      category: "OUTDOORS",
    }),
  }),
  "group-full": createMockGroup({
    id: "group-full",
    name: "Maximum Efficiency",
    members: Array.from({ length: 8 }).map((_, i) =>
      createMockGroupMember({
        userId: `user-full-${i}`,
        user: createMockUser({
          id: `user-full-${i}`,
          fullName: `Member ${i + 1}`,
          avatar: `https://i.pravatar.cc/150?u=user-full-${i}`,
        }),
      }),
    ),
    plan: createMockPlan({
      id: "plan-full",
      title: "Strategy Session",
      status: "CONFIRMED",
      category: "TECH",
    }),
  }),
};

export const MOCK_GROUP_MESSAGES: Record<string, Message[]> = {
  "design-playground": [
    createMockMessage({
      id: "msg-p-1",
      chatId: "chat-playground",
      senderId: "system",
      content: "Welcome to the interactive playground! 🚀",
      createdAt: hoursAgo(72),
      type: "SYSTEM",
      status: "READ",
    }),
    createMockMessage({
      id: "msg-p-2",
      chatId: "chat-playground",
      senderId: "user-designer",
      content: "Hey everyone! Let's test some messages.",
      createdAt: hoursAgo(70),
      status: "READ",
    }),
    createMockMessage({
      id: "msg-p-3",
      chatId: "chat-playground",
      senderId: "system",
      content: "Plan details updated: Time changed to 6:00 PM",
      createdAt: hoursAgo(69),
      type: "PLAN_UPDATE",
      status: "READ",
    }),
    createMockMessage({
      id: "msg-p-4",
      chatId: "chat-playground",
      senderId: "user-designer",
      content: "Does this time work for everyone?",
      createdAt: hoursAgo(68),
      status: "READ",
      reactions: [
        {
          emoji: "👍",
          createdAt: hoursAgo(67),
          messageId: "msg-p-4",
          userId: CURRENT_USER_ID,
        },
        {
          emoji: "🚀",
          createdAt: hoursAgo(67),
          messageId: "msg-p-4",
          userId: "user-designer",
        },
      ],
    }),
    createMockMessage({
      id: "msg-p-5",
      chatId: "chat-playground",
      senderId: "user-designer",
      content: "Look at these designs!",
      createdAt: hoursAgo(66),
      status: "READ",
      attachments: [
        createMockAttachment({
          id: "att-1",
          name: "desktop.png",
          url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
        }),
        createMockAttachment({
          id: "att-2",
          name: "mobile.png",
          url: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80",
        }),
      ],
    }),
  ],
  "group-1": [
    createMockMessage({
      id: "msg-1-1",
      chatId: "chat-1",
      senderId: "user-jordan",
      content: "Who's excited for Saturday?",
      createdAt: hoursAgo(10),
      status: "READ",
    }),
  ],
};
