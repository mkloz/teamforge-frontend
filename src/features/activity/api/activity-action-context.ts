import type {
  ActivityOutgoingAttachment,
  ActivityOutgoingGifAttachment,
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import type {
  FriendshipApi,
  GroupApi,
  MessageApi,
  User,
} from "@/shared/schemas";

export interface SendActivityMessageInput {
  attachments?: ActivityOutgoingAttachment[];
  content: string;
  gif?: ActivityOutgoingGifAttachment;
  replyTo?: UnifiedMessage | null;
  replyToId?: string | null;
}

interface ActivityActionBaseData {
  currentUser: User;
  currentUserParticipant: ActivityParticipant;
}

interface UpdateChatLastMessageOptions {
  hasUnread: boolean;
  unreadCount: number;
}

export interface ActivityActionContext {
  applyFriendshipUpdate(friendship: FriendshipApi): void;
  applyRealtimeGroupUpdate(currentUserId: string, group: GroupApi): void;
  ensureBaseData(): Promise<ActivityActionBaseData>;
  mapMessages(
    items: MessageApi[],
    participants: ActivityParticipant[],
    currentUserId: string | null,
  ): UnifiedMessage[];
  removeFriendshipFromActivity(friendship: FriendshipApi): void;
  removePinnedMessage(chatId: string, messageId: string): void;
  resolveChatId(
    kind: "group" | "dm",
    selectedId: string,
  ): Promise<string | null>;
  resolveParticipants(
    kind: "group" | "dm",
    selectedId: string,
    currentUserParticipant: ActivityParticipant,
  ): Promise<ActivityParticipant[]>;
  syncPinnedMessage(chatId: string, message: UnifiedMessage): void;
  updateChatLastMessage(
    chatId: string,
    message: UnifiedMessage,
    options: UpdateChatLastMessageOptions,
  ): void;
}
