import {
  scenarioInterestCatalog,
  scenarioInterestLeavesById,
} from "@/dev/scenarios/world/scenario-interest-catalog";
import type { ScenarioWorld } from "@/dev/scenarios/world/scenario-world";
import {
  chatApiSchema,
  friendshipApiSchema,
  fullUserResponseSchema,
  type Interest,
  inviteSchema,
  messageApiSchema,
  notificationSchema,
} from "@/shared/schemas";
import {
  containmentSchema,
  enforcementNoticeSchema,
  reportSummarySchema,
} from "@/shared/schemas/safety";

const CREATED_AT = "2026-01-10T10:00:00.000Z";
const UPDATED_AT = "2026-08-01T09:30:00.000Z";

function createUser({
  avatar,
  city,
  id,
  interests,
  name,
  onlineStatus,
  personalityType,
  trustScore,
}: {
  avatar: string;
  city: string;
  id: string;
  interests: Interest[];
  name: string;
  onlineStatus: "AWAY" | "OFFLINE" | "ONLINE";
  personalityType: "ENFP" | "ENTP" | "ESFJ" | "INFJ" | "ISTJ";
  trustScore: number;
}) {
  return fullUserResponseSchema.parse({
    adultEligibility: { accessVersion: 1, status: "ELIGIBLE" },
    age: 27,
    authProvider: "EMAIL",
    avatar,
    bio: `${name} likes plans that leave room for good conversation.`,
    city,
    createdAt: CREATED_AT,
    email: `${id}@teamforge.test`,
    emailVerified: true,
    gender: "OTHER",
    id,
    interests,
    lastSeenAt: onlineStatus === "OFFLINE" ? "2026-07-31T20:10:00.000Z" : null,
    name,
    oceanA: 72,
    oceanC: 68,
    oceanE: 61,
    oceanN: 34,
    oceanO: 78,
    onlineStatus,
    personalitySetupComplete: true,
    personalityType,
    profileComplete: true,
    role: "USER",
    searchStatus: "IDLE",
    showFriendsListOnProfile: true,
    trustScore,
    updatedAt: UPDATED_AT,
  });
}

export function populateStandardWorld(world: ScenarioWorld) {
  const quinn = world.viewerId ? world.entities.users[world.viewerId] : null;
  if (!quinn) {
    return;
  }

  const people = [
    createUser({
      avatar: "/avatars/avatar-2.jpg",
      city: "London",
      id: "scenario-user-ava",
      interests: [
        scenarioInterestCatalog.basketball,
        scenarioInterestCatalog.community,
      ],
      name: "Ava Carter",
      onlineStatus: "ONLINE",
      personalityType: "ENFP",
      trustScore: 91,
    }),
    createUser({
      avatar: "/avatars/avatar-3.jpg",
      city: "Hackney",
      id: "scenario-user-maya",
      interests: [
        scenarioInterestCatalog.food,
        scenarioInterestCatalog.community,
      ],
      name: "Maya Singh",
      onlineStatus: "AWAY",
      personalityType: "ESFJ",
      trustScore: 88,
    }),
    createUser({
      avatar: "/avatars/avatar-4.jpg",
      city: "Shoreditch",
      id: "scenario-user-noah",
      interests: [
        scenarioInterestCatalog.careers,
        scenarioInterestCatalog.books,
      ],
      name: "Noah Williams",
      onlineStatus: "OFFLINE",
      personalityType: "INFJ",
      trustScore: 84,
    }),
    createUser({
      avatar: "/avatars/avatar-5.jpg",
      city: "London",
      id: "scenario-user-oscar",
      interests: [
        scenarioInterestCatalog.games,
        scenarioInterestCatalog.community,
      ],
      name: "Oscar Lane",
      onlineStatus: "ONLINE",
      personalityType: "ENTP",
      trustScore: 79,
    }),
    createUser({
      avatar: "/avatars/avatar-6.jpg",
      city: "Cambridge",
      id: "scenario-user-sara",
      interests: [
        scenarioInterestCatalog.books,
        scenarioInterestCatalog.careers,
      ],
      name: "Sara Mitchell",
      onlineStatus: "OFFLINE",
      personalityType: "ISTJ",
      trustScore: 93,
    }),
  ];

  for (const person of people) {
    world.entities.users[person.id] = person;
  }

  world.entities.interests = scenarioInterestLeavesById;
  quinn.interests = Object.values(scenarioInterestCatalog);

  world.entities.activities = {
    "scenario-activity-basketball": {
      access: "OPEN",
      city: "London",
      id: "scenario-activity-basketball",
      interestIds: [scenarioInterestCatalog.basketball.id],
      title: "Evening basketball",
      visibility: "PUBLIC",
    },
    "scenario-activity-career": {
      access: "BY_REQUEST",
      city: "Shoreditch",
      id: "scenario-activity-career",
      interestIds: [scenarioInterestCatalog.careers.id],
      title: "Career switcher coffee",
      visibility: "PUBLIC",
    },
    "scenario-activity-games": {
      access: "OPEN",
      city: "London",
      id: "scenario-activity-games",
      interestIds: [scenarioInterestCatalog.games.id],
      title: "Rules and snacks",
      visibility: "PUBLIC",
    },
    "scenario-activity-market": {
      access: "OPEN",
      city: "Hackney",
      id: "scenario-activity-market",
      interestIds: [
        scenarioInterestCatalog.food.id,
        scenarioInterestCatalog.community.id,
      ],
      title: "Low-waste market run",
      visibility: "PUBLIC",
    },
    "scenario-activity-reading": {
      access: "OPEN",
      city: null,
      id: "scenario-activity-reading",
      interestIds: [scenarioInterestCatalog.books.id],
      title: "Remote reading sprint",
      visibility: "PUBLIC",
    },
  };

  world.entities.plans = {
    "scenario-plan-basketball": createPlan({
      category: "SPORTS",
      coverImage: "/group-covers/contour-paths.png",
      dateTime: "2026-08-02T18:30:00.000Z",
      description:
        "A relaxed outdoor session with enough time for a proper game.",
      groupId: "scenario-group-basketball",
      id: "scenario-plan-basketball",
      location: "South Bank, London",
      locationLat: 51.5074,
      locationLng: -0.106,
      title: "Riverside hoops",
    }),
    "scenario-plan-career": createPlan({
      category: "TECH",
      coverImage: "/group-covers/paper-collage.png",
      dateTime: "2026-08-12T10:25:00.000Z",
      description:
        "Bring one career question and leave with a practical next step.",
      groupId: "scenario-group-career",
      id: "scenario-plan-career",
      location: "Shoreditch, London",
      locationLat: 51.5255,
      locationLng: -0.0754,
      title: "Career switcher coffee",
    }),
    "scenario-plan-market": createPlan({
      category: "FOOD",
      coverImage: "/group-covers/risograph-table.png",
      dateTime: "2026-08-13T10:25:00.000Z",
      description:
        "Walk the market, compare ideas, and pick one low-waste habit to try.",
      groupId: "scenario-group-market",
      id: "scenario-plan-market",
      location: "Hackney Downs, London",
      locationLat: 51.5563,
      locationLng: -0.0596,
      title: "Low-waste market run",
    }),
    "scenario-plan-reading": createPlan({
      category: "LEARNING",
      coverImage: "/group-covers/woven-paths.png",
      dateTime: null,
      description:
        "A quiet online reading block followed by a short exchange of notes.",
      groupId: "scenario-group-reading",
      id: "scenario-plan-reading",
      location: "Online",
      locationLat: null,
      locationLng: null,
      locationMode: "ONLINE",
      scheduleMode: "TO_BE_DECIDED",
      title: "Remote reading sprint",
    }),
  };

  world.entities.groups = {
    "scenario-group-basketball": createGroup({
      activityId: "scenario-activity-basketball",
      avatar: "/group-covers/contour-paths.png",
      description: "Friendly basketball with a reliable weekly rhythm.",
      id: "scenario-group-basketball",
      memberIds: ["scenario-user-ava", quinn.id, "scenario-user-maya"],
      name: "Riverside Hoops",
      planId: "scenario-plan-basketball",
    }),
    "scenario-group-career": createGroup({
      access: "BY_REQUEST",
      activityId: "scenario-activity-career",
      avatar: "/group-covers/paper-collage.png",
      description: "A thoughtful table for practical career changes.",
      id: "scenario-group-career",
      memberIds: ["scenario-user-noah", quinn.id, "scenario-user-sara"],
      name: "Career Switcher Coffee",
      planId: "scenario-plan-career",
    }),
    "scenario-group-market": createGroup({
      activityId: "scenario-activity-market",
      avatar: "/group-covers/risograph-table.png",
      description: "Local discoveries with less waste and more conversation.",
      id: "scenario-group-market",
      memberIds: ["scenario-user-maya", quinn.id],
      name: "Low-Waste Market Run",
      planId: "scenario-plan-market",
    }),
    "scenario-group-reading": createGroup({
      activityId: "scenario-activity-reading",
      avatar: "/group-covers/woven-paths.png",
      description: "Quiet reading, light accountability, and useful notes.",
      id: "scenario-group-reading",
      memberIds: ["scenario-user-noah", quinn.id],
      name: "Remote Reading Sprint",
      planId: "scenario-plan-reading",
    }),
    "scenario-group-invite": createGroup({
      activityId: "scenario-activity-games",
      avatar: "/group-covers/clay-tokens.png",
      description: "Board games, patient explanations, and snacks.",
      id: "scenario-group-invite",
      memberIds: ["scenario-user-oscar", "scenario-user-sara"],
      name: "Rules and Snacks",
      planId: null,
    }),
  };

  for (const group of Object.values(world.entities.groups)) {
    if (!group.memberIds.includes(quinn.id)) {
      continue;
    }

    const chatId = `scenario-chat-${group.id}`;
    const sender = world.entities.users[group.memberIds[0]];
    const message = messageApiSchema.parse({
      attachments: [],
      chatId,
      content: `Welcome to ${group.name}. Share anything the group should know before the next plan.`,
      createdAt: "2026-07-31T18:30:00.000Z",
      deletedAt: null,
      editedAt: null,
      id: `scenario-message-${group.id}-welcome`,
      isEdited: false,
      isPinned: false,
      reactions: [],
      replyToId: null,
      sender: {
        avatar: sender.avatar,
        id: sender.id,
        name: sender.name,
      },
      senderId: sender.id,
      status: "DELIVERED",
      type: "TEXT",
    });
    world.entities.messages[message.id] = message;
    world.entities.chats[chatId] = chatApiSchema.parse({
      createdAt: group.createdAt,
      governance: null,
      group: {
        activityId: group.activityId,
        avatar: group.avatar,
        id: group.id,
        name: group.name,
        status: group.status,
      },
      groupId: group.id,
      hasUnread: false,
      id: chatId,
      isMuted: false,
      isPinned: false,
      lastMessage: message,
      participants: group.memberIds.map((userId) => {
        const user = world.entities.users[userId];
        return {
          isBlocked: false,
          isMuted: false,
          isPinned: false,
          joinedAt: group.createdAt,
          lastReadMessageId: userId === quinn.id ? message.id : null,
          leftAt: null,
          user,
          userId,
        };
      }),
      pinnedMessages: [],
      type: "GROUP",
      unreadCount: 0,
    });
  }

  const invite = inviteSchema.parse({
    createdAt: "2026-07-31T09:00:00.000Z",
    expiresAt: "2026-08-07T09:00:00.000Z",
    group: {
      activeMembersCount: 2,
      avatar: "/group-covers/clay-tokens.png",
      id: "scenario-group-invite",
      maxMembers: 6,
      name: "Rules and Snacks",
      status: "ACTIVE",
    },
    groupId: "scenario-group-invite",
    id: "scenario-invite-rules",
    invitee: toInviteUser(quinn),
    inviteeId: quinn.id,
    inviter: toInviteUser(world.entities.users["scenario-user-oscar"]),
    inviterId: "scenario-user-oscar",
    message: "We are keeping this one relaxed and beginner-friendly.",
    respondedAt: null,
    status: "PENDING",
    type: "DIRECT_INVITE",
    updatedAt: "2026-07-31T09:00:00.000Z",
  });
  world.entities.invitations[invite.id] = invite;
  world.entities.groups[invite.groupId].pendingInvitationIds.push(invite.id);

  const friendship = friendshipApiSchema.parse({
    counterpart: toFriendUser(world.entities.users["scenario-user-oscar"]),
    createdAt: "2026-07-31T08:00:00.000Z",
    privateChatId: null,
    receiver: toFriendUser(quinn),
    receiverId: quinn.id,
    requester: toFriendUser(world.entities.users["scenario-user-oscar"]),
    requesterId: "scenario-user-oscar",
    status: "PENDING",
    updatedAt: "2026-07-31T08:00:00.000Z",
  });
  world.entities.friendships["scenario-friendship-oscar"] = friendship;
  for (const friendId of [
    "scenario-user-ava",
    "scenario-user-noah",
    "scenario-user-sara",
  ]) {
    const friend = world.entities.users[friendId];
    const accepted = friendshipApiSchema.parse({
      counterpart: toFriendUser(friend),
      createdAt: "2026-02-01T08:00:00.000Z",
      privateChat: {
        createdAt: "2026-02-01T08:00:00.000Z",
        id: `scenario-chat-${friendId}`,
        type: "PRIVATE",
      },
      privateChatId: `scenario-chat-${friendId}`,
      receiver: toFriendUser(friend),
      receiverId: friend.id,
      requester: toFriendUser(quinn),
      requesterId: quinn.id,
      status: "ACCEPTED",
      updatedAt: "2026-02-01T08:00:00.000Z",
    });
    world.entities.friendships[`scenario-friendship-${friendId}`] = accepted;
  }

  const notifications = [
    {
      avatarUrl: "/group-covers/clay-tokens.png",
      entityId: invite.id,
      entityType: "INVITE" as const,
      id: "scenario-notification-invite",
      isRead: false,
      link: "/home",
      message: "Oscar invited you to join.",
      title: "Rules and Snacks",
      type: "GROUP_INVITE" as const,
    },
    {
      avatarUrl: "/avatars/avatar-5.jpg",
      entityId: "scenario-user-oscar",
      entityType: "USER" as const,
      id: "scenario-notification-friend",
      isRead: false,
      link: "/profile/scenario-user-oscar",
      message: "Oscar wants to connect with you.",
      title: "New connection request",
      type: "FRIEND_REQUEST" as const,
    },
    {
      avatarUrl: "/group-covers/contour-paths.png",
      entityId: "scenario-plan-basketball",
      entityType: "PLAN" as const,
      id: "scenario-notification-plan",
      isRead: true,
      link: "/groups/scenario-group-basketball",
      message: "The next Riverside Hoops plan has been confirmed.",
      title: "Plan confirmed",
      type: "PLAN_CONFIRMED" as const,
    },
  ].map((value, index) =>
    notificationSchema.parse({
      ...value,
      createdAt: `2026-07-31T0${9 - index}:00:00.000Z`,
      receiverId: quinn.id,
      updatedAt: `2026-07-31T0${9 - index}:00:00.000Z`,
    }),
  );
  world.entities.notifications = Object.fromEntries(
    notifications.map((notification) => [notification.id, notification]),
  );

  const report = reportSummarySchema.parse({
    blockStatus: "NOT_APPLICABLE",
    category: "HARASSMENT",
    id: "scenario-report-one",
    informationRequest: null,
    leaveStatus: "NOT_APPLICABLE",
    outcomeReviewEligibility: {
      canRequest: true,
      deadline: "2026-08-08T09:30:00.000Z",
      reasonCode: "AVAILABLE",
    },
    outcomeReviewStatus: null,
    publicOutcome: "ACTION_TAKEN",
    referenceCode: "TF-SCENARIO-1042",
    resolvedAt: "2026-07-30T12:00:00.000Z",
    status: "RESOLVED",
    submittedAt: "2026-07-26T14:20:00.000Z",
  });
  world.entities.reports[report.id] = report;

  const notice = enforcementNoticeSchema.parse({
    appeal: null,
    appealDueAt: "2026-08-07T09:30:00.000Z",
    canAppeal: true,
    expiresAt: "2026-08-14T09:30:00.000Z",
    id: "scenario-enforcement-one",
    message:
      "Posting is temporarily limited while a recent report is reviewed.",
    startsAt: "2026-07-31T09:30:00.000Z",
    state: "ACTIVE",
    title: "Temporary posting limit",
  });
  world.safety.enforcementNotices[notice.id] = notice;

  const containment = containmentSchema.parse({
    canContest: true,
    contest: null,
    expiresAt: "2026-08-03T09:30:00.000Z",
    id: "scenario-containment-one",
    message:
      "New group invitations are paused while account activity is checked.",
    startedAt: "2026-07-31T09:30:00.000Z",
    state: "ACTIVE",
    title: "Invitation pause",
  });
  world.safety.containments[containment.id] = containment;
}

function createPlan({
  category,
  coverImage,
  dateTime,
  description,
  groupId,
  id,
  location,
  locationLat,
  locationLng,
  locationMode = "IN_PERSON",
  scheduleMode = "FIXED",
  title,
}: {
  category: "FOOD" | "LEARNING" | "SPORTS" | "TECH";
  coverImage: string;
  dateTime: string | null;
  description: string;
  groupId: string;
  id: string;
  location: string;
  locationLat: number | null;
  locationLng: number | null;
  locationMode?: "IN_PERSON" | "ONLINE";
  scheduleMode?: "FIXED" | "TO_BE_DECIDED";
  title: string;
}) {
  return {
    category,
    cost: "FREE" as const,
    costAmount: null,
    costDetails: null,
    coverImage,
    dateTime,
    description,
    groupId,
    id,
    location,
    locationLat,
    locationLng,
    locationMode,
    materialRevision: 1,
    revision: 1,
    scheduleMode,
    status: "CONFIRMED" as const,
    title,
  };
}

function createGroup({
  access = "OPEN",
  activityId,
  avatar,
  description,
  id,
  memberIds,
  name,
  planId,
}: {
  access?: "BY_REQUEST" | "OPEN";
  activityId: string;
  avatar: string;
  description: string;
  id: string;
  memberIds: string[];
  name: string;
  planId: string | null;
}) {
  return {
    access,
    activityId,
    avatar,
    createdAt: CREATED_AT,
    description,
    id,
    maxMembers: 6,
    memberIds,
    name,
    pendingInvitationIds: [],
    planIds: planId ? [planId] : [],
    status: "ACTIVE" as const,
    updatedAt: UPDATED_AT,
    visibility: "PUBLIC" as const,
  };
}

function toInviteUser(user: ReturnType<typeof createUser>) {
  return {
    avatar: user.avatar,
    id: user.id,
    name: user.name,
    personalityType: user.personalityType,
    trustScore: user.trustScore,
  };
}

function toFriendUser(user: ReturnType<typeof createUser>) {
  return {
    age: user.age,
    avatar: user.avatar,
    bio: user.bio,
    city: user.city,
    gender: user.gender,
    id: user.id,
    lastSeenAt: user.lastSeenAt ?? null,
    name: user.name,
    onlineStatus: user.onlineStatus,
  };
}
