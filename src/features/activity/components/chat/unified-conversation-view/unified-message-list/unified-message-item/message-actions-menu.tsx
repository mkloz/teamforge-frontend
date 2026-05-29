import { useQuery } from "@tanstack/react-query";
import {
  Bookmark,
  CheckSquare,
  Copy,
  Forward,
  type LucideIcon,
  MoreHorizontal,
  Pencil,
  Pin,
  PinOff,
  Plus,
  Reply,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  lazy,
  memo,
  type ReactNode,
  Suspense,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { ActivityQueryFactory } from "@/features/activity/api/activity-query-factory";
import {
  ACTIVITY_MENU_ICON_CLASS,
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityMenuContentClass,
  getActivityPopupPanelClass,
  getActivityTransparentMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  canDeleteMessage,
  canEditMessage,
  canPinMessage,
  canReactToMessage,
  canReplyToMessage,
  canSaveMessage,
} from "@/features/activity/lib/message-action-capabilities";
import { getMessageClipboardContent } from "@/features/activity/lib/message-clipboard";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { copyTextToClipboard } from "@/shared/lib/browser-capabilities";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import type { ChatApi, FriendshipApi, GroupApi } from "@/shared/schemas";

const LazyChatEmojiPickerPanel = lazy(() =>
  import("../../emoji-picker-panel").then((module) => ({
    default: module.ChatEmojiPickerPanel,
  })),
);

const QUICK_REACTION_EMOJIS = [
  "👍",
  "🔥",
  "❤️",
  "😂",
  "🎉",
  "🤝",
  "👏",
  "✨",
] as const;

const MENU_CONTENT_CLASS = getActivityTransparentMenuContentClass("w-[16rem]");

const MENU_CARD_CLASS = getActivityMenuContentClass("w-full");

const REACTION_DOCK_CLASS = "mb-1.5 w-full text-ink";

const REACTION_DOCK_CLOUD_CLASS = getActivityPopupPanelClass(
  "flex items-center justify-between gap-0.5 rounded-full p-1",
);

const REACTION_DOCK_PICKER_CLASS = getActivityPopupPanelClass(
  "overflow-hidden rounded-lg",
);

const MENU_ACTION_CLASS = cn(ACTIVITY_MENU_ITEM_CLASS, "text-sm");

const MENU_DANGER_CLASS =
  "text-destructive focus:bg-destructive/8 focus:text-destructive data-[highlighted]:bg-destructive/8 data-[highlighted]:text-destructive";

const MENU_SEPARATOR_CLASS = ACTIVITY_MENU_SEPARATOR_CLASS;

const EMOJI_ITEM_CLASS =
  "flex size-8 min-h-8 justify-center rounded-full p-0 text-base leading-none focus:bg-spark-amber/12 data-[highlighted]:bg-spark-amber/12 data-[state=open]:bg-spark-amber/12";

interface MessageActionsMenuProps {
  message: UnifiedMessage;
  onDelete: (message: UnifiedMessage) => Promise<void> | void;
  onPin: (message: UnifiedMessage) => Promise<void> | void;
  onReply: (message: UnifiedMessage) => void;
  onRetry: (message: UnifiedMessage) => Promise<void> | void;
  onStartEdit: (message: UnifiedMessage) => void;
  onForward?: (
    message: UnifiedMessage,
    targetChatId: string,
  ) => Promise<unknown>;
  onToggleReaction: (
    message: UnifiedMessage,
    emoji: string,
  ) => Promise<void> | void;
  reactionPickerDisabled?: boolean;
  selectedReactionEmojis?: readonly string[];
  onUnpin: (message: UnifiedMessage) => Promise<void> | void;
  isSaved?: boolean;
  onToggleSaved?: (
    message: UnifiedMessage,
    isSaved: boolean,
  ) => Promise<unknown>;
  onSelectMessage?: (message: UnifiedMessage) => void;
  onOpenChange?: (open: boolean) => void;
}

interface MessageContextMenuProps extends MessageActionsMenuProps {
  children: ReactNode;
}

interface MessageActionItem {
  icon: LucideIcon;
  id: string;
  label: string;
  onSelect: () => unknown;
  tone?: "danger";
}

type MenuKind = "context" | "dropdown";

export const MessageContextMenu = memo(function MessageContextMenu({
  children,
  message,
  onDelete,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onForward,
  onToggleReaction,
  reactionPickerDisabled = false,
  selectedReactionEmojis = [],
  onUnpin,
  isSaved = false,
  onToggleSaved,
  onSelectMessage,
  onOpenChange,
}: MessageContextMenuProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const menu = useMessageActionMenu({
    message,
    onDelete,
    onPin,
    onReply,
    onRetry,
    onStartEdit,
    onForward,
    onToggleReaction,
    reactionPickerDisabled,
    selectedReactionEmojis,
    onUnpin,
    isSaved,
    onToggleSaved,
    onSelectMessage,
  });
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange?.(nextOpen);
  };
  const handleSelectReaction = (emoji: string) => {
    void Promise.resolve(onToggleReaction(message, emoji)).catch(
      showReactionError,
    );
  };
  const requestClose = () => {
    handleOpenChange(false);
    window.setTimeout(() => {
      const menuElement =
        contentRef.current ?? document.querySelector("[role='menu']");

      menuElement?.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "Escape",
          key: "Escape",
        }),
      );
    }, 50);
  };

  return (
    <>
      <ContextMenu modal={false} onOpenChange={handleOpenChange}>
        <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
        <ContextMenuContent
          ref={contentRef}
          aria-label="Message actions"
          className={MENU_CONTENT_CLASS}
        >
          <MessageMenuSurface
            kind="context"
            menu={menu}
            onSelectReaction={handleSelectReaction}
            onRequestClose={requestClose}
          />
        </ContextMenuContent>
      </ContextMenu>

      <DeleteMessageDialog
        message={message}
        open={menu.deleteDialogOpen}
        onDelete={onDelete}
        onOpenChange={menu.setDeleteDialogOpen}
      />
      {menu.forwardDialogOpen ? (
        <ForwardMessageDialog
          message={message}
          open={menu.forwardDialogOpen}
          onForward={onForward}
          onOpenChange={menu.setForwardDialogOpen}
        />
      ) : null}
    </>
  );
});

export const MessageActionsMenu = memo(function MessageActionsMenu({
  message,
  onDelete,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onForward,
  onToggleReaction,
  reactionPickerDisabled = false,
  selectedReactionEmojis = [],
  onUnpin,
  isSaved = false,
  onToggleSaved,
  onSelectMessage,
  onOpenChange,
}: MessageActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const menu = useMessageActionMenu({
    message,
    onDelete,
    onPin,
    onReply,
    onRetry,
    onStartEdit,
    onForward,
    onToggleReaction,
    reactionPickerDisabled,
    selectedReactionEmojis,
    onUnpin,
    isSaved,
    onToggleSaved,
    onSelectMessage,
  });
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };
  const handleSelectReaction = (emoji: string) => {
    void Promise.resolve(onToggleReaction(message, emoji)).catch(
      showReactionError,
    );
  };

  return (
    <>
      <DropdownMenu modal={false} open={open} onOpenChange={handleOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-8 rounded-md border border-border/55 bg-canvas/92 text-slate-muted shadow-sm backdrop-blur-md transition-all hover:border-forge-teal/25 hover:bg-canvas hover:text-ink"
            aria-label="Message actions"
            onContextMenu={(event) => event.stopPropagation()}
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          aria-label="Message actions"
          align={message.isOwn ? "end" : "start"}
          className={MENU_CONTENT_CLASS}
          sideOffset={6}
        >
          <MessageMenuSurface
            kind="dropdown"
            menu={menu}
            onSelectReaction={handleSelectReaction}
            onRequestClose={() => handleOpenChange(false)}
          />
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteMessageDialog
        message={message}
        open={menu.deleteDialogOpen}
        onDelete={onDelete}
        onOpenChange={menu.setDeleteDialogOpen}
      />
      {menu.forwardDialogOpen ? (
        <ForwardMessageDialog
          message={message}
          open={menu.forwardDialogOpen}
          onForward={onForward}
          onOpenChange={menu.setForwardDialogOpen}
        />
      ) : null}
    </>
  );
});

function useMessageActionMenu({
  message,
  onPin,
  onReply,
  onRetry,
  onStartEdit,
  onForward,
  onToggleSaved,
  onSelectMessage,
  reactionPickerDisabled = false,
  selectedReactionEmojis = [],
  onUnpin,
  isSaved = false,
}: MessageActionsMenuProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const canEdit = canEditMessage(message);
  const canRetry = message.isOwn && message.status === "FAILED";
  const canReact = !reactionPickerDisabled && canReactToMessage(message);
  const canReply = canReplyToMessage(message);
  const canSave = canSaveMessage(message);
  const canSelect = Boolean(onSelectMessage) && message.type !== "SYSTEM";
  const canPin = canPinMessage(message);
  const copyContent = getMessageClipboardContent(message);
  const canCopy = copyContent.length > 0;
  const canDelete = canDeleteMessage(message);

  const primaryActions = useMemo(() => {
    const actions: MessageActionItem[] = [];

    if (canRetry) {
      actions.push({
        icon: RotateCcw,
        id: "retry",
        label: "Retry send",
        onSelect: () => onRetry(message),
      });
    }

    if (canReply) {
      actions.push({
        icon: Reply,
        id: "reply",
        label: "Reply",
        onSelect: () => onReply(message),
      });
    }

    if (canSelect) {
      actions.push({
        icon: CheckSquare,
        id: "select",
        label: "Select",
        onSelect: () => onSelectMessage?.(message),
      });
    }

    if (canCopy) {
      actions.push({
        icon: Copy,
        id: "copy",
        label: message.proposal ? "Copy proposal" : "Copy text",
        onSelect: () =>
          copyMessageContent({
            errorMessage: message.proposal
              ? "We couldn't copy that proposal in this browser."
              : "We couldn't copy that message in this browser.",
            successMessage: message.proposal
              ? "Proposal copied."
              : "Message copied.",
            text: copyContent,
          }),
      });
    }

    if (canEdit) {
      actions.push({
        icon: Pencil,
        id: "edit",
        label: "Edit",
        onSelect: () => onStartEdit(message),
      });
    }

    if (canPin) {
      actions.push({
        icon: message.isPinned ? PinOff : Pin,
        id: "pin",
        label: message.isPinned ? "Unpin" : "Pin",
        onSelect: () => (message.isPinned ? onUnpin(message) : onPin(message)),
      });
    }

    if (canSave && onForward) {
      actions.push({
        icon: Forward,
        id: "forward",
        label: "Forward",
        onSelect: () => setForwardDialogOpen(true),
      });
    }

    if (canSave && onToggleSaved) {
      actions.push({
        icon: Bookmark,
        id: "save",
        label: isSaved ? "Remove bookmark" : "Save message",
        onSelect: () => onToggleSaved(message, isSaved),
      });
    }

    return actions;
  }, [
    canCopy,
    canEdit,
    canPin,
    canRetry,
    canReply,
    canSave,
    canSelect,
    copyContent,
    isSaved,
    message,
    onForward,
    onPin,
    onReply,
    onRetry,
    onSelectMessage,
    onStartEdit,
    onToggleSaved,
    onUnpin,
  ]);

  const dangerActions = useMemo<MessageActionItem[]>(() => {
    if (!canDelete) {
      return [];
    }

    return [
      {
        icon: Trash2,
        id: "delete",
        label: "Delete",
        onSelect: () => setDeleteDialogOpen(true),
        tone: "danger",
      },
    ];
  }, [canDelete]);

  return {
    canReact,
    dangerActions,
    deleteDialogOpen,
    forwardDialogOpen,
    primaryActions,
    selectedReactionEmojis,
    setDeleteDialogOpen,
    setForwardDialogOpen,
  };
}

function MessageMenuSurface({
  kind,
  menu,
  onRequestClose,
  onSelectReaction,
}: {
  kind: MenuKind;
  menu: ReturnType<typeof useMessageActionMenu>;
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}) {
  const Separator =
    kind === "context" ? ContextMenuSeparator : DropdownMenuSeparator;

  return (
    <>
      <MessageReactionPicker
        kind={kind}
        canReact={menu.canReact}
        selectedReactionEmojis={menu.selectedReactionEmojis}
        onRequestClose={onRequestClose}
        onSelectReaction={onSelectReaction}
      />
      <div className={MENU_CARD_CLASS}>
        <MessageActionList kind={kind} actions={menu.primaryActions} />
        {menu.dangerActions.length > 0 && (
          <>
            <Separator className={MENU_SEPARATOR_CLASS} />
            <MessageActionList kind={kind} actions={menu.dangerActions} />
          </>
        )}
      </div>
    </>
  );
}

interface MessageReactionPickerProps {
  canReact: boolean;
  kind: MenuKind;
  selectedReactionEmojis: readonly string[];
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}

function MessageReactionPicker({
  canReact,
  kind,
  selectedReactionEmojis,
  onRequestClose,
  onSelectReaction,
}: MessageReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!canReact) {
    return null;
  }

  const Item = kind === "context" ? ContextMenuItem : DropdownMenuItem;
  const selectedReactionEmojiSet = new Set(selectedReactionEmojis);

  return (
    <div className={REACTION_DOCK_CLASS}>
      {expanded ? (
        <div className={REACTION_DOCK_PICKER_CLASS}>
          <Suspense fallback={<CompactEmojiPickerSkeleton />}>
            <LazyChatEmojiPickerPanel
              compact
              selectedEmojis={selectedReactionEmojis}
              onSelect={(emoji) => {
                onSelectReaction(emoji);
                onRequestClose();
              }}
            />
          </Suspense>
        </div>
      ) : (
        <div className={REACTION_DOCK_CLOUD_CLASS}>
          {QUICK_REACTION_EMOJIS.slice(0, 6).map((emoji) => {
            const isSelected = selectedReactionEmojiSet.has(emoji);

            return (
              <Item
                key={emoji}
                aria-label={`${
                  isSelected ? "Remove reaction" : "React with"
                } ${emoji}`}
                className={getEmojiItemClass(isSelected)}
                onSelect={() => onSelectReaction(emoji)}
                title={emoji}
              >
                <span aria-hidden="true">{emoji}</span>
              </Item>
            );
          })}
          <Item
            aria-label="More reactions"
            className="flex size-8 min-h-8 justify-center rounded-full border border-spark-amber/35 bg-spark-amber/12 p-0 text-base text-spark-amber leading-none shadow-[0_0_0_2px_color-mix(in_srgb,var(--color-spark-amber)_14%,transparent)] transition hover:bg-spark-amber/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark-amber/35"
            onMouseDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onPointerDown={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setExpanded(true);
            }}
            onSelect={(event) => {
              event.preventDefault();
              setExpanded(true);
            }}
            title="More reactions"
          >
            <Plus className="size-4" strokeWidth={2.25} />
          </Item>
        </div>
      )}
    </div>
  );
}

function CompactEmojiPickerSkeleton() {
  return (
    <div className="grid grid-cols-8 gap-0.5 p-1.5" aria-hidden="true">
      {QUICK_REACTION_EMOJIS.map((emoji) => (
        <div key={emoji} className="size-7 rounded-md bg-muted/50" />
      ))}
    </div>
  );
}

function getEmojiItemClass(isSelected: boolean) {
  return cn(
    EMOJI_ITEM_CLASS,
    isSelected && "bg-spark-amber/18 shadow-sm ring-1 ring-spark-amber/45",
  );
}

function MessageActionList({
  actions,
  kind,
}: {
  actions: MessageActionItem[];
  kind: MenuKind;
}) {
  const Item = kind === "context" ? ContextMenuItem : DropdownMenuItem;

  return (
    <>
      {actions.map((action) => (
        <Item
          key={action.id}
          className={cn(
            MENU_ACTION_CLASS,
            action.tone === "danger" && MENU_DANGER_CLASS,
          )}
          onSelect={() => {
            void Promise.resolve(action.onSelect()).catch(
              showMessageActionError,
            );
          }}
        >
          <MessageActionRow action={action} />
        </Item>
      ))}
    </>
  );
}

function MessageActionRow({ action }: { action: MessageActionItem }) {
  const Icon = action.icon;

  return (
    <>
      <span
        className={cn(
          ACTIVITY_MENU_ICON_CLASS,
          action.tone === "danger" &&
            "border-destructive/20 bg-destructive/8 text-destructive",
        )}
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate font-bold text-xs">
        {action.label}
      </span>
    </>
  );
}

async function copyMessageContent({
  errorMessage,
  successMessage,
  text,
}: {
  errorMessage: string;
  successMessage: string;
  text: string;
}) {
  if (!text) {
    return;
  }

  if (!(await copyTextToClipboard(text))) {
    toast.error(errorMessage);
    return;
  }

  toast.success(successMessage);
}

function showReactionError(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "We couldn't update that reaction.",
  });
}

function showMessageActionError(error: unknown) {
  showAppErrorToast(error, {
    fallbackMessage: "That message action didn't go through.",
  });
}

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
}

export function ForwardMessageDialog({
  message,
  messages,
  onForward,
  onForwardComplete,
  onOpenChange,
  open,
}: ForwardMessageDialogProps) {
  const [pendingTargetId, setPendingTargetId] = useState<string | null>(null);
  const messagesToForward = messages ?? (message ? [message] : []);
  const sourceChatId = messagesToForward[0]?.chatId ?? "";
  const groupsQuery = useQuery(ActivityQueryFactory.groups());
  const chatsQuery = useQuery(ActivityQueryFactory.chats());
  const friendshipsQuery = useQuery(ActivityQueryFactory.friendships());
  const targets = buildForwardTargets({
    chats: chatsQuery.data ?? [],
    friendships: friendshipsQuery.data ?? [],
    groups: groupsQuery.data ?? [],
    sourceChatId,
  });
  const isLoading =
    groupsQuery.isPending || chatsQuery.isPending || friendshipsQuery.isPending;
  const hasLoadError =
    groupsQuery.isError || chatsQuery.isError || friendshipsQuery.isError;

  async function handleForward(target: ForwardTarget) {
    if (!onForward || messagesToForward.length === 0) {
      return;
    }

    setPendingTargetId(target.chatId);

    try {
      await messagesToForward.reduce<Promise<void>>(
        async (previousForward, item) => {
          await previousForward;

          const result = await onForward(item, target.chatId);

          if (!result) {
            throw new Error("Forward target is no longer available.");
          }
        },
        Promise.resolve(),
      );

      toast.success(
        messagesToForward.length === 1
          ? `Forwarded to ${target.title}.`
          : `Forwarded ${messagesToForward.length} messages to ${target.title}.`,
      );
      onOpenChange(false);
      onForwardComplete?.();
    } catch (error) {
      showAppErrorToast(error, {
        fallbackMessage: "We couldn't forward that message.",
      });
    } finally {
      setPendingTargetId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={getActivityPopupPanelClass(
          "flex max-h-[min(30rem,calc(100dvh-2rem))] w-[calc(100%-2rem)] max-w-sm flex-col gap-0 overflow-hidden rounded-lg bg-canvas p-0 [&>button]:shadow-none",
        )}
      >
        <DialogHeader className="border-border/55 border-b px-4 py-3 pr-11 text-left">
          <DialogTitle className="font-bold text-base">
            {messagesToForward.length > 1
              ? "Forward messages"
              : "Forward message"}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            Pick where{" "}
            {messagesToForward.length > 1 ? "these messages" : "this message"}{" "}
            should go.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto p-1.5">
          {isLoading ? (
            <ForwardDialogState
              description="This usually takes a moment."
              label="Finding conversations..."
              role="status"
            />
          ) : hasLoadError ? (
            <ForwardDialogState
              description="Close this and try again in a moment."
              label="We couldn't load your conversations."
              role="alert"
            />
          ) : targets.length === 0 ? (
            <ForwardDialogState
              description="Start another chat before forwarding this message."
              label="There is nowhere else to forward this yet."
            />
          ) : (
            targets.map((target) => (
              <button
                key={target.chatId}
                type="button"
                aria-busy={pendingTargetId === target.chatId}
                className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left transition hover:bg-forge-teal/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal/25 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pendingTargetId !== null}
                onClick={() => {
                  void handleForward(target);
                }}
              >
                {target.avatar ? (
                  <img
                    alt=""
                    className="size-9 rounded-full object-cover"
                    src={target.avatar}
                  />
                ) : (
                  <span className="flex size-9 items-center justify-center rounded-full bg-forge-teal/12 font-bold text-forge-teal text-xs">
                    {getForwardTargetInitials(target.title)}
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold text-sm">
                    {target.title}
                  </span>
                  <span className="block text-muted-foreground text-xs">
                    {target.kind === "group" ? "Group" : "Direct chat"}
                  </span>
                </span>
                {pendingTargetId === target.chatId && (
                  <span
                    aria-live="polite"
                    className="text-muted-foreground text-xs"
                  >
                    Forwarding...
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ForwardDialogState({
  description,
  label,
  role,
}: {
  description: string;
  label: string;
  role?: "alert" | "status";
}) {
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

interface ForwardTarget {
  avatar: string | null;
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
  const chatsByGroupId = new Map<string, ChatApi>(
    chats.flatMap(
      (chat): Array<[string, ChatApi]> =>
        chat.groupId ? [[chat.groupId, chat]] : [],
    ),
  );
  const groupTargets = groups.flatMap<ForwardTarget>((group) => {
    const chat = chatsByGroupId.get(group.id);

    if (!chat || chat.id === sourceChatId) {
      return [];
    }

    return [
      {
        avatar: group.avatar,
        chatId: chat.id,
        kind: "group",
        title: group.name,
      },
    ];
  });
  const directTargets = friendships.flatMap<ForwardTarget>((friendship) => {
    const chatId = friendship.privateChat?.id;

    if (!chatId || chatId === sourceChatId) {
      return [];
    }

    return [
      {
        avatar: friendship.counterpart.avatar,
        chatId,
        kind: "dm",
        title: friendship.counterpart.name,
      },
    ];
  });

  return [...groupTargets, ...directTargets].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}

function getForwardTargetInitials(title: string) {
  return title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

interface DeleteMessageDialogProps {
  message: UnifiedMessage;
  onDelete: (message: UnifiedMessage) => Promise<void> | void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

function DeleteMessageDialog({
  message,
  onDelete,
  onOpenChange,
  open,
}: DeleteMessageDialogProps) {
  return (
    <ActionDialog
      cancelLabel="Keep message"
      confirmLabel="Delete message"
      description="This removes the message from the conversation. Replies and pinned context may feel different for everyone."
      details={
        message.attachments?.length
          ? ["Attached files will no longer appear with this message."]
          : undefined
      }
      onConfirm={() => onDelete(message)}
      open={open}
      onOpenChange={onOpenChange}
      title="Delete this message?"
      tone="danger"
    />
  );
}
