interface FriendshipLike {
  privateChat?: { id: string } | null;
  privateChatId?: string | null;
}

export function getFriendshipMessageChatId(friendship: FriendshipLike) {
  return friendship.privateChat?.id ?? friendship.privateChatId ?? null;
}
