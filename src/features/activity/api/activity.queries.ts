import {
  infiniteQueryOptions,
  queryOptions,
  type InfiniteData,
} from "@tanstack/react-query";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { buildProposalTimelineContent } from "@/features/activity/lib/proposal-language";
import {
  HOME_GROUPS_QUERY_KEY,
  HOME_INVITATIONS_QUERY_KEY,
} from "@/features/home/api/home.queries";
import { appQueryClient } from "@/shared/api/query-client";
import type {
  AttachmentType,
  ChatApi,
  FriendshipApi,
  FriendshipUserApi,
  GroupApi,
  GroupMemberApi,
  MessageApi,
  MessageReplyPreview,
  MessageSenderSummary,
  MessageType,
  OnlineStatus,
  Paginated,
  PlanProposal,
  PlanUpdateKind,
  User,
} from "@/shared/schemas";

import { ActivityApi, type SendMessagePayload } from "./activity.api";
import { applyFilter, sortByRecency } from "../lib/unify-conversations";
import type {
  ActivityParticipant,
  ActivityOutgoingAttachment,
  DirectChat,
  FilterChip,
  Group,
  GroupMember,
  Plan,
  UnifiedConversation,
  UnifiedMessage,
  UnifiedMessageReaction,
} from "../lib/activity-contract";

export interface ActivityFeedData {
  items: UnifiedConversation[];
  groupCount: number;
  dmCount: number;
  unreadCount: number;
}

export interface ActivityGroupSelectionData {
  chatId: string | null;
  group: Group | null;
  proposalMessages: UnifiedMessage[];
  typingUsers: { name: string; avatar: string | null }[];
}

export interface ActivityDirectSelectionData {
  chat: DirectChat | null;
  chatId: string | null;
  isTyping: boolean;
}

export type ActivityMessagesPageData = Paginated<UnifiedMessage>;

interface SendActivityMessageInput {
  attachments?: ActivityOutgoingAttachment[];
  content: string;
  replyTo?: UnifiedMessage | null;
  replyToId?: string | null;
}

interface ApplyRealtimeMessageOptions {
  activeChatId?: string | null;
}

const ACTIVITY_GROUPS_QUERY_KEY = ["activity", "groups"] as const;
const ACTIVITY_CHATS_QUERY_KEY = ["activity", "chats"] as const;
const ACTIVITY_FRIENDSHIPS_QUERY_KEY = ["activity", "friendships"] as const;
const DEFAULT_MESSAGE_LIMIT = 50;
const retryableMessageInputs = new Map<
  string,
  {
    chatId: string;
    input: SendActivityMessageInput;
  }
>();

type ActivityFeedItem = UnifiedConversation;
type ActivityMessagesInfiniteData = InfiniteData<
  ActivityMessagesPageData,
  unknown
>;

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

  static deriveFeedData(
    activeFilter: FilterChip,
    searchQuery: string,
    groups: GroupApi[],
    chats: ChatApi[],
    friendships: FriendshipApi[],
    currentUser: User,
    typingByChatId: Record<
      string,
      Array<{ id: string; name: string; avatar: string | null }>
    >,
  ): ActivityFeedData {
    const currentUserParticipant = this.mapCurrentUserParticipant(currentUser);
    const groupItems = groups.map((group) =>
      this.buildGroupFeedItem(
        group,
        chats,
        currentUserParticipant,
        typingByChatId,
      ),
    );
    const directItems = friendships.flatMap((friendship) => {
      const item = this.buildDirectFeedItem(
        friendship,
        chats,
        currentUserParticipant,
        typingByChatId,
      );

      return item ? [item] : [];
    });
    const items = sortByRecency([...groupItems, ...directItems]);

    return {
      items: applyFilter(items, activeFilter, searchQuery),
      groupCount: groupItems.length,
      dmCount: directItems.length,
      unreadCount: items.filter((item) => item.unreadCount > 0).length,
    };
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
        const group = this.mapGroup(
          groupDto,
          currentUserParticipant.id,
          proposals,
          chat ?? null,
        );
        const participants = this.buildGroupParticipants(
          group,
          currentUserParticipant,
        );
        const proposalMessages =
          chat?.id && proposals.length > 0
            ? proposals.map((proposal) =>
                this.buildProposalMessage(
                  proposal,
                  chat.id,
                  currentUserParticipant.id,
                  participants,
                ),
              )
            : [];

        return {
          chatId: group.chat?.id ?? chat?.id ?? null,
          group,
          proposalMessages,
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
        const { chats, currentUserParticipant, friendships } =
          await this.ensureBaseData();
        const friendship =
          friendships.find((item) => item.privateChat?.id === chatId) ?? null;
        const chatSummary = chats.find((item) => item.id === chatId) ?? null;
        const chat = friendship
          ? this.mapDirectChat(friendship, currentUserParticipant, chatSummary)
          : null;

        return {
          chat,
          chatId,
          isTyping: false,
        };
      },
      staleTime: 30_000,
    });
  }

  static conversationMessages(
    chatId: string,
    participants: ActivityParticipant[],
    currentUserId: string,
  ) {
    return infiniteQueryOptions({
      queryKey: ["activity-messages", chatId],
      initialPageParam: 1,
      staleTime: 30_000,
      queryFn: async ({ pageParam }): Promise<ActivityMessagesPageData> => {
        const response = await ActivityApi.getChatMessages(chatId, {
          limit: DEFAULT_MESSAGE_LIMIT,
          page: pageParam,
        });

        return {
          items: this.mapMessages(response.items, participants, currentUserId),
          meta: response.meta,
        };
      },
      getNextPageParam: (lastPage) =>
        lastPage.meta.currentPage < lastPage.meta.totalPages
          ? lastPage.meta.currentPage + 1
          : undefined,
    });
  }

  static flattenMessagePages(
    data: ActivityMessagesInfiniteData | undefined,
  ): UnifiedMessage[] {
    if (!data) {
      return [];
    }

    return [...data.pages]
      .reverse()
      .flatMap((page: ActivityMessagesPageData) => [...page.items].reverse());
  }

  static buildConversationTimeline(
    messages: UnifiedMessage[],
    proposalMessages: UnifiedMessage[] = [],
  ) {
    return this.mergeConversationTimeline(messages, proposalMessages);
  }

  static async markChatRead(chatId: string, messageId?: string | null) {
    const updatedChat = await ActivityApi.markChatRead(chatId, messageId);
    this.updateChatSummaryCache(updatedChat);
    return updatedChat;
  }

  static async sendMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    input: SendActivityMessageInput,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const optimisticMessage = this.buildOptimisticMessage(
      currentUserParticipant,
      chatId,
      input,
    );
    retryableMessageInputs.set(optimisticMessage.id, {
      chatId,
      input,
    });

    this.insertOptimisticMessage(chatId, optimisticMessage);
    this.updateChatLastMessage(chatId, optimisticMessage, {
      hasUnread: false,
      unreadCount: 0,
    });

    try {
      const payload = await this.buildSendMessagePayload(input);
      const messageResult = await ActivityApi.sendMessage(chatId, payload);
      const mappedMessage = this.mapMessages(
        [messageResult.data],
        participants,
        currentUser.id,
      )[0];

      this.replaceMessageInCache(chatId, optimisticMessage.id, mappedMessage);
      retryableMessageInputs.delete(optimisticMessage.id);
      this.updateChatLastMessage(chatId, mappedMessage, {
        hasUnread: false,
        unreadCount: 0,
      });
      return {
        message: mappedMessage,
        requestId: messageResult.requestId,
      };
    } catch (error) {
      this.updateMessageStatusInCache(chatId, optimisticMessage.id, "FAILED");
      throw error;
    }
  }

  static async retryMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const retryableInput = retryableMessageInputs.get(message.id);

    if (!retryableInput || message.status !== "FAILED") {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );

    this.updateMessageStatusInCache(
      retryableInput.chatId,
      message.id,
      "SENDING",
    );
    this.updateChatLastMessage(
      retryableInput.chatId,
      {
        ...message,
        status: "SENDING",
      },
      {
        hasUnread: false,
        unreadCount: 0,
      },
    );

    try {
      const payload = await this.buildSendMessagePayload(retryableInput.input);
      const sentMessageResult = await ActivityApi.sendMessage(
        retryableInput.chatId,
        payload,
      );
      const mappedMessage = this.mapMessages(
        [sentMessageResult.data],
        participants,
        currentUser.id,
      )[0];

      this.replaceMessageInCache(
        retryableInput.chatId,
        message.id,
        mappedMessage,
      );
      retryableMessageInputs.delete(message.id);
      this.updateChatLastMessage(retryableInput.chatId, mappedMessage, {
        hasUnread: false,
        unreadCount: 0,
      });
      return {
        message: mappedMessage,
        requestId: sentMessageResult.requestId,
      };
    } catch (error) {
      this.updateMessageStatusInCache(
        retryableInput.chatId,
        message.id,
        "FAILED",
      );
      this.updateChatLastMessage(
        retryableInput.chatId,
        {
          ...message,
          status: "FAILED",
        },
        {
          hasUnread: false,
          unreadCount: 0,
        },
      );
      throw error;
    }
  }

  static async updateMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
    content: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessageResult = await ActivityApi.updateMessage(
      chatId,
      messageId,
      {
        content,
      },
    );
    const mappedMessage = this.mapMessages(
      [updatedMessageResult.data],
      participants,
      currentUser.id,
    )[0];

    this.replaceMessageInCache(chatId, messageId, mappedMessage);
    this.syncChatLastMessageFromMessagesCache(chatId);
    return {
      message: mappedMessage,
      requestId: updatedMessageResult.requestId,
    };
  }

  static async deleteMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    messageId: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    if (retryableMessageInputs.has(messageId)) {
      retryableMessageInputs.delete(messageId);
      this.removeMessageFromCache(chatId, messageId);
      this.removePinnedMessage(chatId, messageId);
      this.syncChatLastMessageFromMessagesCache(chatId);
      return messageId;
    }

    await ActivityApi.deleteMessage(chatId, messageId);
    retryableMessageInputs.delete(messageId);
    this.removeMessageFromCache(chatId, messageId);
    this.removePinnedMessage(chatId, messageId);
    this.syncChatLastMessageFromMessagesCache(chatId);
    return messageId;
  }

  static async toggleReaction(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
    emoji: string,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const hasReaction = message.reactions?.some(
      (reaction) =>
        reaction.emoji === emoji && reaction.userId === currentUser.id,
    );
    const updatedMessage = hasReaction
      ? await ActivityApi.removeReaction(chatId, message.id, emoji)
      : await ActivityApi.addReaction(chatId, message.id, emoji);
    const mappedMessage = this.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    this.replaceMessageInCache(chatId, message.id, mappedMessage);
    this.syncPinnedMessage(chatId, mappedMessage);
    this.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  }

  static async pinMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessage = await ActivityApi.pinMessage(chatId, message.id);
    const mappedMessage = this.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    this.replaceMessageInCache(chatId, message.id, mappedMessage);
    this.syncPinnedMessage(chatId, mappedMessage);
    this.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  }

  static async unpinMessage(
    kind: "group" | "dm" | null,
    selectedId: string | null,
    message: UnifiedMessage,
  ) {
    if (!kind || !selectedId) {
      return null;
    }

    const chatId = await this.resolveChatId(kind, selectedId);

    if (!chatId) {
      return null;
    }

    const { currentUser, currentUserParticipant } = await this.ensureBaseData();
    const participants = await this.resolveParticipants(
      kind,
      selectedId,
      currentUserParticipant,
    );
    const updatedMessage = await ActivityApi.unpinMessage(chatId, message.id);
    const mappedMessage = this.mapMessages(
      [updatedMessage],
      participants,
      currentUser.id,
    )[0];

    this.replaceMessageInCache(chatId, message.id, mappedMessage);
    this.syncPinnedMessage(chatId, mappedMessage);
    this.syncChatLastMessageFromMessagesCache(chatId);
    return mappedMessage;
  }

  static async sendGroupInvite(groupId: string, inviteeId: string) {
    const invite = await ActivityApi.createInvite({
      groupId,
      inviteeId,
      type: "FRIEND_INVITE",
    });

    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: HOME_INVITATIONS_QUERY_KEY,
      }),
      appQueryClient.invalidateQueries({
        queryKey: ["notifications", "unread-count"],
      }),
      appQueryClient.invalidateQueries({ queryKey: ["notifications"] }),
    ]);

    return invite;
  }

  static async leaveGroup(groupId: string, currentUserId: string) {
    const group = await ActivityApi.leaveGroup(groupId);
    this.applyRealtimeGroupUpdate(currentUserId, group);
    return group;
  }

  static async removeGroupMember(
    groupId: string,
    memberId: string,
    currentUserId: string,
  ) {
    const group = await ActivityApi.removeGroupMember(groupId, memberId);
    this.applyRealtimeGroupUpdate(currentUserId, group);
    return group;
  }

  static async disbandGroup(groupId: string, currentUserId: string) {
    const group = await ActivityApi.disbandGroup(groupId);
    this.applyRealtimeGroupUpdate(currentUserId, group);
    return group;
  }

  static async applyRealtimeMessage(
    chatId: string,
    message: MessageApi,
    options: ApplyRealtimeMessageOptions = {},
  ) {
    const currentUser = appQueryClient.getQueryData(
      AuthQueries.currentUser().queryKey,
    );

    if (!currentUser) {
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    const chats =
      appQueryClient.getQueryData<ChatApi[]>(ACTIVITY_CHATS_QUERY_KEY) ?? [];
    const chat = chats.find((item) => item.id === chatId);

    if (!chat) {
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    const participants = this.buildParticipantsFromChatSummary(
      chat,
      currentUser,
    );
    const mappedMessage = this.mapMessages(
      [message],
      participants,
      currentUser.id,
    )[0];
    const existingMessages = this.flattenMessagePages(
      appQueryClient.getQueryData<ActivityMessagesInfiniteData>([
        "activity-messages",
        chatId,
      ]),
    );
    const alreadyExists = existingMessages.some(
      (item) => item.id === mappedMessage.id,
    );
    const optimisticMatch = this.findMatchingOptimisticMessage(
      existingMessages,
      mappedMessage,
    );
    const isActiveChat = options.activeChatId === chatId;
    const isOwnMessage = mappedMessage.senderId === currentUser.id;

    if (message.deletedAt) {
      this.removeMessageFromCache(chatId, mappedMessage.id);
      this.removePinnedMessage(chatId, mappedMessage.id);
      this.syncChatLastMessageFromMessagesCache(chatId);
      await appQueryClient.invalidateQueries({
        queryKey: ACTIVITY_CHATS_QUERY_KEY,
      });
      return;
    }

    if (optimisticMatch) {
      this.replaceMessageInCache(chatId, optimisticMatch.id, mappedMessage);
      retryableMessageInputs.delete(optimisticMatch.id);
    } else if (alreadyExists) {
      this.replaceMessageInCache(chatId, mappedMessage.id, mappedMessage);
    } else {
      this.insertOptimisticMessage(chatId, mappedMessage);
    }

    this.syncPinnedMessage(chatId, mappedMessage);

    if (optimisticMatch || alreadyExists) {
      this.syncChatLastMessageFromMessagesCache(chatId);
      return;
    }

    this.updateChatSummaryCache({
      ...chat,
      hasUnread: isOwnMessage ? (chat.hasUnread ?? false) : !isActiveChat,
      lastMessage: message,
      unreadCount: isOwnMessage
        ? (chat.unreadCount ?? 0)
        : isActiveChat
          ? 0
          : (chat.unreadCount ?? 0) + 1,
    });
  }

  static applyRealtimeChatRead(chat: ChatApi) {
    this.updateChatSummaryCache(chat);
  }

  static applyPresenceChanged(userId: string, onlineStatus: OnlineStatus) {
    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) => ({
          ...chat,
          counterpart:
            chat.counterpart?.id === userId
              ? { ...chat.counterpart, onlineStatus }
              : chat.counterpart,
          participants: chat.participants?.map((participant) =>
            participant.user.id === userId
              ? {
                  ...participant,
                  user: {
                    ...participant.user,
                    onlineStatus,
                  },
                }
              : participant,
          ),
        })) ?? current,
    );

    appQueryClient.setQueryData<FriendshipApi[]>(
      ACTIVITY_FRIENDSHIPS_QUERY_KEY,
      (current) =>
        current?.map((friendship) => ({
          ...friendship,
          requester:
            friendship.requester.id === userId
              ? { ...friendship.requester, onlineStatus }
              : friendship.requester,
          receiver:
            friendship.receiver.id === userId
              ? { ...friendship.receiver, onlineStatus }
              : friendship.receiver,
          counterpart:
            friendship.counterpart.id === userId
              ? { ...friendship.counterpart, onlineStatus }
              : friendship.counterpart,
        })) ?? current,
    );

    appQueryClient.setQueryData<GroupApi[]>(
      ACTIVITY_GROUPS_QUERY_KEY,
      (current) =>
        current?.map((group) => ({
          ...group,
          members: group.members.map((member) =>
            member.user.id === userId
              ? {
                  ...member,
                  user: {
                    ...member.user,
                    onlineStatus,
                  },
                }
              : member,
          ),
        })) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: ["activity-selection", "group"],
    })) {
      if (!selection?.group) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          members:
            selection.group.members?.map((member) =>
              member.user?.id === userId
                ? {
                    ...member,
                    user: member.user
                      ? { ...member.user, onlineStatus }
                      : member.user,
                  }
                : member,
            ) ?? [],
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: ["activity-selection", "dm"],
    })) {
      if (!selection?.chat) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          participants:
            selection.chat.participants?.map((participant) =>
              participant.user?.id === userId
                ? {
                    ...participant,
                    user: participant.user
                      ? { ...participant.user, onlineStatus }
                      : participant.user,
                  }
                : participant,
            ) ?? [],
        },
      });
    }
  }

  static applyRealtimeGroupUpdate(currentUserId: string, group: GroupApi) {
    const isStillMember = group.members.some(
      (member) => member.userId === currentUserId && member.leftAt === null,
    );

    appQueryClient.setQueryData<GroupApi[]>(
      ACTIVITY_GROUPS_QUERY_KEY,
      (current) => {
        const currentGroup = current?.find((item) => item.id === group.id);
        const nextGroup =
          currentGroup &&
          this.getGroupVersion(currentGroup) > this.getGroupVersion(group)
            ? currentGroup
            : group;
        const withoutExisting =
          current?.filter((item) => item.id !== group.id) ?? [];

        if (!isStillMember) {
          return withoutExisting;
        }

        return [nextGroup, ...withoutExisting].sort(
          (left, right) =>
            this.getGroupVersion(right) - this.getGroupVersion(left),
        );
      },
    );

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) => {
        if (!current) {
          return current;
        }

        if (!isStillMember) {
          return current.filter((chat) => chat.groupId !== group.id);
        }

        return current.map((chat) =>
          chat.groupId === group.id && chat.group
            ? {
                ...chat,
                group: {
                  ...chat.group,
                  avatar: group.avatar,
                  name: group.name,
                  status: group.status,
                },
              }
            : chat,
        );
      },
    );

    appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
      ["activity-selection", "group", group.id],
      (current) => {
        if (!current?.group) {
          return current;
        }

        if (!isStillMember) {
          return {
            ...current,
            group: null,
            proposalMessages: [],
          };
        }

        return {
          ...current,
          group: this.mapGroup(
            this.getGroupVersion(current.group) > this.getGroupVersion(group)
              ? this.mapApiGroupFromSelection(current.group)
              : group,
            currentUserId,
            current.group?.plan?.proposals ?? [],
            current.chatId
              ? ({
                  id: current.chatId,
                  pinnedMessages: current.group?.chat?.pinnedMessages?.map(
                    (message) => this.createOptimisticMessageApi(message),
                  ),
                } satisfies Pick<ChatApi, "id" | "pinnedMessages">)
              : null,
          ),
        };
      },
    );

    void Promise.all([
      appQueryClient.invalidateQueries({ queryKey: HOME_GROUPS_QUERY_KEY }),
      appQueryClient.invalidateQueries({ queryKey: ["home", "plans"] }),
      appQueryClient.invalidateQueries({ queryKey: ["home", "stats"] }),
    ]);
  }

  static async handleRealtimePlanUpdated(groupId: string) {
    await Promise.all([
      appQueryClient.invalidateQueries({
        queryKey: ["activity-selection", "group", groupId],
      }),
      appQueryClient.invalidateQueries({ queryKey: ACTIVITY_GROUPS_QUERY_KEY }),
    ]);
  }

  static applyRealtimePlanUpdate(
    groupId: string,
    plan: Plan,
    proposal: PlanProposal | null,
    kind: PlanUpdateKind,
  ) {
    const currentUser = appQueryClient.getQueryData(
      AuthQueries.currentUser().queryKey,
    );

    appQueryClient.setQueryData<ActivityGroupSelectionData | undefined>(
      ["activity-selection", "group", groupId],
      (current) => {
        if (!current?.group || !current.group.plan) {
          return current;
        }

        const currentPlan = current.group.plan;
        const currentProposals = currentPlan.proposals ?? [];
        const nextProposals = proposal
          ? this.mergeProposalIntoList(currentProposals, proposal, kind)
          : currentProposals;
        const nextPlanBase =
          this.getPlanVersion(plan) >= this.getPlanVersion(currentPlan)
            ? {
                ...currentPlan,
                ...plan,
              }
            : currentPlan;
        const nextPlan = {
          ...nextPlanBase,
          proposals: nextProposals,
        };
        const nextGroup = {
          ...current.group,
          plan: nextPlan,
        };
        if (!currentUser) {
          return {
            ...current,
            group: nextGroup,
          };
        }

        const participants = this.buildGroupParticipants(
          nextGroup,
          this.mapCurrentUserParticipant(currentUser),
        );

        return {
          ...current,
          group: nextGroup,
          proposalMessages:
            current.chatId && currentUser
              ? nextProposals.map((item) =>
                  this.buildProposalMessage(
                    item,
                    current.chatId!,
                    currentUser.id,
                    participants,
                  ),
                )
              : current.proposalMessages,
        };
      },
    );

    void appQueryClient.invalidateQueries({
      queryKey: ACTIVITY_GROUPS_QUERY_KEY,
    });
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

  private static async resolveParticipants(
    kind: "group" | "dm",
    selectedId: string,
    currentUserParticipant: ActivityParticipant,
  ) {
    if (kind === "group") {
      const selection = await appQueryClient.ensureQueryData(
        this.groupSelection(selectedId),
      );

      return selection.group
        ? this.buildGroupParticipants(selection.group, currentUserParticipant)
        : [currentUserParticipant];
    }

    const selection = await appQueryClient.ensureQueryData(
      this.directSelection(selectedId),
    );

    return (
      selection.chat?.participants
        ?.map((participant) => participant.user)
        .filter(
          (participant): participant is ActivityParticipant =>
            participant !== undefined,
        ) ?? [currentUserParticipant]
    );
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
      onlineStatus: member.user.onlineStatus,
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
    currentUserId: string | null,
    proposals: PlanProposal[] = [],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ): Group {
    const members = group.members.map((member) =>
      this.mapGroupMember(member, group.id),
    );
    const participants =
      members
        .map((member) => member.user)
        .filter(
          (participant): participant is ActivityParticipant =>
            participant !== undefined,
        ) ?? [];
    const chat = chatSummary ?? group.chat ?? null;

    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      status: group.status,
      maxMembers: group.maxMembers,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      version: group.version,
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
            version: group.version,
            groupId: group.id,
            proposals,
          }
        : null,
      members,
      chat: chat
        ? {
            id: chat.id,
            pinnedMessages: this.mapMessages(
              chat.pinnedMessages ?? [],
              participants,
              currentUserId,
            ),
          }
        : undefined,
      planHistory: [],
    };
  }

  private static mapApiGroupFromSelection(group: Group): GroupApi {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      avatar: group.avatar,
      status: group.status,
      maxMembers: group.maxMembers,
      createdAt: group.createdAt,
      updatedAt: group.updatedAt,
      version: group.version,
      disbandedAt: group.disbandedAt,
      activityId: group.activityId,
      activity: {
        id: group.activity?.id ?? group.activityId,
        title: group.activity?.title ?? group.name,
        city: group.activity?.city ?? null,
        status: group.activity?.status ?? "MATCHED",
        visibility: group.activity?.visibility ?? "PUBLIC",
        access: group.activity?.access ?? "OPEN",
        forgeMode: group.activity?.forgeMode ?? "AUTO",
        interests: [],
      },
      plan: group.plan
        ? {
            id: group.plan.id,
            title: group.plan.title,
            category: group.plan.category,
            status: group.plan.status,
            dateTime: group.plan.dateTime,
            locationMode: group.plan.locationMode,
            cost: group.plan.cost,
          }
        : null,
      chat: group.chat
        ? {
            id: group.chat.id,
            pinnedMessages: group.chat.pinnedMessages?.map((message) =>
              this.createOptimisticMessageApi(message),
            ),
          }
        : null,
      members:
        group.members?.map((member) => ({
          userId: member.userId,
          role: member.role,
          joinedAt: member.joinedAt,
          leftAt: member.leftAt,
          compatibilityScore: member.compatibilityScore,
          user: {
            id: member.user?.id ?? member.userId,
            name: member.user?.name ?? "Member",
            avatar: member.user?.avatar ?? null,
            personalityType: member.user?.personalityType ?? null,
            trustScore: member.user?.trustScore ?? 0,
            onlineStatus: member.user?.onlineStatus,
          },
        })) ?? [],
    };
  }

  private static mapDirectChat(
    friendship: FriendshipApi,
    currentUser: ActivityParticipant,
    chatSummary?: ChatApi | null,
  ): DirectChat | null {
    if (!friendship.privateChat) {
      return null;
    }

    const participant = this.mapFriendshipUserParticipant(
      friendship.counterpart,
    );
    const participants = [
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
    ];

    return {
      id: friendship.privateChat.id,
      type: friendship.privateChat.type,
      createdAt: friendship.privateChat.createdAt,
      groupId: null,
      participants,
      pinnedMessages: this.mapMessages(
        chatSummary?.pinnedMessages ?? [],
        participants
          .map((item) => item.user)
          .filter((item): item is ActivityParticipant => item !== undefined),
        currentUser.id,
      ),
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

  private static mapMessageSenderParticipant(
    sender?: MessageSenderSummary | null,
  ): ActivityParticipant | undefined {
    if (!sender) {
      return undefined;
    }

    return {
      id: sender.id,
      name: sender.name,
      avatar: sender.avatar,
      trustScore: 0,
    };
  }

  private static mapReaction(
    reaction: NonNullable<MessageApi["reactions"]>[number],
    participantsIndex: Map<string, ActivityParticipant>,
  ): UnifiedMessageReaction {
    return {
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
      messageId: reaction.messageId,
      userId: reaction.userId,
      user: participantsIndex.get(reaction.userId),
    };
  }

  private static mapReplyPreview(
    replyTo: MessageReplyPreview,
    participantsIndex: Map<string, ActivityParticipant>,
    currentUserId: string | null,
  ): UnifiedMessage {
    return {
      id: replyTo.id,
      type: replyTo.type,
      content: replyTo.content ?? "Message unavailable",
      status: "SENT",
      isEdited: false,
      isPinned: false,
      createdAt: replyTo.deletedAt ?? new Date(0).toISOString(),
      updatedAt: replyTo.deletedAt ?? new Date(0).toISOString(),
      editedAt: null,
      deletedAt: replyTo.deletedAt,
      chatId: "",
      senderId: replyTo.senderId,
      replyToId: null,
      version: replyTo.deletedAt ? new Date(replyTo.deletedAt).getTime() : 0,
      sender:
        participantsIndex.get(replyTo.senderId) ??
        this.mapMessageSenderParticipant(replyTo.sender),
      isOwn: currentUserId !== null && replyTo.senderId === currentUserId,
      isSystem: replyTo.type === "SYSTEM",
      reactions: [],
      attachments: [],
    };
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
      updatedAt: item.updatedAt,
      editedAt: item.editedAt,
      deletedAt: item.deletedAt,
      chatId: item.chatId,
      senderId: item.senderId,
      replyToId: item.replyToId,
      version: item.version,
      sender:
        participantsIndex.get(item.senderId) ??
        this.mapMessageSenderParticipant(item.sender),
      isOwn: currentUserId !== null && item.senderId === currentUserId,
      isSystem: item.type === "SYSTEM",
      reactions:
        item.reactions?.map((reaction) =>
          this.mapReaction(reaction, participantsIndex),
        ) ?? [],
      attachments: item.attachments ?? [],
      replyTo: item.replyTo
        ? this.mapReplyPreview(item.replyTo, participantsIndex, currentUserId)
        : undefined,
    }));

    const messagesIndex = new Map(
      messages.map((message) => [message.id, message]),
    );

    for (const message of messages) {
      if (message.replyToId) {
        message.replyTo =
          messagesIndex.get(message.replyToId) ?? message.replyTo;
      }
    }

    return messages;
  }

  private static mapSingleMessage(
    item: MessageApi,
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ) {
    return this.mapMessages([item], participants, currentUserId)[0];
  }

  private static buildProposalMessage(
    proposal: PlanProposal,
    chatId: string,
    currentUserId: string,
    participants: ActivityParticipant[],
  ): UnifiedMessage {
    const participantsIndex = new Map(
      participants.map((participant) => [participant.id, participant]),
    );
    const hasUserVoted = proposal.votes.some(
      (vote) => vote.userId === currentUserId,
    );
    const isOwn = proposal.proposerId === currentUserId;
    const isPending = proposal.status === "PENDING";
    const proposalVoters = proposal.votes.map((vote) => {
      const participant = participantsIndex.get(vote.userId);

      return {
        id: vote.userId,
        name:
          participant?.name ??
          (vote.userId === proposal.proposerId
            ? proposal.proposer.name
            : "Member"),
        avatar: participant?.avatar ?? null,
        vote: vote.vote,
      };
    });

    return {
      id: `proposal:${proposal.id}`,
      type: "PLAN_UPDATE",
      content: buildProposalTimelineContent(proposal),
      status: "READ",
      isEdited: false,
      isPinned: false,
      createdAt: proposal.createdAt,
      updatedAt: proposal.updatedAt,
      editedAt: proposal.resolvedAt,
      deletedAt: null,
      chatId,
      senderId: proposal.proposerId,
      replyToId: null,
      version: proposal.version,
      sender: {
        id: proposal.proposer.id,
        name: proposal.proposer.name,
        avatar: proposal.proposer.avatar,
        trustScore: 0,
      },
      reactions: [],
      attachments: [],
      isOwn,
      hasVoted: !isPending || isOwn || hasUserVoted,
      isSystem: false,
      proposal,
      proposalEligibleVoterCount: participants.filter(
        (participant) => participant.id !== proposal.proposerId,
      ).length,
      proposalVoters,
    };
  }

  private static mergeConversationTimeline(
    messages: UnifiedMessage[],
    proposalMessages: UnifiedMessage[],
  ) {
    return [...messages, ...proposalMessages].sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    );
  }

  private static findGroupChat(chats: ChatApi[], groupId: string) {
    return chats.find((chat) => chat.groupId === groupId) ?? null;
  }

  private static buildParticipantsFromChatSummary(
    chat: ChatApi,
    currentUser: User,
  ) {
    const currentUserParticipant = this.mapCurrentUserParticipant(currentUser);
    const normalizedCurrentUserParticipant = {
      ...currentUserParticipant,
      onlineStatus: currentUserParticipant.onlineStatus,
    };
    const participants =
      chat.participants?.map((participant) => ({
        id: participant.user.id,
        name: participant.user.name,
        avatar: participant.user.avatar,
        onlineStatus: participant.user.onlineStatus,
        trustScore:
          participant.user.id === currentUser.id
            ? currentUserParticipant.trustScore
            : 0,
      })) ?? [];

    if (
      !participants.some((participant) => participant.id === currentUser.id)
    ) {
      participants.push(normalizedCurrentUserParticipant);
    } else {
      return participants.map((participant) =>
        participant.id === currentUser.id
          ? normalizedCurrentUserParticipant
          : participant,
      );
    }

    return participants;
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

  private static buildGroupFeedItem(
    groupDto: GroupApi,
    chats: ChatApi[],
    currentUserParticipant: ActivityParticipant,
    typingByChatId: Record<
      string,
      Array<{ id: string; name: string; avatar: string | null }>
    >,
  ): ActivityFeedItem {
    const chat = this.findGroupChat(chats, groupDto.id);
    const group = this.mapGroup(
      groupDto,
      currentUserParticipant.id,
      [],
      chat ?? null,
    );
    const participants = this.buildGroupParticipants(
      group,
      currentUserParticipant,
    );
    const latestMessage = chat?.lastMessage
      ? this.mapSingleMessage(
          chat.lastMessage,
          participants,
          currentUserParticipant.id,
        )
      : undefined;

    return {
      id: group.id,
      kind: "group",
      unreadCount: chat?.unreadCount ?? 0,
      isTyping: chat ? (typingByChatId[chat.id]?.length ?? 0) > 0 : false,
      latestMessage,
      group,
    };
  }

  private static buildDirectFeedItem(
    friendship: FriendshipApi,
    chats: ChatApi[],
    currentUserParticipant: ActivityParticipant,
    typingByChatId: Record<
      string,
      Array<{ id: string; name: string; avatar: string | null }>
    >,
  ): ActivityFeedItem | null {
    const chatSummary = friendship.privateChat
      ? (chats.find((chat) => chat.id === friendship.privateChat?.id) ?? null)
      : null;
    const chat = this.mapDirectChat(
      friendship,
      currentUserParticipant,
      chatSummary,
    );

    if (!chat) {
      return null;
    }

    const latestMessage = chatSummary?.lastMessage
      ? this.mapSingleMessage(
          chatSummary.lastMessage,
          chat.participants
            ?.map((participant) => participant.user)
            .filter(
              (participant): participant is ActivityParticipant =>
                participant !== undefined,
            ) ?? [],
          currentUserParticipant.id,
        )
      : undefined;

    return {
      id: chat.id,
      kind: "dm",
      unreadCount: chatSummary?.unreadCount ?? 0,
      isTyping: (typingByChatId[chat.id]?.length ?? 0) > 0,
      latestMessage,
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

  private static inferAttachmentType(file: File): AttachmentType {
    if (file.type.startsWith("image/")) {
      return "IMAGE";
    }

    if (file.type.startsWith("audio/")) {
      return "AUDIO";
    }

    return "FILE";
  }

  private static inferMessageType(
    attachments: SendMessagePayload["attachments"],
  ): MessageType | undefined {
    const firstAttachment = attachments?.[0];

    if (!firstAttachment) {
      return undefined;
    }

    if (firstAttachment.type === "IMAGE") {
      return "IMAGE";
    }

    if (firstAttachment.type === "AUDIO") {
      return "VOICE";
    }

    return "FILE";
  }

  private static buildOptimisticAttachments(
    attachments: ActivityOutgoingAttachment[] | undefined,
  ) {
    return (
      attachments?.map(({ file, duration }, index) => {
        const type = this.inferAttachmentType(file);
        const objectUrl = URL.createObjectURL(file);

        return {
          id: `temp-attachment:${file.name}:${file.lastModified}:${index}`,
          type,
          url: objectUrl,
          name: file.name,
          size: file.size,
          mimeType: file.type || null,
          thumbnailUrl: type === "IMAGE" ? objectUrl : null,
          duration: type === "AUDIO" ? (duration ?? null) : null,
          waveform: [],
          createdAt: new Date().toISOString(),
        };
      }) ?? []
    );
  }

  private static buildOptimisticMessage(
    currentUser: ActivityParticipant,
    chatId: string,
    input: SendActivityMessageInput,
  ): UnifiedMessage {
    const createdAt = new Date().toISOString();
    const optimisticAttachments = this.buildOptimisticAttachments(
      input.attachments,
    );

    return {
      id: `temp-message:${chatId}:${Date.now()}`,
      type:
        optimisticAttachments[0]?.type === "IMAGE"
          ? "IMAGE"
          : optimisticAttachments[0]?.type === "AUDIO"
            ? "VOICE"
            : optimisticAttachments.length > 0
              ? "FILE"
              : "TEXT",
      content: input.content,
      status: "SENDING",
      isEdited: false,
      isPinned: false,
      createdAt,
      updatedAt: createdAt,
      editedAt: null,
      deletedAt: null,
      chatId,
      senderId: currentUser.id,
      replyToId: input.replyTo?.id ?? input.replyToId ?? null,
      version: Date.now(),
      sender: currentUser,
      replyTo: input.replyTo ?? undefined,
      reactions: [],
      attachments: optimisticAttachments,
      isOwn: true,
      isSystem: false,
    };
  }

  private static async buildSendMessagePayload(
    input: SendActivityMessageInput,
  ): Promise<SendMessagePayload> {
    const attachments = input.attachments?.length
      ? await Promise.all(
          input.attachments.map(async ({ file, duration }) => {
            const uploaded = await ActivityApi.uploadChatAttachment(file);
            const attachmentType = this.inferAttachmentType(file);

            return {
              type: attachmentType,
              url: uploaded.url,
              name: file.name,
              size: file.size,
              mimeType: file.type || undefined,
              thumbnailUrl:
                attachmentType === "IMAGE" ? uploaded.url : undefined,
              duration:
                attachmentType === "AUDIO"
                  ? (duration ?? undefined)
                  : undefined,
            };
          }),
        )
      : undefined;

    return {
      content: input.content.trim() || undefined,
      replyToId: input.replyTo?.id ?? input.replyToId ?? undefined,
      type: this.inferMessageType(attachments),
      attachments,
    };
  }

  private static createOptimisticMessageApi(
    message: UnifiedMessage,
  ): MessageApi {
    return {
      id: message.id,
      type: message.type,
      content: message.content,
      status: message.status,
      isEdited: message.isEdited,
      isPinned: message.isPinned,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      chatId: message.chatId,
      senderId: message.senderId,
      replyToId: message.replyToId,
      version: message.version,
      sender: message.sender
        ? {
            id: message.sender.id,
            name: message.sender.name,
            avatar: message.sender.avatar,
          }
        : undefined,
      replyTo: message.replyTo
        ? {
            id: message.replyTo.id,
            type: message.replyTo.type,
            senderId: message.replyTo.senderId,
            content: message.replyTo.content,
            deletedAt: message.replyTo.deletedAt,
            sender: message.replyTo.sender
              ? {
                  id: message.replyTo.sender.id,
                  name: message.replyTo.sender.name,
                  avatar: message.replyTo.sender.avatar,
                }
              : undefined,
          }
        : undefined,
      reactions:
        message.reactions?.map((reaction) => ({
          emoji: reaction.emoji,
          createdAt: reaction.createdAt,
          messageId: reaction.messageId,
          userId: reaction.userId,
        })) ?? [],
      attachments:
        message.attachments?.map((attachment) => ({
          id: attachment.id,
          type: attachment.type,
          url: attachment.url,
          name: attachment.name ?? null,
          size: attachment.size ?? null,
          mimeType: attachment.mimeType ?? null,
          thumbnailUrl: attachment.thumbnailUrl ?? null,
          duration: attachment.duration ?? null,
          waveform: attachment.waveform,
          createdAt: attachment.createdAt,
        })) ?? [],
    };
  }

  private static emptyMessagesPage(): ActivityMessagesPageData {
    return {
      items: [],
      meta: {
        totalItemsCount: 0,
        itemsPerPage: DEFAULT_MESSAGE_LIMIT,
        currentPage: 1,
        totalPages: 1,
      },
    };
  }

  private static updateMessagesCache(
    chatId: string,
    updater: (
      data: ActivityMessagesInfiniteData | undefined,
    ) => ActivityMessagesInfiniteData | undefined,
  ) {
    appQueryClient.setQueryData<ActivityMessagesInfiniteData>(
      ["activity-messages", chatId],
      (current) => updater(current),
    );
  }

  private static insertOptimisticMessage(
    chatId: string,
    message: UnifiedMessage,
  ) {
    this.updateMessagesCache(chatId, (current) => {
      const base =
        current ??
        ({
          pages: [this.emptyMessagesPage()],
          pageParams: [1],
        } satisfies ActivityMessagesInfiniteData);
      const firstPage = base.pages[0] ?? this.emptyMessagesPage();

      return {
        ...base,
        pages: [
          {
            ...firstPage,
            items: [message, ...firstPage.items],
            meta: {
              ...firstPage.meta,
              totalItemsCount: firstPage.meta.totalItemsCount + 1,
            },
          },
          ...base.pages.slice(1),
        ],
      };
    });
  }

  private static replaceMessageInCache(
    chatId: string,
    targetId: string,
    replacement: UnifiedMessage,
  ) {
    this.updateMessagesCache(chatId, (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: this.dedupeMessagePages(
          current.pages.map((page) => ({
            ...page,
            items: page.items.map((item) =>
              item.id === targetId
                ? this.shouldReplaceMessage(item, replacement, targetId)
                  ? replacement
                  : item
                : item,
            ),
          })),
        ),
      };
    });
  }

  private static updateMessageStatusInCache(
    chatId: string,
    targetId: string,
    status: UnifiedMessage["status"],
  ) {
    this.updateMessagesCache(chatId, (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) => ({
          ...page,
          items: page.items.map((item) =>
            item.id === targetId ? { ...item, status } : item,
          ),
        })),
      };
    });
  }

  private static syncPinnedMessage(chatId: string, message: UnifiedMessage) {
    const messageApi = this.createOptimisticMessageApi(message);
    const updatePinnedApiList = (current: MessageApi[] | undefined) => {
      const existing = current?.find((item) => item.id === message.id);
      const nextMessage =
        existing && !this.shouldReplaceApiMessage(existing, messageApi)
          ? existing
          : messageApi;
      const withoutExisting =
        current?.filter((item) => item.id !== message.id) ?? [];

      if (!message.isPinned) {
        return withoutExisting;
      }

      return [nextMessage, ...withoutExisting].sort(
        (left, right) =>
          this.getMessageVersion(right) - this.getMessageVersion(left),
      );
    };
    const updatePinnedUiList = (current: UnifiedMessage[] | undefined) => {
      const existing = current?.find((item) => item.id === message.id);
      const nextMessage =
        existing && !this.shouldReplaceMessage(existing, message, message.id)
          ? existing
          : message;
      const withoutExisting =
        current?.filter((item) => item.id !== message.id) ?? [];

      if (!message.isPinned) {
        return withoutExisting;
      }

      return [nextMessage, ...withoutExisting].sort(
        (left, right) =>
          this.getMessageVersion(right) - this.getMessageVersion(left),
      );
    };

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinnedMessages: updatePinnedApiList(chat.pinnedMessages),
              }
            : chat,
        ) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: ["activity-selection", "group"],
    })) {
      if (!selection?.group?.chat || selection.group.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          chat: {
            ...selection.group.chat,
            pinnedMessages: updatePinnedUiList(
              selection.group.chat.pinnedMessages,
            ),
          },
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: ["activity-selection", "dm"],
    })) {
      if (!selection?.chat || selection.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          pinnedMessages: updatePinnedUiList(selection.chat.pinnedMessages),
        },
      });
    }
  }

  private static removePinnedMessage(chatId: string, messageId: string) {
    const removeFromList = (current: UnifiedMessage[] | undefined) =>
      current?.filter((item) => item.id !== messageId) ?? [];

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                pinnedMessages: (chat.pinnedMessages ?? []).filter(
                  (message) => message.id !== messageId,
                ),
              }
            : chat,
        ) ?? current,
    );

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityGroupSelectionData>({
      queryKey: ["activity-selection", "group"],
    })) {
      if (!selection?.group?.chat || selection.group.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityGroupSelectionData>(queryKey, {
        ...selection,
        group: {
          ...selection.group,
          chat: {
            ...selection.group.chat,
            pinnedMessages: removeFromList(selection.group.chat.pinnedMessages),
          },
        },
      });
    }

    for (const [
      queryKey,
      selection,
    ] of appQueryClient.getQueriesData<ActivityDirectSelectionData>({
      queryKey: ["activity-selection", "dm"],
    })) {
      if (!selection?.chat || selection.chat.id !== chatId) {
        continue;
      }

      appQueryClient.setQueryData<ActivityDirectSelectionData>(queryKey, {
        ...selection,
        chat: {
          ...selection.chat,
          pinnedMessages: removeFromList(selection.chat.pinnedMessages),
        },
      });
    }
  }

  private static updateChatSummaryCache(updatedChat: ChatApi) {
    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === updatedChat.id
            ? {
                ...chat,
                ...updatedChat,
                lastMessage: this.pickNewerApiMessage(
                  chat.lastMessage,
                  updatedChat.lastMessage,
                ),
                pinnedMessages: this.mergePinnedApiMessages(
                  chat.pinnedMessages,
                  updatedChat.pinnedMessages,
                ),
              }
            : chat,
        ) ?? current,
    );
  }

  private static updateChatLastMessage(
    chatId: string,
    message: UnifiedMessage,
    {
      hasUnread,
      unreadCount,
    }: {
      hasUnread: boolean;
      unreadCount: number;
    },
  ) {
    const optimisticMessage = this.createOptimisticMessageApi(message);

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId &&
          this.shouldReplaceApiMessage(chat.lastMessage, optimisticMessage)
            ? {
                ...chat,
                lastMessage: optimisticMessage,
                hasUnread,
                unreadCount,
              }
            : chat.id === chatId
              ? {
                  ...chat,
                  hasUnread,
                  unreadCount,
                }
              : chat,
        ) ?? current,
    );
  }

  private static removeMessageFromCache(chatId: string, messageId: string) {
    this.updateMessagesCache(chatId, (current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        pages: current.pages.map((page) => {
          const nextItems = page.items.filter((item) => item.id !== messageId);
          const removedCount = page.items.length - nextItems.length;

          return {
            ...page,
            items: nextItems,
            meta: {
              ...page.meta,
              totalItemsCount: Math.max(
                0,
                page.meta.totalItemsCount - removedCount,
              ),
            },
          };
        }),
      };
    });
  }

  private static syncChatLastMessageFromMessagesCache(chatId: string) {
    const messagesData =
      appQueryClient.getQueryData<ActivityMessagesInfiniteData>([
        "activity-messages",
        chatId,
      ]);
    const latestMessage = messagesData?.pages.find(
      (page) => page.items.length > 0,
    )?.items[0];

    appQueryClient.setQueryData<ChatApi[]>(
      ACTIVITY_CHATS_QUERY_KEY,
      (current) =>
        current?.map((chat) =>
          chat.id === chatId
            ? {
                ...chat,
                lastMessage: latestMessage
                  ? this.createOptimisticMessageApi(latestMessage)
                  : null,
              }
            : chat,
        ) ?? current,
    );
  }

  private static mergeProposalIntoList(
    currentProposals: PlanProposal[],
    proposal: PlanProposal,
    kind: PlanUpdateKind,
  ) {
    const existingProposal = currentProposals.find(
      (item) => item.id === proposal.id,
    );
    const nextProposal =
      existingProposal &&
      this.getProposalVersion(existingProposal) >
        this.getProposalVersion(proposal)
        ? existingProposal
        : proposal;
    const withoutExisting = currentProposals.filter(
      (item) => item.id !== proposal.id,
    );

    if (kind === "proposal_created") {
      return [nextProposal, ...withoutExisting];
    }

    return [nextProposal, ...withoutExisting].sort(
      (left, right) =>
        this.getProposalVersion(right) - this.getProposalVersion(left),
    );
  }

  private static getMessageVersion(
    message:
      | Pick<MessageApi, "createdAt" | "updatedAt" | "version">
      | Pick<UnifiedMessage, "createdAt" | "updatedAt" | "version">,
  ) {
    return (
      message.version ??
      new Date(message.updatedAt ?? message.createdAt).getTime()
    );
  }

  private static getGroupVersion(
    group:
      | Pick<GroupApi, "updatedAt" | "version">
      | Pick<Group, "updatedAt" | "version">,
  ) {
    return group.version ?? new Date(group.updatedAt).getTime();
  }

  private static getPlanVersion(
    plan: Pick<Plan, "createdAt" | "updatedAt" | "version">,
  ) {
    return plan.version ?? new Date(plan.updatedAt ?? plan.createdAt).getTime();
  }

  private static getProposalVersion(
    proposal: Pick<PlanProposal, "createdAt" | "updatedAt" | "version">,
  ) {
    return (
      proposal.version ??
      new Date(proposal.updatedAt ?? proposal.createdAt).getTime()
    );
  }

  private static shouldReplaceApiMessage(
    current: MessageApi | null | undefined,
    incoming: MessageApi,
  ) {
    if (!current) {
      return true;
    }

    return this.getMessageVersion(incoming) >= this.getMessageVersion(current);
  }

  private static shouldReplaceMessage(
    current: UnifiedMessage,
    incoming: UnifiedMessage,
    targetId: string,
  ) {
    if (targetId.startsWith("temp-message:")) {
      return true;
    }

    if (
      current.id.startsWith("temp-message:") &&
      !incoming.id.startsWith("temp-message:")
    ) {
      return true;
    }

    return this.getMessageVersion(incoming) >= this.getMessageVersion(current);
  }

  private static pickNewerApiMessage(
    current: MessageApi | null | undefined,
    incoming: MessageApi | null | undefined,
  ) {
    if (!current) {
      return incoming ?? null;
    }

    if (!incoming) {
      return current;
    }

    return this.shouldReplaceApiMessage(current, incoming) ? incoming : current;
  }

  private static mergePinnedApiMessages(
    current: MessageApi[] | undefined,
    incoming: MessageApi[] | undefined,
  ) {
    if (!current?.length) {
      return incoming;
    }

    if (!incoming?.length) {
      return current;
    }

    const merged = new Map<string, MessageApi>();

    for (const item of current) {
      merged.set(item.id, item);
    }

    for (const item of incoming) {
      const existing = merged.get(item.id);
      merged.set(
        item.id,
        existing && !this.shouldReplaceApiMessage(existing, item)
          ? existing
          : item,
      );
    }

    return [...merged.values()].sort(
      (left, right) =>
        this.getMessageVersion(right) - this.getMessageVersion(left),
    );
  }

  private static normalizeMessageContent(content: string) {
    return content.trim().replace(/\s+/g, " ");
  }

  private static createAttachmentSignature(
    attachments:
      | UnifiedMessage["attachments"]
      | MessageApi["attachments"]
      | undefined,
  ) {
    return (attachments ?? [])
      .map((attachment) =>
        [
          attachment.type,
          attachment.name ?? "",
          attachment.size ?? "",
          attachment.mimeType ?? "",
          attachment.duration ?? "",
        ].join(":"),
      )
      .join("|");
  }

  private static areMessagesEquivalent(
    optimisticMessage: UnifiedMessage,
    incomingMessage: UnifiedMessage,
  ) {
    if (
      optimisticMessage.chatId !== incomingMessage.chatId ||
      optimisticMessage.senderId !== incomingMessage.senderId ||
      optimisticMessage.type !== incomingMessage.type ||
      optimisticMessage.replyToId !== incomingMessage.replyToId
    ) {
      return false;
    }

    if (
      this.normalizeMessageContent(optimisticMessage.content) !==
      this.normalizeMessageContent(incomingMessage.content)
    ) {
      return false;
    }

    if (
      this.createAttachmentSignature(optimisticMessage.attachments) !==
      this.createAttachmentSignature(incomingMessage.attachments)
    ) {
      return false;
    }

    return (
      Math.abs(
        new Date(incomingMessage.createdAt).getTime() -
          new Date(optimisticMessage.createdAt).getTime(),
      ) <
      2 * 60 * 1000
    );
  }

  private static findMatchingOptimisticMessage(
    messages: UnifiedMessage[],
    incomingMessage: UnifiedMessage,
  ) {
    return messages
      .filter(
        (message) =>
          message.id.startsWith("temp-message:") &&
          message.status === "SENDING" &&
          this.areMessagesEquivalent(message, incomingMessage),
      )
      .sort(
        (left, right) =>
          Math.abs(
            new Date(incomingMessage.createdAt).getTime() -
              new Date(left.createdAt).getTime(),
          ) -
          Math.abs(
            new Date(incomingMessage.createdAt).getTime() -
              new Date(right.createdAt).getTime(),
          ),
      )[0];
  }

  private static dedupeMessagePages(pages: ActivityMessagesPageData[]) {
    const seen = new Set<string>();

    return pages.map((page) => {
      const dedupedItems = page.items.filter((item) => {
        if (seen.has(item.id)) {
          return false;
        }

        seen.add(item.id);
        return true;
      });
      const removedCount = page.items.length - dedupedItems.length;

      if (removedCount === 0) {
        return page;
      }

      return {
        ...page,
        items: dedupedItems,
        meta: {
          ...page.meta,
          totalItemsCount: Math.max(
            0,
            page.meta.totalItemsCount - removedCount,
          ),
        },
      };
    });
  }
}
