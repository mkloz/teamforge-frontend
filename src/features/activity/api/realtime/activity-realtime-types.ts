import type {
  ActivityParticipant,
  Group,
  Plan,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  PlanProposal,
  PlanUpdateKind,
  User,
} from "@/shared/schemas";

export interface ApplyRealtimeMessageOptions {
  activeChatId?: string | null;
}

export interface ActivityRealtimeContext {
  buildGroupParticipants(
    group: Group,
    currentUserParticipant: ActivityParticipant,
  ): ActivityParticipant[];
  buildParticipantsFromChatSummary(
    chat: ChatApi,
    currentUser: User,
  ): ActivityParticipant[];
  buildProposalMessage(
    proposal: PlanProposal,
    chatId: string,
    currentUserId: string,
    participants: ActivityParticipant[],
  ): UnifiedMessage;
  getPlanVersion(
    plan: Pick<Plan, "createdAt" | "updatedAt" | "version">,
  ): number;
  getGroupVersion(
    group:
      | Pick<GroupApi, "updatedAt" | "version">
      | Pick<Group, "updatedAt" | "version">,
  ): number;
  isSameFriendshipPair(
    requesterId: string,
    receiverId: string,
    friendship: Pick<FriendshipApi, "requesterId" | "receiverId">,
  ): boolean;
  mapApiGroupFromSelection(group: Group): GroupApi;
  mapCurrentUserParticipant(user: User): ActivityParticipant;
  mapGroup(
    group: GroupApi,
    currentUserId: string | null,
    proposals?: PlanProposal[],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ): Group;
  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[];
  mergeProposalIntoList(
    currentProposals: PlanProposal[],
    proposal: PlanProposal,
    kind: PlanUpdateKind,
  ): PlanProposal[];
  mergeFriendshipList(
    current: FriendshipApi[] | undefined,
    incoming: FriendshipApi,
  ): FriendshipApi[];
  removePinnedMessage(chatId: string, messageId: string): void;
  syncPinnedMessage(chatId: string, message: UnifiedMessage): void;
  updateChatSummaryCache(updatedChat: ChatApi): void;
}
