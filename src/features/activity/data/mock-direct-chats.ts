import type {
  DirectChat,
  DirectChatPreview,
  DirectMessage,
} from "../types/direct-chats.types";

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
    id: "dm-1",
    participantId: "user-jordan",
    participantName: "Jordan Lee",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "Are you coming to the hike on Saturday?",
      timestamp: minutesAgo(5),
      isOwn: false,
      status: "READ",
    },
    unreadCount: 2,
    isTyping: true,
    isMuted: false,
  },
  {
    id: "dm-2",
    participantId: "user-sam",
    participantName: "Sam Rivera",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
    onlineStatus: "AWAY",
    lastSeen: minutesAgo(15),
    lastMessage: {
      content: "Thanks for the recommendations!",
      timestamp: hoursAgo(1),
      isOwn: true,
      status: "DELIVERED",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-3",
    participantId: "user-casey",
    participantName: "Casey Chen",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
    onlineStatus: "ONLINE",
    lastMessage: {
      content: "The React study group was great!",
      timestamp: hoursAgo(3),
      isOwn: false,
      status: "READ",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
  {
    id: "dm-4",
    participantId: "user-taylor",
    participantName: "Taylor Morgan",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor",
    onlineStatus: "OFFLINE",
    lastSeen: hoursAgo(5),
    lastMessage: {
      content: "See you next week!",
      timestamp: daysAgo(1),
      isOwn: true,
      status: "READ",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: true,
  },
  {
    id: "dm-5",
    participantId: "user-alex",
    participantName: "Alex Kim",
    participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    onlineStatus: "OFFLINE",
    lastSeen: daysAgo(2),
    lastMessage: {
      content: "Let me know if you want to join the music session",
      timestamp: daysAgo(3),
      isOwn: false,
      status: "READ",
    },
    unreadCount: 0,
    isTyping: false,
    isMuted: false,
  },
];

export const MOCK_DIRECT_CHATS: Record<string, DirectChat> = {
  "dm-1": {
    id: "dm-1",
    participant: {
      id: "user-jordan",
      name: "Jordan Lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      bio: "Outdoor enthusiast and trail runner. Always looking for new adventures!",
      personalityType: "ENFP",
      onlineStatus: "ONLINE",
    },
    createdAt: daysAgo(30),
    mutualGroups: [
      {
        id: "group-1",
        name: "Trail Blazers",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=trailblazers",
      },
    ],
    isMuted: false,
    isBlocked: false,
  },
  "dm-2": {
    id: "dm-2",
    participant: {
      id: "user-sam",
      name: "Sam Rivera",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
      bio: "Coffee lover, book reader, occasional hiker.",
      personalityType: "INFJ",
      onlineStatus: "AWAY",
      lastSeen: minutesAgo(15),
    },
    createdAt: daysAgo(45),
    mutualGroups: [
      {
        id: "group-1",
        name: "Trail Blazers",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=trailblazers",
      },
    ],
    isMuted: false,
    isBlocked: false,
  },
  "dm-3": {
    id: "dm-3",
    participant: {
      id: "user-casey",
      name: "Casey Chen",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Casey",
      bio: "Full-stack developer. React enthusiast. Building cool stuff.",
      personalityType: "INTJ",
      onlineStatus: "ONLINE",
    },
    createdAt: daysAgo(20),
    mutualGroups: [
      {
        id: "group-2",
        name: "Code Crafters",
        avatar: "https://api.dicebear.com/7.x/shapes/svg?seed=codecrafters",
      },
    ],
    isMuted: false,
    isBlocked: false,
  },
};

export const MOCK_DIRECT_MESSAGES: Record<string, DirectMessage[]> = {
  "dm-1": [
    {
      id: "dm1-msg-1",
      chatId: "dm-1",
      type: "TEXT",
      content: "Hey! How's the trail prep going?",
      senderId: "user-jordan",
      timestamp: hoursAgo(2),
      isOwn: false,
      status: "READ",
    },
    {
      id: "dm1-msg-2",
      chatId: "dm-1",
      type: "TEXT",
      content: "Going well! I got new hiking boots yesterday",
      senderId: CURRENT_USER_ID,
      timestamp: hoursAgo(1.5),
      isOwn: true,
      status: "READ",
    },
    {
      id: "dm1-msg-3",
      chatId: "dm-1",
      type: "TEXT",
      content: "Nice! Make sure to break them in before Saturday",
      senderId: "user-jordan",
      timestamp: hoursAgo(1),
      isOwn: false,
      status: "READ",
    },
    {
      id: "dm1-msg-4",
      chatId: "dm-1",
      type: "TEXT",
      content: "Good thinking. I'll do some walks this week",
      senderId: CURRENT_USER_ID,
      timestamp: hoursAgo(0.5),
      isOwn: true,
      status: "READ",
    },
    {
      id: "dm1-msg-5",
      chatId: "dm-1",
      type: "TEXT",
      content: "Are you coming to the hike on Saturday?",
      senderId: "user-jordan",
      timestamp: minutesAgo(5),
      isOwn: false,
      status: "READ",
    },
  ],
  "dm-2": [
    {
      id: "dm2-msg-1",
      chatId: "dm-2",
      type: "TEXT",
      content: "Do you have any book recommendations?",
      senderId: CURRENT_USER_ID,
      timestamp: hoursAgo(3),
      isOwn: true,
      status: "READ",
    },
    {
      id: "dm2-msg-2",
      chatId: "dm-2",
      type: "TEXT",
      content: "I just finished 'Atomic Habits' - highly recommend it!",
      senderId: "user-sam",
      timestamp: hoursAgo(2.5),
      isOwn: false,
      status: "READ",
    },
    {
      id: "dm2-msg-3",
      chatId: "dm-2",
      type: "TEXT",
      content: "Thanks for the recommendations!",
      senderId: CURRENT_USER_ID,
      timestamp: hoursAgo(1),
      isOwn: true,
      status: "DELIVERED",
    },
  ],
  "dm-3": [
    {
      id: "dm3-msg-1",
      chatId: "dm-3",
      type: "TEXT",
      content: "That study session was really helpful",
      senderId: "user-casey",
      timestamp: hoursAgo(4),
      isOwn: false,
      status: "READ",
    },
    {
      id: "dm3-msg-2",
      chatId: "dm-3",
      type: "TEXT",
      content: "Agreed! I finally understand hooks better now",
      senderId: CURRENT_USER_ID,
      timestamp: hoursAgo(3.5),
      isOwn: true,
      status: "READ",
    },
    {
      id: "dm3-msg-3",
      chatId: "dm-3",
      type: "TEXT",
      content: "The React study group was great!",
      senderId: "user-casey",
      timestamp: hoursAgo(3),
      isOwn: false,
      status: "READ",
    },
  ],
};
