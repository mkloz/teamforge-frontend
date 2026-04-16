import type { Group, GroupPreview, Message } from "../types/groups.types";

// Helper to create ISO dates relative to now
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysFromNow = (d: number) =>
  new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();

export const CURRENT_USER_ID = "user-current";

export const MOCK_GROUP_PREVIEWS: GroupPreview[] = [
  {
    id: "design-playground",
    groupName: "✨ UI Design Playground",
    groupAvatar:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
    planTitle: "Visual Test Suite",
    planCategory: "Tech",
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
      senderName: "System",
      timestamp: hoursAgo(0.1),
      isSystem: true,
    },
    unreadCount: 0,
  },
  {
    id: "group-1",
    groupName: "Trail Blazers",
    groupAvatar:
      "https://images.unsplash.com/photo-1551632432-c735e7a93522?w=200&h=200&fit=crop&q=80",
    planTitle: "Weekend Hiking Adventure",
    planCategory: "Outdoors",
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
      content: "",
      type: "VOICE",
      senderName: "Sam",
      timestamp: hoursAgo(0.4),
      isSystem: false,
    },
    unreadCount: 3,
  },
  {
    id: "group-2",
    groupName: "Code Crafters",
    groupAvatar:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop&q=80",
    planTitle: "React Study Group",
    planCategory: "Tech",
    planCoverImage:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=60",
    planDateTime: daysFromNow(1),
    planStatus: "CONFIRMED",
    status: "ACTIVE",
    memberCount: 5,
    memberAvatars: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "I'll bring my laptop and the React docs",
      senderName: "Casey",
      timestamp: hoursAgo(2),
      isSystem: false,
    },
    unreadCount: 0,
  },
  {
    id: "group-3",
    groupName: "Game Night Crew",
    groupAvatar:
      "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=200&h=200&fit=crop&q=80",
    planTitle: "Board Game Night",
    planCategory: "Social",
    planCoverImage:
      "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=60",
    planDateTime: daysFromNow(5),
    planStatus: "DRAFT",
    status: "PENDING",
    memberCount: 3,
    memberAvatars: [
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1567532939604-b6b5b0ad2604?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "Should we do Friday or Saturday?",
      senderName: "Drew",
      timestamp: hoursAgo(5),
      isSystem: false,
    },
    unreadCount: 1,
    pendingProposals: 2,
  },
  {
    id: "group-4",
    groupName: "Jazz Collective",
    groupAvatar:
      "https://images.unsplash.com/photo-1511192303578-4a7b9747d6a5?w=200&h=200&fit=crop&q=80",
    planTitle: "Jazz Jam Session",
    planCategory: "Music",
    planCoverImage:
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=60",
    planDateTime: daysFromNow(7),
    planStatus: "CONFIRMED",
    status: "ACTIVE",
    memberCount: 4,
    memberAvatars: [
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
    ],
    lastMessage: {
      content: "Plan confirmed! See you at the studio.",
      senderName: "System",
      timestamp: hoursAgo(24),
      isSystem: true,
    },
    unreadCount: 0,
  },
];

export const MOCK_GROUPS: Record<string, Group> = {
  "design-playground": {
    id: "design-playground",
    identity: {
      name: "✨ UI Design Playground",
      avatar:
        "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=200&h=200&fit=crop&q=80",
      description:
        "A centralized test suite for verifying UnifiedMessage visual states and interactions.",
      createdAt: hoursAgo(720),
    },
    plan: {
      id: "plan-playground",
      title: "Visual Test Suite",
      description: "Testing all possible message variants.",
      category: "Tech",
      coverImage:
        "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&q=80",
      dateTime: daysFromNow(1),
      location: "Design Studio",
      locationCoords: { lat: 37.7749, lng: -122.4194 },
      status: "DRAFT",
    },
    planHistory: [],
    members: [
      {
        id: CURRENT_USER_ID,
        name: "Alex",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
        personalityType: "ENTJ",
        trustScore: 1.0,
        role: "ADMIN",
        compatibilityScore: 100,
        joinedAt: hoursAgo(72),
      },
      {
        id: "user-designer",
        name: "Designer",
        avatar:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
        personalityType: "INTJ",
        trustScore: 0.95,
        role: "MEMBER",
        compatibilityScore: 95,
        joinedAt: hoursAgo(70),
      },
    ],
    status: "ACTIVE",
    createdAt: hoursAgo(72),
    createdBy: CURRENT_USER_ID,
    maxMembers: 10,
  },
  "group-1": {
    id: "group-1",
    identity: {
      name: "Trail Blazers",
      avatar:
        "https://images.unsplash.com/photo-1551632432-c735e7a93522?w=200&h=200&fit=crop&q=80",
      description:
        "A group of outdoor enthusiasts who love exploring nature together.",
      createdAt: hoursAgo(720), // 30 days ago
    },
    plan: {
      id: "plan-1",
      title: "Weekend Hiking Adventure",
      description:
        "A scenic hike through the local trails. All skill levels welcome! We'll take breaks and enjoy the views together.",
      category: "Outdoors",
      coverImage:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=60",
      dateTime: daysFromNow(3),
      location: "Mount Tamalpais State Park",
      locationCoords: { lat: 37.9235, lng: -122.5965 },
      status: "CONFIRMED",
    },
    planHistory: [
      {
        id: "plan-history-1",
        title: "Sunset Beach Walk",
        category: "Outdoors",
        coverImage:
          "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=60",
        dateTime: hoursAgo(336), // 2 weeks ago
        location: "Ocean Beach, SF",
        completedAt: hoursAgo(336),
        rating: 4.5,
        memberCount: 3,
      },
      {
        id: "plan-history-2",
        title: "Muir Woods Morning Hike",
        category: "Outdoors",
        coverImage:
          "https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&q=60",
        dateTime: hoursAgo(504), // 3 weeks ago
        location: "Muir Woods National Monument",
        completedAt: hoursAgo(504),
        rating: 5,
        memberCount: 4,
      },
    ],
    members: [
      {
        id: CURRENT_USER_ID,
        name: "Alex",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
        personalityType: "ENTJ",
        trustScore: 0.82,
        role: "ADMIN",
        compatibilityScore: 100,
        joinedAt: hoursAgo(72),
      },
      {
        id: "user-2",
        name: "Jordan",
        avatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
        personalityType: "ENFP",
        trustScore: 0.91,
        role: "MEMBER",
        compatibilityScore: 87,
        joinedAt: hoursAgo(68),
      },
      {
        id: "user-3",
        name: "Sam",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
        personalityType: "INTJ",
        trustScore: 0.78,
        role: "MEMBER",
        compatibilityScore: 92,
        joinedAt: hoursAgo(65),
      },
      {
        id: "user-4",
        name: "Taylor",
        avatar:
          "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
        personalityType: "ISFJ",
        trustScore: 0.85,
        role: "MEMBER",
        compatibilityScore: 76,
        joinedAt: hoursAgo(60),
      },
    ],
    status: "ACTIVE",
    pinnedMessages: [
      {
        id: "pinned-msg-1",
        type: "TEXT",
        content: "Reminder: Bring your own water and a light jacket!",
        senderId: CURRENT_USER_ID,
        senderName: "Alex",
        senderAvatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
        timestamp: hoursAgo(48),
        isOwn: true,
        status: "READ",
      },
      {
        id: "pinned-msg-2",
        type: "TEXT",
        content: "Meeting location changed to the South Gate entrance.",
        senderId: "user-2",
        senderName: "Jordan",
        senderAvatar:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
        timestamp: hoursAgo(24),
        isOwn: false,
        status: "READ",
      },
    ],
    createdAt: hoursAgo(72),
    createdBy: CURRENT_USER_ID,
    maxMembers: 5,
  },
  "group-2": {
    id: "group-2",
    identity: {
      name: "Code Crafters",
      avatar:
        "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&h=200&fit=crop&q=80",
      description: "Weekly tech meetups to learn and grow together.",
      createdAt: hoursAgo(480), // 20 days ago
    },
    plan: {
      id: "plan-2",
      title: "React Study Group",
      description:
        "Weekly meetup to learn React together. We'll work through tutorials, build projects, and help each other debug.",
      category: "Tech",
      coverImage:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=60",
      dateTime: daysFromNow(1),
      location: "Central Library, Study Room B",
      status: "CONFIRMED",
    },
    planHistory: [
      {
        id: "plan-history-3",
        title: "TypeScript Deep Dive",
        category: "Tech",
        coverImage:
          "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=60",
        dateTime: hoursAgo(168), // 1 week ago
        location: "Central Library, Study Room B",
        completedAt: hoursAgo(168),
        rating: 4,
        memberCount: 4,
      },
    ],
    members: [
      {
        id: "user-5",
        name: "Morgan",
        avatar:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
        personalityType: "INTP",
        trustScore: 0.88,
        role: "ADMIN",
        compatibilityScore: 94,
        joinedAt: hoursAgo(120),
      },
      {
        id: CURRENT_USER_ID,
        name: "Alex",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
        personalityType: "ENTJ",
        trustScore: 0.82,
        role: "MEMBER",
        compatibilityScore: 100,
        joinedAt: hoursAgo(96),
      },
      {
        id: "user-6",
        name: "Casey",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
        personalityType: "ENFJ",
        trustScore: 0.75,
        role: "MEMBER",
        compatibilityScore: 81,
        joinedAt: hoursAgo(90),
      },
      {
        id: "user-7",
        name: "Riley",
        avatar:
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
        personalityType: "ISTJ",
        trustScore: 0.92,
        role: "MEMBER",
        compatibilityScore: 79,
        joinedAt: hoursAgo(85),
      },
      {
        id: "user-8",
        name: "Quinn",
        avatar:
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
        personalityType: "ESTP",
        trustScore: 0.68,
        role: "MEMBER",
        compatibilityScore: 72,
        joinedAt: hoursAgo(72),
      },
    ],
    status: "ACTIVE",
    createdAt: hoursAgo(120),
    createdBy: "user-5",
    maxMembers: 6,
  },
  "group-3": {
    id: "group-3",
    identity: {
      name: "Game Night Crew",
      avatar:
        "https://images.unsplash.com/photo-1553481187-be93c21490a9?w=200&h=200&fit=crop&q=80",
      description: "Regular game nights with friends, new and old.",
      createdAt: hoursAgo(240), // 10 days ago
    },
    plan: {
      id: "plan-3",
      title: "Board Game Night",
      description:
        "Casual board game evening. Bring your favorites or try something new. Snacks welcome!",
      category: "Social",
      coverImage:
        "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=800&q=60",
      dateTime: daysFromNow(5),
      location: "Drew's Place",
      status: "DRAFT",
      // Active proposals for collaboration demo
      proposals: [
        {
          id: "proposal-1",
          field: "dateTime",
          currentValue: new Date(
            Date.now() + 5 * 24 * 60 * 60 * 1000,
          ).toLocaleDateString("en-US", {
            weekday: "long",
            month: "short",
            day: "numeric",
          }),
          proposedValue:
            "Saturday, " +
            new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString(
              "en-US",
              { month: "short", day: "numeric" },
            ),
          proposedBy: {
            id: "user-10",
            name: "Drew",
            avatar:
              "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
          },
          createdAt: hoursAgo(5),
          votes: {
            approve: ["user-9"],
            reject: [],
          },
          status: "PENDING",
        },
        {
          id: "proposal-2",
          field: "location",
          currentValue: "Drew's Place",
          proposedValue: "Board Game Cafe downtown",
          proposedBy: {
            id: "user-9",
            name: "Jamie",
            avatar:
              "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
          },
          createdAt: hoursAgo(3),
          votes: {
            approve: [],
            reject: ["user-10"],
          },
          status: "PENDING",
        },
      ],
      comments: [
        {
          id: "comment-1",
          field: "general",
          content:
            "I can bring Catan and Ticket to Ride. Anyone have Wingspan?",
          author: {
            id: "user-10",
            name: "Drew",
            avatar:
              "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
          },
          createdAt: hoursAgo(6),
          reactions: [
            { emoji: "thumbsup", userIds: ["user-9", CURRENT_USER_ID] },
          ],
        },
        {
          id: "comment-2",
          field: "location",
          content: "The cafe has a bigger table and we can order food there",
          author: {
            id: "user-9",
            name: "Jamie",
            avatar:
              "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
          },
          createdAt: hoursAgo(2),
        },
      ],
    },
    members: [
      {
        id: "user-9",
        name: "Jamie",
        avatar:
          "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
        personalityType: "ENFP",
        trustScore: 0.79,
        role: "ADMIN",
        compatibilityScore: 88,
        joinedAt: hoursAgo(48),
      },
      {
        id: "user-10",
        name: "Drew",
        avatar:
          "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
        personalityType: "ISTP",
        trustScore: 0.84,
        role: "MEMBER",
        compatibilityScore: 75,
        joinedAt: hoursAgo(44),
      },
      {
        id: CURRENT_USER_ID,
        name: "Alex",
        avatar:
          "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
        personalityType: "ENTJ",
        trustScore: 0.82,
        role: "MEMBER",
        compatibilityScore: 100,
        joinedAt: hoursAgo(40),
      },
    ],
    status: "PENDING",
    createdAt: hoursAgo(48),
    createdBy: "user-9",
    maxMembers: 5,
  },
  "group-4": {
    id: "group-4",
    identity: {
      name: "Jazz Collective",
      avatar:
        "https://images.unsplash.com/photo-1511192303578-4a7b9747d6a5?w=200&h=200&fit=crop&q=80",
      description: "Musicians who jam together regularly.",
      createdAt: hoursAgo(360), // 15 days ago
    },
    plan: {
      id: "plan-4",
      title: "Jazz Jam Session",
      description:
        "Bring your instrument and let's make some music together. All skill levels welcome.",
      category: "Music",
      coverImage:
        "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=60",
      dateTime: daysFromNow(7),
      location: "Rhythm Studio, Room 3",
      locationCoords: { lat: 37.7749, lng: -122.4194 },
      status: "CONFIRMED",
    },
    planHistory: [
      {
        id: "plan-history-4",
        title: "Blues Night",
        category: "Music",
        coverImage:
          "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&q=60",
        dateTime: hoursAgo(168), // 1 week ago
        location: "Rhythm Studio, Room 3",
        completedAt: hoursAgo(168),
        rating: 5,
        memberCount: 4,
      },
    ],
    members: [
      {
        id: "user-11",
        name: "Blake",
        avatar:
          "https://images.unsplash.com/photo-1567532939604-b6b5b0ad2604?w=200&h=200&fit=crop&q=80",
        personalityType: "INFP",
        trustScore: 0.91,
        role: "ADMIN",
        compatibilityScore: 82,
        joinedAt: hoursAgo(168),
      },
      {
        id: "user-12",
        name: "Charlie",
        avatar:
          "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&q=80",
        personalityType: "ESFP",
        trustScore: 0.77,
        role: "MEMBER",
        compatibilityScore: 69,
        joinedAt: hoursAgo(144),
      },
      {
        id: "user-13",
        name: "Dana",
        avatar:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&q=80",
        personalityType: "INTJ",
        trustScore: 0.88,
        role: "MEMBER",
        compatibilityScore: 91,
        joinedAt: hoursAgo(120),
      },
      {
        id: "user-14",
        name: "Elliot",
        avatar:
          "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
        personalityType: "ENFJ",
        trustScore: 0.85,
        role: "MEMBER",
        compatibilityScore: 78,
        joinedAt: hoursAgo(96),
      },
    ],
    status: "ACTIVE",
    createdAt: hoursAgo(168),
    createdBy: "user-11",
    maxMembers: 5,
  },
};

export const MOCK_MESSAGES: Record<string, Message[]> = {
  "design-playground": [
    {
      id: "pmsg-1",
      groupId: "design-playground",
      type: "SYSTEM",
      content: "Design Playground created. Visualizing all states below.",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(24),
      isOwn: false,
    },
    {
      id: "pmsg-2",
      groupId: "design-playground",
      type: "TEXT",
      content: "👋 Welcome to the Unified Component Test Suite!",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(23.9),
      isOwn: false,
    },
    {
      id: "pmsg-3",
      groupId: "design-playground",
      type: "TEXT",
      content: "🚀",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(23.8),
      isOwn: true,
      status: "READ",
    },
    {
      id: "pmsg-4",
      groupId: "design-playground",
      type: "TEXT",
      content:
        "Check out this single image mock. It should be large and edge-to-edge.",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(22),
      isOwn: false,
      attachments: [
        {
          id: "patt-img-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
          name: "Forest.jpg",
        },
      ],
    },
    {
      id: "pmsg-5",
      groupId: "design-playground",
      type: "TEXT",
      content: "And here is a gallery of 3 photos for comparison:",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(21.9),
      isOwn: false,
      attachments: [
        {
          id: "patt-g1",
          type: "image",
          url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
        },
        {
          id: "patt-g2",
          type: "image",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        },
        {
          id: "patt-g3",
          type: "image",
          url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
        },
      ],
    },
    {
      id: "pmsg-6",
      groupId: "design-playground",
      type: "TEXT",
      content:
        "This is my message (teal) with multiple reactions. It's quite a long sentence to see how the reactions stack underneath the bubble without pushing metadata too far.",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(20),
      isOwn: true,
      status: "READ",
      reactions: {
        "🔥": [{ userId: "user-designer", emoji: "🔥" }],
        "🎯": [{ userId: "user-designer", emoji: "🎯" }],
        "💯": [{ userId: "user-designer", emoji: "💯" }],
      },
    },
    {
      id: "pmsg-7",
      groupId: "design-playground",
      type: "VOICE", // Testing voice-only stack
      content: "",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(19),
      isOwn: false,
      attachments: [
        {
          id: "patt-v1",
          type: "voice",
          url: "mock-url",
          duration: 124,
          name: "Specs.m4a",
        },
      ],
    },
    {
      id: "pmsg-8",
      groupId: "design-playground",
      type: "TEXT",
      content: "Replying to your specs with another voice note:",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(18.5),
      isOwn: true,
      status: "DELIVERED",
      replyTo: {
        id: "pmsg-7",
        senderName: "Designer",
        content: "Voice Note (2:04)",
      },
      attachments: [
        {
          id: "patt-v2",
          type: "voice",
          url: "mock-url",
          duration: 12,
          name: "Confirm.m4a",
        },
      ],
    },
    {
      id: "pmsg-9",
      groupId: "design-playground",
      type: "PLAN_UPDATE",
      content: "Proposal: Update branding colors to Forge Teal",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(10),
      isOwn: false,
      hasVoted: false,
    },
    {
      id: "pmsg-10",
      groupId: "design-playground",
      type: "SYSTEM",
      content: "Location updated to: Silicon Valley Design Studio",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(5),
      isOwn: false,
    },
    {
      id: "pmsg-11",
      groupId: "design-playground",
      type: "TEXT",
      content: "Check this link preview out: https://teamforge.app",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(1),
      isOwn: true,
      status: "READ",
    },
    {
      id: "pmsg-12",
      groupId: "design-playground",
      type: "TEXT",
      content: "Testing a 10-image massive gallery overflow:",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.9),
      isOwn: false,
      attachments: Array.from({ length: 10 }).map((_, i) => ({
        id: `patt-heavy-${i}`,
        type: "image",
        url: `https://plus.unsplash.com/premium_photo-1661281397737-9b5d75b52beb?w=800&q=80&sig=${i}`,
      })),
    },
    {
      id: "pmsg-13",
      groupId: "design-playground",
      type: "TEXT",
      content:
        "This message has a lot of reactions from different people to test the wrap-around logic.",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.8),
      isOwn: false,
      reactions: {
        "❤️": Array.from({ length: 12 }).map((_, i) => ({
          userId: `u-${i}`,
          emoji: "❤️",
        })),
        "🚀": Array.from({ length: 5 }).map((_, i) => ({
          userId: `u-r-${i}`,
          emoji: "🚀",
        })),
        "👏": Array.from({ length: 3 }).map((_, i) => ({
          userId: `u-c-${i}`,
          emoji: "👏",
        })),
        "🎉": [{ userId: "u-p-1", emoji: "🎉" }],
        "🎯": [{ userId: "u-p-2", emoji: "🎯" }],
        "👀": [{ userId: "u-p-3", emoji: "👀" }],
      },
    },
    {
      id: "pmsg-14",
      groupId: "design-playground",
      type: "TEXT",
      content: "",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.7),
      isOwn: true,
      status: "READ",
      attachments: [
        {
          id: "patt-no-text",
          type: "image",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
        },
      ],
    },
    {
      id: "pmsg-15",
      groupId: "design-playground",
      type: "VOICE",
      content: "Short voice note (1s):",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.6),
      isOwn: false,
      attachments: [
        {
          id: "patt-vs",
          type: "voice",
          url: "#",
          duration: 1,
          name: "Short.m4a",
        },
      ],
    },
    {
      id: "pmsg-16",
      groupId: "design-playground",
      type: "SYSTEM",
      content: "Sam was removed from the group by Designer",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(0.55),
      isOwn: false,
    },
    {
      id: "pmsg-17",
      groupId: "design-playground",
      type: "SYSTEM",
      content: "Group renamed to 'The Final Sandbox'",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(0.54),
      isOwn: false,
    },
    {
      id: "pmsg-18",
      groupId: "design-playground",
      type: "TEXT",
      content:
        "Testing edge cases for text padding and very long words: Supercalifragilisticexpialidocious_and_even_longer_unbroken_string_of_characters_to_test_word_break_overflow_behavior_in_responsive_containers.",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.4),
      isOwn: true,
      status: "SENT",
    },
    {
      id: "pmsg-19",
      groupId: "design-playground",
      type: "TEXT",
      content: "Wait, the 10th photo is missing a filter! 🎨",
      senderId: "user-designer",
      senderName: "Designer",
      senderAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.35),
      isOwn: false,
      replyTo: {
        id: "pmsg-12",
        senderName: "Designer",
        content: "Photo Gallery (+7)",
      },
    },
    {
      id: "pmsg-20",
      groupId: "design-playground",
      type: "TEXT",
      content: "Did you catch that last part of the voice memo?",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.25),
      isOwn: true,
      status: "READ",
      replyTo: {
        id: "pmsg-15",
        senderName: "Designer",
        content: "Voice Note (0:01)",
      },
    },
    {
      id: "pmsg-21",
      groupId: "design-playground",
      type: "TEXT",
      content: "Testing delivery status: DELIVERED",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.15),
      isOwn: true,
      status: "DELIVERED",
    },
    {
      id: "pmsg-22",
      groupId: "design-playground",
      type: "TEXT",
      content: "Testing delivery status: FAILED ⚠️",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.1),
      isOwn: true,
      status: "FAILED",
    },
  ],
  "group-1": [
    {
      id: "msg-1",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Group created by Alex",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(72),
      isOwn: false,
    },
    {
      id: "msg-2",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Jordan joined the group",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(68),
      isOwn: false,
    },
    {
      id: "msg-3",
      groupId: "group-1",
      type: "TEXT",
      content: "Hey everyone! Excited to go hiking this weekend.",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(67),
      isOwn: true,
      readBy: ["user-2", "user-3", "user-4"],
    },
    {
      id: "msg-4",
      groupId: "group-1",
      type: "TEXT",
      content:
        "Same here! I've been wanting to explore that trail for a while.",
      senderId: "user-2",
      senderName: "Jordan",
      senderAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(66),
      isOwn: false,
    },
    {
      id: "msg-5",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Sam joined the group",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(65),
      isOwn: false,
    },
    {
      id: "msg-6",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Taylor joined the group",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(60),
      isOwn: false,
    },
    {
      id: "msg-7",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Plan confirmed! See you at Mount Tamalpais.",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(48),
      isOwn: false,
    },
    {
      id: "msg-8",
      groupId: "group-1",
      type: "TEXT",
      content: "I'll bring some snacks for everyone! 🍎🥜",
      senderId: "user-3",
      senderName: "Sam",
      senderAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(47.5),
      isOwn: false,
      status: "READ",
    },
    // --- YESTERDAY ---
    {
      id: "msg-9",
      groupId: "group-1",
      type: "SYSTEM",
      content: "Taylor shared the gear list",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(25),
      isOwn: false,
    },
    {
      id: "msg-10",
      groupId: "group-1",
      type: "TEXT",
      content:
        "Check out the trail map I found. Looks like we have two options for the summit.",
      senderId: "user-4",
      senderName: "Taylor",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(24.5),
      isOwn: false,
      attachments: [
        {
          id: "att-1",
          type: "image",
          url: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=800&q=80",
          name: "Trail Map North.jpg",
        },
        {
          id: "att-2",
          type: "image",
          url: "https://images.unsplash.com/photo-1527010159945-c42509220548?w=800&q=80",
          name: "Summit View.jpg",
        },
      ],
    },
    {
      id: "msg-11",
      groupId: "group-1",
      type: "TEXT",
      content:
        "The North trail looks more scenic but it's a bit steeper. What do you all think?",
      senderId: "user-4",
      senderName: "Taylor",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(24.4),
      isOwn: false,
      replyTo: {
        id: "msg-10",
        senderName: "Taylor",
        content: "Check out the trail map I found...",
      },
    },
    // --- TODAY ---
    {
      id: "msg-12",
      groupId: "group-1",
      type: "TEXT",
      content: "I'm down for the steeper one if the view is worth it! 🏔️",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(5),
      isOwn: true,
      status: "READ",
    },
    {
      id: "msg-13",
      groupId: "group-1",
      type: "TEXT",
      content: "Quick voice note about the carpool arrangements:",
      senderId: "user-2",
      senderName: "Jordan",
      senderAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(4.5),
      isOwn: false,
      attachments: [
        {
          id: "att-vn-1",
          type: "voice",
          url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Sample-OGG-File.ogg",
          duration: 45,
          name: "Voice memo 1.m4a",
        },
      ],
    },
    {
      id: "msg-14",
      groupId: "group-1",
      type: "TEXT",
      content: "Sounds good Jordan. I'll be at the pickup point at 8 AM sharp.",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(4.2),
      isOwn: true,
      attachments: [
        {
          id: "att-vn-own",
          type: "voice",
          url: "https://www.learningcontainer.com/wp-content/uploads/2020/02/Sample-OGG-File.ogg",
          duration: 12,
          name: "Confirmation.m4a",
        },
      ],
      reactions: {
        "👍": [
          { userId: "user-2", emoji: "👍" },
          { userId: "user-3", emoji: "👍" },
        ],
        "🔥": [{ userId: "user-4", emoji: "🔥" }],
      },
    },
    {
      id: "msg-15",
      groupId: "group-1",
      type: "TEXT",
      content:
        "Here are some photos from my last trip there to get everyone hyped! 📸✨✨",
      senderId: "user-3",
      senderName: "Sam",
      senderAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(2),
      isOwn: false,
      attachments: [
        {
          id: "att-g1",
          type: "image",
          url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80",
        },
        {
          id: "att-g2",
          type: "image",
          url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80",
        },
        {
          id: "att-g3",
          type: "image",
          url: "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=800&q=80",
        },
        {
          id: "att-g4",
          type: "image",
          url: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80",
        },
        {
          id: "att-g5",
          type: "image",
          url: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=800&q=80",
        },
        {
          id: "att-g6",
          type: "image",
          url: "https://images.unsplash.com/photo-1433086566580-603be259ee5b?w=800&q=80",
        },
      ],
    },
    {
      id: "msg-16",
      groupId: "group-1",
      type: "SYSTEM",
      content: "New proposal: Move start time to 7:00 AM",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(1),
      isOwn: false,
    },
    {
      id: "msg-17",
      groupId: "group-1",
      type: "TEXT",
      content:
        "This is a really long message to test how the chat bubble handles extensive blocks of text that might span several lines. We need to ensure the layout remains stable, the tracking is tight but readable, and the metadata (like time and status) doesn't overlap with the text content. TeamForge is all about efficient communication, but sometimes people like to type a lot when they're excited about a trek!",
      senderId: "user-2",
      senderName: "Jordan",
      senderAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.5),
      isOwn: false,
      isEdited: true,
    },
    {
      id: "msg-18",
      groupId: "group-1",
      type: "PLAN_UPDATE",
      content:
        "Proposal: Move gathering point to the North Entrance for better cell reception.",
      senderId: "user-4",
      senderName: "Taylor",
      senderAvatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(0.2),
      isOwn: false,
      hasVoted: false,
    },
  ],
  "group-2": [
    {
      id: "msg-20",
      groupId: "group-2",
      type: "SYSTEM",
      content: "Group created by Morgan",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(120),
      isOwn: false,
    },
    {
      id: "msg-21",
      groupId: "group-2",
      type: "TEXT",
      content: "Welcome to the React Study Group! Let's learn together.",
      senderId: "user-5",
      senderName: "Morgan",
      senderAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(119),
      isOwn: false,
    },
    {
      id: "msg-22",
      groupId: "group-2",
      type: "TEXT",
      content:
        "Thanks for starting this! I'm excited to improve my React skills.",
      senderId: CURRENT_USER_ID,
      senderName: "Alex",
      senderAvatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(96),
      isOwn: true,
    },
    {
      id: "msg-23",
      groupId: "group-2",
      type: "TEXT",
      content: "I'll bring my laptop and the React docs",
      senderId: "user-6",
      senderName: "Casey",
      senderAvatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(2),
      isOwn: false,
    },
  ],
  "group-3": [
    {
      id: "msg-30",
      groupId: "group-3",
      type: "SYSTEM",
      content: "Group created by Jamie",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(48),
      isOwn: false,
    },
    {
      id: "msg-31",
      groupId: "group-3",
      type: "TEXT",
      content: "Hey! Anyone up for a board game night this weekend?",
      senderId: "user-9",
      senderName: "Jamie",
      senderAvatar:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(47),
      isOwn: false,
    },
    {
      id: "msg-32",
      groupId: "group-3",
      type: "TEXT",
      content: "Count me in! I have Catan and Ticket to Ride.",
      senderId: "user-10",
      senderName: "Drew",
      senderAvatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(44),
      isOwn: false,
    },
    {
      id: "msg-33",
      groupId: "group-3",
      type: "TEXT",
      content: "Should we do Friday or Saturday?",
      senderId: "user-10",
      senderName: "Drew",
      senderAvatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(5),
      isOwn: false,
    },
    {
      id: "msg-34",
      groupId: "group-3",
      type: "PLAN_UPDATE",
      content: "",
      senderId: "user-9",
      senderName: "Jamie",
      senderAvatar:
        "https://images.unsplash.com/photo-1554151228-14d9def656e4?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(4),
      isOwn: false,
      hasVoted: false,
    },
    {
      id: "msg-35",
      groupId: "group-3",
      type: "PLAN_UPDATE",
      content: "",
      senderId: "user-10",
      senderName: "Drew",
      senderAvatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&q=80",
      timestamp: hoursAgo(3),
      isOwn: false,
      hasVoted: true,
    },
  ],
  "group-4": [
    {
      id: "msg-40",
      groupId: "group-4",
      type: "SYSTEM",
      content: "Group created by Blake",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(168),
      isOwn: false,
    },
    {
      id: "msg-41",
      groupId: "group-4",
      type: "SYSTEM",
      content: "Plan confirmed! See you at the studio.",
      senderId: "system",
      senderName: "System",
      senderAvatar: "",
      timestamp: hoursAgo(24),
      isOwn: false,
    },
  ],
};
