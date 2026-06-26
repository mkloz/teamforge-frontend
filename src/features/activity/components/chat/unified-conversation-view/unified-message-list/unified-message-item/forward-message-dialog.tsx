import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import { getActivityPopupPanelClass } from "@/features/activity/components/activity-popup-styles";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { showAppSuccessToast } from "@/shared/lib/app-toast";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import type { ChatApi, FriendshipApi, GroupApi } from "@/shared/schemas";

interface ForwardMessageDialogProps {
  message?: UnifiedMessage;
  messages?: UnifiedMessage[];
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onForwardComplete?: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  isOnline?: boolean;
}

type ForwardMessageHandler = NonNullable<
  ForwardMessageDialogProps["onForward"]
>;

export function ForwardMessageDialog({
  message,
  messages,
  isOnline = true,
  onForward,
  onForwardComplete,
  onOpenChange,
  open,
}: ForwardMessageDialogProps) {
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const messagesToForward = getMessagesToForward({ message, messages });
  const sourceChatId = getForwardSourceChatId(messagesToForward);
  const forwardDialogModel = useForwardDialogModel({
    isOnline,
    sourceChatId,
  });

  async function handleForward(target: ForwardTarget) {
    if (!isOnline || !onForward || messagesToForward.length === 0) {
      return;
    }

    await runForwardMessageAction({
      messages: messagesToForward,
      onForward,
      onForwardComplete,
      onOpenChange,
      setPendingTargetId,
      target,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={getActivityPopupPanelClass(
          "flex max-h-[min(30rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-sm flex-col gap-0 overflow-hidden rounded-lg p-0 [&>button]:shadow-none",
        )}
      >
        <ForwardDialogHeader messageCount={messagesToForward.length} />
        <ForwardDialogBody
          forwardDialogModel={forwardDialogModel}
          isOnline={isOnline}
          onForward={handleForward}
          pendingTargetId={pendingTargetId}
        />
      </DialogContent>
    </Dialog>
  );
}

function getMessagesToForward({
  message,
  messages,
}: Pick<ForwardMessageDialogProps, "message" | "messages">) {
  return messages ?? (message ? [message] : []);
}

function getForwardSourceChatId(messagesToForward: UnifiedMessage[]) {
  return messagesToForward[0]?.chatId ?? "";
}

function useForwardDialogModel({
  isOnline,
  sourceChatId,
}: {
  isOnline: boolean;
  sourceChatId: string;
}) {
  const groupsQuery = useQuery(ActivityQueryFactory.groups());
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const friendshipsQuery = useQuery(ActivityQueryFactory.friendships());
  const forwardSourceQueries = [groupsQuery, chatsQuery, friendshipsQuery];

  return getForwardDialogModel({
    chats: chatsQuery.data ?? [],
    friendships: friendshipsQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    hasLoadError: forwardSourceQueries.some((query) => query.isError),
    isLoading: forwardSourceQueries.some((query) => query.isPending),
    isOnline,
    sourceChatId,
  });
}

function ForwardDialogHeader({ messageCount }: { messageCount: number }) {
  const copy = getForwardDialogHeaderCopy(messageCount);

  return (
    <DialogHeader className="border-border/55 border-b px-4 py-3 pr-11 text-left">
      <DialogTitle className="font-bold text-base">{copy.title}</DialogTitle>
      <DialogDescription className="text-muted-foreground text-xs">
        Pick where {copy.descriptionSubject} should go.
      </DialogDescription>
    </DialogHeader>
  );
}

function getForwardDialogHeaderCopy(messageCount: number) {
  const isForwardingMultipleMessages = messageCount > 1;

  return {
    descriptionSubject: isForwardingMultipleMessages
      ? "these messages"
      : "this message",
    title: isForwardingMultipleMessages
      ? "Forward messages"
      : "Forward message",
  };
}

function ForwardDialogBody({
  forwardDialogModel,
  isOnline,
  onForward,
  pendingTargetId,
}: {
  forwardDialogModel: ForwardDialogModel;
  isOnline: boolean;
  onForward: (target: ForwardTarget) => Promise<void>;
  pendingTargetId: string | null;
}) {
  return (
    <div className="min-h-0 overflow-y-auto p-1.5">
      {forwardDialogModel.state ? (
        <ForwardDialogState {...forwardDialogModel.state} />
      ) : (
        forwardDialogModel.targets.map((target) => (
          <ForwardTargetButton
            key={target.chatId}
            disabled={!isOnline || pendingTargetId !== null}
            isPending={pendingTargetId === target.chatId}
            onForward={onForward}
            target={target}
          />
        ))
      )}
    </div>
  );
}

async function runForwardMessageAction({
  messages,
  onForward,
  onForwardComplete,
  onOpenChange,
  setPendingTargetId,
  target,
}: {
  messages: UnifiedMessage[];
  onForward: ForwardMessageHandler;
  onForwardComplete: ForwardMessageDialogProps["onForwardComplete"];
  onOpenChange: ForwardMessageDialogProps["onOpenChange"];
  setPendingTargetId: (targetId: string | null) => void;
  target: ForwardTarget;
}) {
  setPendingTargetId(target.chatId);

  try {
    await forwardMessagesSequentially({
      messages,
      onForward,
      targetChatId: target.chatId,
    });

    showForwardSuccessToast({
      messageCount: messages.length,
      targetTitle: target.title,
    });
    completeForwardDialog({ onForwardComplete, onOpenChange });
  } catch (error) {
    showForwardErrorToast(error);
  } finally {
    setPendingTargetId(null);
  }
}

async function forwardMessagesSequentially({
  messages,
  onForward,
  targetChatId,
}: {
  messages: UnifiedMessage[];
  onForward: ForwardMessageHandler;
  targetChatId: string;
}) {
  await messages.reduce<Promise<void>>(async (previousForward, message) => {
    await previousForward;
    await forwardMessageToTarget({ message, onForward, targetChatId });
  }, Promise.resolve());
}

async function forwardMessageToTarget({
  message,
  onForward,
  targetChatId,
}: {
  message: UnifiedMessage;
  onForward: ForwardMessageHandler;
  targetChatId: string;
}) {
  const result = await onForward(message, targetChatId);

  if (!result) {
    throw new Error("Forward target is no longer available.");
  }
}

function showForwardSuccessToast({
  messageCount,
  targetTitle,
}: {
  messageCount: number;
  targetTitle: string;
}) {
  showAppSuccessToast(getForwardSuccessMessage({ messageCount, targetTitle }), {
    id: "message-forwarded",
  });
}

function getForwardSuccessMessage({
  messageCount,
  targetTitle,
}: {
  messageCount: number;
  targetTitle: string;
}) {
  return messageCount === 1
    ? `Forwarded to ${targetTitle}.`
    : `Forwarded ${messageCount} messages to ${targetTitle}.`;
}

function showForwardErrorToast(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "We couldn't forward that message.",
  });
}

function completeForwardDialog({
  onForwardComplete,
  onOpenChange,
}: Pick<ForwardMessageDialogProps, "onForwardComplete" | "onOpenChange">) {
  onOpenChange(false);
  onForwardComplete?.();
}

interface ForwardDialogStateProps {
  description: string;
  label: string;
  role?: "alert" | "status";
}

interface ForwardDialogStateInput {
  hasLoadError: boolean;
  isLoading: boolean;
  isOnline: boolean;
  targetCount: number;
}

type ForwardDialogStatus = "empty" | "error" | "loading" | "offline";

const FORWARD_DIALOG_STATE_BY_STATUS: Record<
  ForwardDialogStatus,
  ForwardDialogStateProps
> = {
  empty: {
    description: "Start another chat before forwarding this message.",
    label: "There is nowhere else to forward this yet.",
  },
  error: {
    description: "Close this and try again in a moment.",
    label: "We couldn't load your conversations.",
    role: "alert",
  },
  loading: {
    description: "This usually takes a moment.",
    label: "Finding conversations...",
    role: "status",
  },
  offline: {
    description: "Reconnect before forwarding messages.",
    label: "You're offline.",
    role: "status",
  },
};

const FORWARD_DIALOG_STATE_CHECKS: Array<{
  isActive: (input: ForwardDialogStateInput) => boolean;
  status: ForwardDialogStatus;
}> = [
  {
    isActive: ({ isOnline }) => !isOnline,
    status: "offline",
  },
  {
    isActive: ({ isLoading }) => isLoading,
    status: "loading",
  },
  {
    isActive: ({ hasLoadError }) => hasLoadError,
    status: "error",
  },
  {
    isActive: ({ targetCount }) => targetCount === 0,
    status: "empty",
  },
];

interface ForwardDialogModel {
  state: ForwardDialogStateProps | null;
  targets: ForwardTarget[];
}

function getForwardDialogModel({
  chats,
  friendships,
  groups,
  hasLoadError,
  isLoading,
  isOnline,
  sourceChatId,
}: {
  chats: ChatApi[];
  friendships: FriendshipApi[];
  groups: GroupApi[];
  hasLoadError: boolean;
  isLoading: boolean;
  isOnline: boolean;
  sourceChatId: string;
}): ForwardDialogModel {
  const targets = buildForwardTargets({
    chats,
    friendships,
    groups,
    sourceChatId,
  });

  return {
    state: getForwardDialogState({
      hasLoadError,
      isLoading,
      isOnline,
      targetCount: targets.length,
    }),
    targets,
  };
}

function getForwardDialogState({
  hasLoadError,
  isLoading,
  isOnline,
  targetCount,
}: ForwardDialogStateInput): ForwardDialogStateProps | null {
  const matchingState = FORWARD_DIALOG_STATE_CHECKS.find(({ isActive }) =>
    isActive({ hasLoadError, isLoading, isOnline, targetCount }),
  );

  return matchingState
    ? FORWARD_DIALOG_STATE_BY_STATUS[matchingState.status]
    : null;
}

function ForwardDialogState({
  description,
  label,
  role,
}: ForwardDialogStateProps) {
  return (
    <div
      role={role}
      className="flex min-h-40 flex-col items-center justify-center gap-1 px-4 py-6 text-center"
    >
      <p className="font-bold text-ink text-sm">{label}</p>
      <p className="max-w-64 text-muted-foreground text-xs leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ForwardTargetButton({
  disabled,
  isPending,
  onForward,
  target,
}: {
  disabled: boolean;
  isPending: boolean;
  onForward: (target: ForwardTarget) => Promise<void>;
  target: ForwardTarget;
}) {
  return (
    <button
      type="button"
      aria-busy={isPending}
      className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-primary/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={disabled}
      onClick={() => {
        void onForward(target);
      }}
    >
      <Avatar
        src={target.avatar}
        media={target.avatarMedia ?? null}
        name={target.title}
        alt=""
        imageSize={48}
        className="size-9"
        fallbackClassName="bg-primary/12 text-primary"
        aria-hidden="true"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-bold text-sm">{target.title}</span>
        <span className="block text-muted-foreground text-xs">
          {target.kind === "group" ? "Group" : "Direct chat"}
        </span>
      </span>
      {isPending && (
        <span aria-live="polite" className="text-muted-foreground text-xs">
          Forwarding...
        </span>
      )}
    </button>
  );
}

interface ForwardTarget {
  avatar: string | null;
  avatarMedia?: GroupApi["avatarMedia"];
  chatId: string;
  kind: "dm" | "group";
  title: string;
}

function buildForwardTargets({
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
  return groups
    .map((group) =>
      getGroupForwardTarget({ chatsByGroupId, group, sourceChatId }),
    )
    .filter(isForwardTarget);
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
  return friendships
    .map((friendship) => getDirectForwardTarget({ friendship, sourceChatId }))
    .filter(isForwardTarget);
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

function isForwardTarget(
  target: ForwardTarget | null,
): target is ForwardTarget {
  return target !== null;
}
