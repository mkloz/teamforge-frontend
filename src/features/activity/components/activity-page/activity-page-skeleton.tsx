import { ActivityPageContent } from "@/features/activity/components/activity-page/activity-page-content";
import type { ActivityWorkspace } from "@/features/activity/hooks/use-activity";
import type {
  ActivityParticipant,
  DirectChat,
  Group,
  Plan,
  UnifiedConversation,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { GeneratedSkeleton } from "@/shared/components/loading/generated-skeleton";

export const ACTIVITY_PAGE_SKELETON_NAME = "activity.page";

interface ActivityPageSkeletonProps {
  contained?: boolean;
}

const noop = () => {};
const asyncNoop = async () => {};
const now = "2026-05-11T12:00:00.000Z";

export function ActivityPageSkeleton({
  contained = false,
}: ActivityPageSkeletonProps) {
  const fixture = <ActivityPageSkeletonFixture contained={contained} />;

  return (
    <GeneratedSkeleton
      name={ACTIVITY_PAGE_SKELETON_NAME}
      loading
      className={contained ? "h-full" : "h-dvh"}
      fixture={fixture}
      fallback={null}
    >
      {fixture}
    </GeneratedSkeleton>
  );
}

export function ActivityPageSkeletonFixture({
  contained = false,
}: ActivityPageSkeletonProps) {
  return (
    <div aria-busy="true" aria-label="Loading activity" role="status">
      <span className="sr-only">Loading activity</span>
      <ActivityPageContent
        activity={buildActivityFixture()}
        contained={contained}
        isMobile={false}
      />
    </div>
  );
}

function buildActivityFixture(): ActivityWorkspace {
  const group = buildGroup();
  const directChat = buildDirectChat();
  const selectedGroupMessages = buildGroupMessages(group.chat?.id ?? "chat-1");
  const selectedDirectMessages = buildDirectMessages(directChat.id);
  const filteredItems: UnifiedConversation[] = [
    {
      id: group.id,
      kind: "group",
      unreadCount: 2,
      isTyping: false,
      latestMessage: selectedGroupMessages.at(-1),
      group,
    },
    {
      id: directChat.id,
      kind: "dm",
      unreadCount: 0,
      isTyping: true,
      latestMessage: selectedDirectMessages.at(-1),
      chat: directChat,
    },
    {
      id: "group-2",
      kind: "group",
      unreadCount: 0,
      isTyping: false,
      latestMessage: textMessage({
        id: "message-park",
        chatId: "chat-park",
        content: "I can bring the picnic blanket.",
        sender: users.maya,
      }),
      group: buildSecondaryGroup(),
    },
  ];

  return {
    searchQuery: "",
    activeFilter: "all",
    sidebarDensity: "default",
    isInitialLoading: false,
    filteredItems,
    groupCount: 2,
    dmCount: 1,
    unreadCount: 2,
    setSearchQuery: noop,
    setActiveFilter: noop,
    setSidebarDensity: noop,
    selectedId: group.id,
    selectedKind: "group",
    groups: {
      selectedGroupId: group.id,
      isDetailPanelOpen: true,
      searchQuery: "",
      draftMessages: {},
    },
    direct: {
      selectedChatId: null,
      isProfilePanelOpen: false,
      searchQuery: "",
      draftMessages: {},
    },
    selectedGroup: group,
    selectedGroupMessages,
    typingUsers: [
      { id: users.maya.id, name: users.maya.name, avatar: users.maya.avatar },
    ],
    selectedChat: null,
    selectedDirectMessages: [],
    isTyping: false,
    hasOlderMessages: true,
    isLoadingOlderMessages: false,
    loadOlderMessages: asyncNoop,
    hasSelection: true,
    handleSelectItem: noop,
    handleBack: noop,
    toggleGroupDetail: noop,
    closeGroupDetail: noop,
    toggleProfilePanel: noop,
    closeProfilePanel: noop,
    handleSendMessage: asyncNoop,
    sendError: null,
    clearSendError: noop,
    focusedPlanId: null,
    focusedProposalId: null,
    focusedMessageId: null,
  };
}

const users = {
  alex: participant("user-alex", "Alex Morgan", "ENFP", "ONLINE"),
  cody: participant("user-cody", "Cody Rivera", "INTJ", "AWAY"),
  maya: participant("user-maya", "Maya Chen", "ISFP", "ONLINE"),
  noah: participant("user-noah", "Noah Patel", "ENTP", "OFFLINE"),
};

function participant(
  id: string,
  name: string,
  personalityType: ActivityParticipant["personalityType"],
  onlineStatus: ActivityParticipant["onlineStatus"],
): ActivityParticipant {
  return {
    id,
    name,
    avatar: null,
    bio: "Usually up for thoughtful plans and low-friction meetups.",
    age: 24,
    gender: "OTHER",
    city: "London",
    personalityType,
    oceanO: 0.72,
    oceanC: 0.61,
    oceanE: 0.67,
    oceanA: 0.7,
    oceanN: 0.28,
    onlineStatus,
    trustScore: 86,
  };
}

function buildGroup(): Group {
  return {
    id: "group-1",
    name: "Gallery Night Crew",
    description: "A small group planning an easy evening around new exhibits.",
    avatar: null,
    status: "PLANNING",
    maxMembers: 5,
    createdAt: now,
    updatedAt: now,
    version: 1,
    disbandedAt: null,
    activityId: "activity-1",
    activity: {
      id: "activity-1",
      title: "Gallery night",
      city: "London",
      status: "MATCHED",
      visibility: "PUBLIC",
      access: "OPEN",
      forgeMode: "AUTO",
    },
    members: [
      member(users.alex, "ADMIN", 0.94),
      member(users.cody, "MEMBER", 0.88),
      member(users.maya, "MEMBER", 0.84),
    ],
    plan: buildPlan("plan-1", "Evening at Tate Modern", "group-1"),
    chat: {
      id: "chat-1",
      pinnedMessages: [
        textMessage({
          id: "message-pinned",
          chatId: "chat-1",
          content: "Let’s meet by the main entrance at 6:45.",
          isPinned: true,
          sender: users.cody,
        }),
      ],
      mutualGroups: [],
    },
    planHistory: [
      {
        id: "history-1",
        title: "Coffee and sketching",
        category: "ARTS",
        dateTime: "2026-04-24T18:00:00.000Z",
        coverImage: null,
        status: "COMPLETED",
        location: "Southbank",
        rating: 4.8,
      },
    ],
  };
}

function buildSecondaryGroup(): Group {
  return {
    ...buildGroup(),
    id: "group-2",
    name: "Sunday Park Table",
    activityId: "activity-2",
    plan: buildPlan("plan-2", "Board games in Hyde Park", "group-2"),
    chat: {
      id: "chat-park",
      pinnedMessages: [],
      mutualGroups: [],
    },
  };
}

function buildDirectChat(): DirectChat {
  return {
    id: "dm-1",
    type: "PRIVATE",
    createdAt: now,
    groupId: null,
    participants: [
      { userId: users.alex.id, chatId: "dm-1", user: users.alex },
      { userId: users.noah.id, chatId: "dm-1", user: users.noah },
    ],
    pinnedMessages: [],
    isMuted: false,
    isBlocked: false,
    mutualGroups: [{ id: "group-1", name: "Gallery Night Crew", avatar: null }],
  };
}

function buildPlan(id: string, title: string, groupId: string): Plan {
  return {
    id,
    title,
    description:
      "A relaxed plan with enough structure to make showing up easy.",
    category: "ARTS",
    coverImage: null,
    status: "CONFIRMED",
    dateTime: "2026-05-18T18:45:00.000Z",
    locationMode: "IN_PERSON",
    location: "Tate Modern",
    locationLat: null,
    locationLng: null,
    cost: "FREE",
    costAmount: null,
    costDetails: null,
    completedAt: null,
    cancelledAt: null,
    createdAt: now,
    updatedAt: now,
    version: 1,
    groupId,
    proposals: [],
  };
}

function member(
  user: ActivityParticipant,
  role: "ADMIN" | "MODERATOR" | "MEMBER",
  compatibilityScore: number,
) {
  return {
    userId: user.id,
    groupId: "group-1",
    role,
    joinedAt: now,
    leftAt: null,
    compatibilityScore,
    user,
  };
}

function buildGroupMessages(chatId: string): UnifiedMessage[] {
  return [
    textMessage({
      id: "message-1",
      chatId,
      content: "This place has a late opening next week.",
      sender: users.cody,
      createdAt: "2026-05-11T11:40:00.000Z",
    }),
    textMessage({
      id: "message-2",
      chatId,
      content: "Perfect. I’ll check whether the river entrance is quieter.",
      isOwn: true,
      sender: users.alex,
      createdAt: "2026-05-11T11:44:00.000Z",
    }),
    textMessage({
      id: "message-3",
      chatId,
      content: "I found a cafe nearby for after if everyone wants to linger.",
      sender: users.maya,
      createdAt: "2026-05-11T11:52:00.000Z",
    }),
  ];
}

function buildDirectMessages(chatId: string): UnifiedMessage[] {
  return [
    textMessage({
      id: "dm-message-1",
      chatId,
      content: "Want to compare commute routes before the plan?",
      sender: users.noah,
      createdAt: "2026-05-11T10:30:00.000Z",
    }),
  ];
}

function textMessage({
  id,
  chatId,
  content,
  sender,
  createdAt = now,
  isOwn = false,
  isPinned = false,
}: {
  id: string;
  chatId: string;
  content: string;
  sender: ActivityParticipant;
  createdAt?: string;
  isOwn?: boolean;
  isPinned?: boolean;
}): UnifiedMessage {
  return {
    id,
    type: "TEXT",
    content,
    status: "READ",
    isEdited: false,
    isPinned,
    createdAt,
    updatedAt: createdAt,
    editedAt: null,
    deletedAt: null,
    chatId,
    senderId: sender.id,
    replyToId: null,
    version: 1,
    sender,
    reactions: [],
    attachments: [],
    isOwn,
  };
}
