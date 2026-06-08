import { ActivityProjections } from "@/features/activity/api/activity-projections";
import type { ActivityFeedStateMeta } from "@/features/activity/api/projections/activity-feed-projections";
import type {
  ActivityParticipant,
  DirectChat,
  FilterChip,
  Group,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type {
  ChatApi,
  FriendshipApi,
  GroupApi,
  MessageApi,
  PlanProposal,
  User,
} from "@/shared/schemas";

export function mapCurrentUserParticipant(user: User): ActivityParticipant {
  return ActivityProjections.mapCurrentUserParticipant(user);
}

export function mapGroup(
  group: GroupApi,
  currentUserId: string | null,
  proposals: PlanProposal[] = [],
  chatSummary?: Pick<ChatApi, "id" | "isMuted" | "pinnedMessages"> | null,
): Group {
  return ActivityProjections.mapGroup(
    group,
    currentUserId,
    proposals,
    chatSummary,
  );
}

export function mapApiGroupFromSelection(group: Group): GroupApi {
  return ActivityProjections.mapApiGroupFromSelection(group);
}

export function mapDirectChat(
  friendship: FriendshipApi,
  currentUser: ActivityParticipant,
  chatSummary?: ChatApi | null,
): DirectChat | null {
  return ActivityProjections.mapDirectChat(
    friendship,
    currentUser,
    chatSummary,
  );
}

export function mapNotesChat(
  chatSummary: ChatApi,
  currentUser: ActivityParticipant,
): DirectChat {
  return ActivityProjections.mapNotesChat(chatSummary, currentUser);
}

export function mapMessages(
  items: MessageApi[],
  participants: ActivityParticipant[],
  currentUserId: string | null,
): UnifiedMessage[] {
  return ActivityProjections.mapMessages(items, participants, currentUserId);
}

export function buildProposalMessage(
  proposal: PlanProposal,
  chatId: string,
  currentUserId: string,
  participants: ActivityParticipant[],
): UnifiedMessage {
  return ActivityProjections.buildProposalMessage(
    proposal,
    chatId,
    currentUserId,
    participants,
  );
}

export function buildParticipantsFromChatSummary(
  chat: ChatApi,
  currentUser: User,
) {
  return ActivityProjections.buildParticipantsFromChatSummary(
    chat,
    currentUser,
  );
}

export function buildGroupParticipants(
  group: Group,
  currentUserParticipant: ActivityParticipant,
) {
  return ActivityProjections.buildGroupParticipants(
    group,
    currentUserParticipant,
  );
}

export function deriveActivityFeedData(
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
  meta?: ActivityFeedStateMeta,
) {
  return ActivityProjections.deriveFeedData(
    activeFilter,
    searchQuery,
    groups,
    chats,
    friendships,
    currentUser,
    typingByChatId,
    meta,
  );
}

export function mergeActivityConversationTimeline(
  messages: UnifiedMessage[],
  proposalMessages: UnifiedMessage[],
) {
  return ActivityProjections.mergeConversationTimeline(
    messages,
    proposalMessages,
  );
}

export function findGroupChat(chats: ChatApi[], groupId: string) {
  return ActivityProjections.findGroupChat(chats, groupId);
}
