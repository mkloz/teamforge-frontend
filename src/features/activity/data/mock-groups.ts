import type { Group, GroupPreview } from "../types/groups.types";
import {
  createMockUser,
  createMockMessage,
  createMockGroup,
  createMockPlan,
  createMockGroupMember,
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
