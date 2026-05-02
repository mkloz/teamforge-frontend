import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  PlanProposal,
} from "@/shared/schemas";

import type {
  ActivityParticipant,
  DirectChat,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";

interface ActivitySelectionBaseData {
  chats: ChatApi[];
  currentUserParticipant: ActivityParticipant;
  friendships: FriendshipApi[];
}

export interface ActivityQueryOptionsContext {
  buildGroupParticipants(
    group: Group,
    currentUserParticipant: ActivityParticipant,
  ): ActivityParticipant[];
  buildProposalMessage(
    proposal: PlanProposal,
    chatId: string,
    currentUserId: string,
    participants: ActivityParticipant[],
  ): UnifiedMessage;
  ensureBaseData(): Promise<ActivitySelectionBaseData>;
  findGroupChat(chats: ChatApi[], groupId: string): ChatApi | null | undefined;
  mapDirectChat(
    friendship: FriendshipApi,
    currentUser: ActivityParticipant,
    chatSummary?: ChatApi | null,
  ): DirectChat | null;
  mapGroup(
    group: GroupApi,
    currentUserId: string | null,
    proposals: PlanProposal[],
    chatSummary?: Pick<ChatApi, "id" | "pinnedMessages"> | null,
  ): Group;
  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[];
}
