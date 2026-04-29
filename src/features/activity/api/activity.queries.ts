import { queryOptions } from "@tanstack/react-query";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { appQueryClient } from "@/shared/api/query-client";
import type {
  ChatApi,
  FriendshipApi,
  FriendshipUserApi,
  GroupApi,
  GroupMemberApi,
  MessageApi,
  PlanProposal,
  User,
} from "@/shared/schemas";

import { ActivityApi } from "./activity.api";
import { applyFilter, sortByRecency } from "../lib/unify-conversations";
import type {
  ActivityParticipant,
  DirectChat,
  FilterChip,
  Group,
  GroupMember,
  UnifiedConversation,
  UnifiedMessage,
} from "../lib/activity-contract";

export interface ActivityFeedData {
  items: UnifiedConversation[];
  groupCount: number;
  dmCount: number;
  unreadCount: number;
}

export interface ActivityGroupSelectionData {
  group: Group | null;
  messages: UnifiedMessage[];
  typingUsers: { name: string; avatar: string }[];
}

export interface ActivityDirectSelectionData {
  chat: DirectChat | null;
  messages: UnifiedMessage[];
  isTyping: boolean;
}

const ACTIVITY_GROUPS_QUERY_KEY = ["activity", "groups"] as const;
const ACTIVITY_CHATS_QUERY_KEY = ["activity", "chats"] as const;
const ACTIVITY_FRIENDSHIPS_QUERY_KEY = ["activity", "friendships"] as const;
type ActivityFeedItem = UnifiedConversation;

export class ActivityQueries {
  static groups() {
    return queryOptions({
      queryKey: ACTIVITY_GROUPS_QUERY_KEY,
      queryFn: () => ActivityApi.getGroups(),
      staleTime: 30_000,
    });
  }

  static chats() {
    return queryOptions({
      queryKey: ACTIVITY_CHATS_QUERY_KEY,
      queryFn: () => ActivityApi.getChats(),
      staleTime: 30_000,
    });
  }

  static friendships() {
    return queryOptions({
      queryKey: ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      queryFn: () => ActivityApi.getFriendships(),
      staleTime: 30_000,
    });
  }

  static feed(activeFilter: FilterChip, searchQuery: string) {
    return queryOptions({
      queryKey: ["activity-feed", activeFilter, searchQuery],
      queryFn: async (): Promise<ActivityFeedData> => {
        const { currentUserParticipant, groups, chats, friendships } =
          await this.ensureBaseData();

        const [groupItems, directItems] = await Promise.all([
          Promise.all(
            groups.map((group) =>
              this.buildGroupFeedItem(group, chats, currentUserParticipant),
            ),
          ),
          Promise.all(
            friendships.map((friendship) =>
              this.buildDirectFeedItem(friendship, currentUserParticipant),
            ),
          ),
        ]);

        const validDirectItems = directItems.flatMap((item) =>
          item ? [item] : [],
        );
        const items = sortByRecency([...groupItems, ...validDirectItems]);
        const filteredItems = applyFilter(items, activeFilter, searchQuery);
        const dmCount = validDirectItems.length;

        return {
          items: filteredItems,
          groupCount: groups.length,
          dmCount,
          unreadCount: items.filter((item) => item.unreadCount > 0).length,
        };
      },
      staleTime: 30_000,
    });
  }

  static groupSelection(groupId: string) {
    return queryOptions({
      queryKey: ["activity-selection", "group", groupId],
      queryFn: async (): Promise<ActivityGroupSelectionData> => {
        const { currentUserParticipant, chats } = await this.ensureBaseData();
        const groupDto = await ActivityApi.getGroup(groupId);
        const proposals =
          groupDto.plan !== null
            ? await ActivityApi.getPlanProposals(groupDto.plan.id)
            : [];
        const chat = this.findGroupChat(chats, groupId);
        const group = this.mapGroup(groupDto, chat?.id, proposals);
        const participants = this.buildGroupParticipants(
          group,
          currentUserParticipant,
        );
        const messages = chat
          ? this.mapMessages(
              await ActivityApi.getChatMessages(chat.id),
              participants,
              currentUserParticipant.id,
            )
          : [];

        return {
          group,
          messages,
          typingUsers: [],
        };
      },
      staleTime: 30_000,
    });
  }

  static directSelection(chatId: string) {
    return queryOptions({
      queryKey: ["activity-selection", "dm", chatId],
      queryFn: async (): Promise<ActivityDirectSelectionData> => {
        const { currentUserParticipant, friendships } =
          await this.ensureBaseData();
        const friendship =
          friendships.find((item) => item.privateChat?.id === chatId) ?? null;
        const chat = friendship
          ? this.mapDirectChat(friendship, currentUserParticipant)
          : null;

        if (!chat) {
          return {
            chat: null,
            messages: [],
            isTyping: false,
          };
        }

        const participants =
          chat.participants
            ?.map((participant) => participant.user)
            .filter(
              (participant): participant is ActivityParticipant =>
                participant !== undefined,
            ) ?? [];
        const messages = this.mapMessages(
          await ActivityApi.getChatMessages(chatId),
          participants,
          currentUserParticipant.id,
        );

        return {
          chat,
          messages,
          isTyping: false,
        };
      },
      staleTime: 30_000,
    });
  }

  static async sendMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    content: string,
    replyToId?: string | null,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const message = await ActivityApi.sendMessage(chatId, content, replyToId);

    await Promise.all([
      appQueryClient.invalidateQueries({ queryKey: ["activity-feed"] }),
      appQueryClient.invalidateQueries({
        queryKey: ["activity-selection", kind, selectedId],
      }),
    ]);

    return message;
  }

  private static async ensureBaseData() {
    const [currentUser, groups, chats, friendships] = await Promise.all([
      appQueryClient.ensureQueryData(AuthQueries.currentUser()),
      appQueryClient.ensureQueryData(this.groups()),
      appQueryClient.ensureQueryData(this.chats()),
      appQueryClient.ensureQueryData(this.friendships()),
    ]);

    return {
      currentUser,
      currentUserParticipant: this.mapCurrentUserParticipant(currentUser),
      groups,
      chats,
      friendships,
    };
  }

  private static normalizeTrustScore(score: number) {
    return score > 0 && score <= 1
      ? Math.round(score * 100)
      : Math.round(score);
  }

  private static normalizeCompatibilityScore(score: number | null) {
    if (score === null) {
      return null;
    }

    return score > 0 && score <= 1
      ? Math.round(score * 100)
      : Math.round(score);
  }

  private static mapCurrentUserParticipant(user: User): ActivityParticipant {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      bio: user.bio,
      age: user.age,
      gender: user.gender,
      city: user.city,
      personalityType: user.personalityType,
      oceanO: user.oceanO,
      oceanC: user.oceanC,
      oceanE: user.oceanE,
      oceanA: user.oceanA,
      oceanN: user.oceanN,
      onlineStatus: user.onlineStatus,
      trustScore: this.normalizeTrustScore(user.trustScore),
    };
  }

  private static mapFriendshipUserParticipant(
    user: FriendshipUserApi,
  ): ActivityParticipant {
    return {
      id: user.id,
      name: user.name,
      avatar: user.avatar,
      city: user.city ?? null,
      personalityType: user.personalityType,
      onlineStatus: user.onlineStatus,
      trustScore: this.normalizeTrustScore(user.trustScore),
    };
  }

  private static mapGroupMemberParticipant(
    member: GroupMemberApi,
  ): ActivityParticipant {
    return {
      id: member.user.id,
      name: member.user.name,
      avatar: member.user.avatar,
      personalityType: member.user.personalityType,
      trustScore: this.normalizeTrustScore(member.user.trustScore),
    };
  }

  private static mapGroupMember(
    member: GroupMemberApi,
    groupId: string,
  ): GroupMember {
    return {
      userId: member.userId,
      groupId,
      role: member.role,
      joinedAt: member.joinedAt,
      leftAt: member.leftAt,
      compatibilityScore: this.normalizeCompatibilityScore(
        member.compatibilityScore,
      ),
      user: this.mapGroupMemberParticipant(member),
    };
  }

  private static mapGroup(
    group: GroupApi,
    chatId?: string | null,
    proposals: PlanProposal[] = [],
  ): Group {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      status: group.status,
      maxMembers: group.maxMembers,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      disbandedAt: group.disbandedAt,
      activityId: group.activityId,
      activity: {
        id: group.activity.id,
        title: group.activity.title,
        city: group.activity.city,
        status: group.activity.status,
        visibility: group.activity.visibility,
        access: group.activity.access,
        forgeMode: group.activity.forgeMode,
      },
      plan: group.plan
        ? {
            id: group.plan.id,
            title: group.plan.title,
            description: null,
            category: group.plan.category,
            coverImage: group.avatar,
            status: group.plan.status,
            dateTime: group.plan.dateTime,
            locationMode: group.plan.locationMode,
            location: group.activity.city,
            locationLat: null,
            locationLng: null,
            cost: group.plan.cost,
            costAmount: null,
            costDetails: null,
            completedAt: null,
            cancelledAt: null,
            createdAt: group.createdAt,
            updatedAt: group.updatedAt,
            groupId: group.id,
            proposals,
          }
        : null,
      members: group.members.map((member) =>
        this.mapGroupMember(member, group.id),
      ),
      chat: chatId
        ? {
            id: chatId,
            pinnedMessages: [],
          }
        : undefined,
      planHistory: [],
    };
  }

  private static mapDirectChat(
    friendship: FriendshipApi,
    currentUser: ActivityParticipant,
  ): DirectChat | null {
    if (!friendship.privateChat) {
      return null;
    }

    const participant = this.mapFriendshipUserParticipant(
      friendship.counterpart,
    );

    return {
      id: friendship.privateChat.id,
      type: friendship.privateChat.type,
      createdAt: friendship.privateChat.createdAt,
      groupId: null,
      participants: [
        {
          userId: participant.id,
          chatId: friendship.privateChat.id,
          user: participant,
        },
        {
          userId: currentUser.id,
          chatId: friendship.privateChat.id,
          user: currentUser,
        },
      ],
      pinnedMessages: [],
      isMuted: false,
      isBlocked: friendship.status === "BLOCKED",
      mutualGroups: [],
    };
  }

  private static buildMessageParticipantsIndex(
    participants: ActivityParticipant[],
  ) {
    return new Map(
      participants.map((participant) => [participant.id, participant]),
    );
  }

  private static mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[] {
    const participantsIndex = this.buildMessageParticipantsIndex(participants);

    const messages = items.map<UnifiedMessage>((item) => ({
      id: item.id,
      type: item.type,
      content: item.content,
      status: item.status,
      isEdited: item.isEdited,
      isPinned: item.isPinned,
      createdAt: item.createdAt,
      editedAt: item.editedAt,
      deletedAt: item.deletedAt,
      chatId: item.chatId,
      senderId: item.senderId,
      replyToId: item.replyToId,
      sender: participantsIndex.get(item.senderId),
      isOwn: currentUserId !== null && item.senderId === currentUserId,
      isSystem: item.type === "SYSTEM",
      reactions: [],
      attachments: [],
    }));

    const messagesIndex = new Map(
      messages.map((message) => [message.id, message]),
    );

    for (const message of messages) {
      if (message.replyToId) {
        message.replyTo = messagesIndex.get(message.replyToId);
      }
    }

    return messages;
  }

  private static findGroupChat(chats: ChatApi[], groupId: string) {
    return chats.find((chat) => chat.groupId === groupId) ?? null;
  }

  private static buildGroupParticipants(
    group: Group,
    currentUserParticipant: ActivityParticipant,
  ) {
    const participants =
      group.members
        ?.map((member: GroupMember) => member.user)
        .filter(
          (participant): participant is ActivityParticipant =>
            participant !== undefined,
        ) ?? [];

    if (
      !participants.some(
        (participant) => participant.id === currentUserParticipant.id,
      )
    ) {
      participants.unshift(currentUserParticipant);
    }

    return participants;
  }

  private static async buildGroupFeedItem(
    groupDto: GroupApi,
    chats: ChatApi[],
    currentUserParticipant: ActivityParticipant,
  ): Promise<ActivityFeedItem> {
    const chat = this.findGroupChat(chats, groupDto.id);
    const group = this.mapGroup(groupDto, chat?.id);
    const participants = this.buildGroupParticipants(
      group,
      currentUserParticipant,
    );
    const latestMessageDto = chat
      ? ((await ActivityApi.getChatMessages(chat.id, "1")).at(0) ?? null)
      : null;
    const latestMessage = latestMessageDto
      ? this.mapMessages(
          [latestMessageDto],
          participants,
          currentUserParticipant.id,
        )[0]
      : null;

    return {
      id: group.id,
      kind: "group" as const,
      unreadCount: 0,
      isTyping: false,
      latestMessage: latestMessage ?? undefined,
      group,
    };
  }

  private static async buildDirectFeedItem(
    friendship: FriendshipApi,
    currentUserParticipant: ActivityParticipant,
  ): Promise<ActivityFeedItem | null> {
    const chat = this.mapDirectChat(friendship, currentUserParticipant);

    if (!chat) {
      return null;
    }

    const latestMessageDto =
      (await ActivityApi.getChatMessages(chat.id, "1")).at(0) ?? null;
    const latestMessage = latestMessageDto
      ? this.mapMessages(
          [latestMessageDto],
          chat.participants
            ?.map((participant) => participant.user)
            .filter(
              (participant): participant is ActivityParticipant =>
                participant !== undefined,
            ) ?? [],
          currentUserParticipant.id,
        )[0]
      : null;

    return {
      id: chat.id,
      kind: "dm" as const,
      unreadCount: 0,
      isTyping: false,
      latestMessage: latestMessage ?? undefined,
      chat,
    };
  }

  private static async resolveChatId(kind: "group" | "dm", selectedId: string) {
    if (kind === "dm") {
      return selectedId;
    }

    const chats = await appQueryClient.ensureQueryData(this.chats());

    return chats.find((chat) => chat.groupId === selectedId)?.id ?? null;
  }
}
