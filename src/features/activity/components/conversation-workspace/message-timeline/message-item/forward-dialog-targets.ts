import type { ChatApi, FriendshipApi, GroupApi } from "@/shared/schemas";
import type { ForwardTarget } from "./forward-message-dialog.types";

export function buildForwardTargets({
  chats,
  friendships,
  groups,
  sourceChatId,
}: {
  chats: ChatApi[];
  friendships: FriendshipApi[];
  groups: GroupApi[];
  sourceChatId: string;
}): ForwardTarget[] {
  const chatsByGroupId = buildForwardChatByGroupId(chats);

  return sortForwardTargets([
    ...buildGroupForwardTargets({ chatsByGroupId, groups, sourceChatId }),
    ...buildDirectForwardTargets({ friendships, sourceChatId }),
  ]);
}

function buildForwardChatByGroupId(chats: ChatApi[]) {
  return new Map<string, ChatApi>(
    chats.flatMap(
      (chat): Array<[string, ChatApi]> =>
        chat.groupId ? [[chat.groupId, chat]] : [],
    ),
  );
}

function buildGroupForwardTargets({
  chatsByGroupId,
  groups,
  sourceChatId,
}: {
  chatsByGroupId: ReadonlyMap<string, ChatApi>;
  groups: GroupApi[];
  sourceChatId: string;
}) {
  const targets: ForwardTarget[] = [];

  for (const group of groups) {
    const target = getGroupForwardTarget({
      chatsByGroupId,
      group,
      sourceChatId,
    });

    if (target) {
      targets.push(target);
    }
  }

  return targets;
}

function getGroupForwardTarget({
  chatsByGroupId,
  group,
  sourceChatId,
}: {
  chatsByGroupId: ReadonlyMap<string, ChatApi>;
  group: GroupApi;
  sourceChatId: string;
}): ForwardTarget | null {
  const chat = chatsByGroupId.get(group.id);

  if (!chat || chat.id === sourceChatId) {
    return null;
  }

  return {
    avatar: group.avatar,
    avatarMedia: group.avatarMedia,
    chatId: chat.id,
    kind: "group",
    title: group.name,
  };
}

function buildDirectForwardTargets({
  friendships,
  sourceChatId,
}: {
  friendships: FriendshipApi[];
  sourceChatId: string;
}) {
  const targets: ForwardTarget[] = [];

  for (const friendship of friendships) {
    const target = getDirectForwardTarget({ friendship, sourceChatId });

    if (target) {
      targets.push(target);
    }
  }

  return targets;
}

function getDirectForwardTarget({
  friendship,
  sourceChatId,
}: {
  friendship: FriendshipApi;
  sourceChatId: string;
}): ForwardTarget | null {
  const chatId = friendship.privateChat?.id;

  if (!chatId || chatId === sourceChatId) {
    return null;
  }

  return {
    avatar: friendship.counterpart.avatar,
    chatId,
    kind: "dm",
    title: friendship.counterpart.name,
  };
}

function sortForwardTargets(targets: ForwardTarget[]) {
  return targets.sort((left, right) => left.title.localeCompare(right.title));
}
