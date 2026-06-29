import { Plus } from "lucide-react";
import { lazy, type ReactNode, Suspense, useRef, useState } from "react";
import { ActivityMenuIcon } from "@/features/activity/components/activity-menu-icon";
import {
  ACTIVITY_MENU_ITEM_CLASS,
  ACTIVITY_MENU_SEPARATOR_CLASS,
  getActivityMenuContentClass,
  getActivityPopupPanelClass,
  getActivityTransparentMenuContentClass,
} from "@/features/activity/components/activity-popup-styles";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ActionDialog } from "@/shared/components/ui/action-dialog";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/components/ui/context-menu";
import { showAppErrorToast } from "@/shared/lib/error-toast";
import { cn } from "@/shared/lib/utils";
import { ForwardMessageDialog } from "./forward-message-dialog";
import {
  getMessageActionMenuState,
  type MessageActionItem,
} from "./message-action-menu-state";

export { ForwardMessageDialog };

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
  "flex size-8 min-h-8 justify-center rounded-full p-0 text-base leading-none focus:bg-accent/12 data-[highlighted]:bg-accent/12 data-[state=open]:bg-accent/12";

interface MessageContextMenuBaseProps {
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
  isOnline?: boolean;
}

interface MessageContextMenuProps extends MessageContextMenuBaseProps {
  children: ReactNode;
}

type MessageActionMenuInput = Pick<
  MessageContextMenuBaseProps,
  | "isSaved"
  | "message"
  | "onForward"
  | "onPin"
  | "onReply"
  | "onRetry"
  | "onSelectMessage"
  | "onStartEdit"
  | "onToggleSaved"
  | "onUnpin"
  | "reactionPickerDisabled"
  | "selectedReactionEmojis"
>;

const EMPTY_SELECTED_REACTION_EMOJIS: readonly string[] = [];

export function MessageContextMenu({
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
  selectedReactionEmojis = EMPTY_SELECTED_REACTION_EMOJIS,
  onUnpin,
  isSaved = false,
  onToggleSaved,
  onSelectMessage,
  onOpenChange,
  isOnline = true,
}: MessageContextMenuProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const menu = useMessageActionMenu({
    message,
    onPin,
    onReply,
    onRetry,
    onStartEdit,
    onForward,
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
          isOnline={isOnline}
          onForward={onForward}
          onOpenChange={menu.setForwardDialogOpen}
        />
      ) : null}
    </>
  );
}

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
}: MessageActionMenuInput) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forwardDialogOpen, setForwardDialogOpen] = useState(false);
  const actionMenuState = getMessageActionMenuState({
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
    reactionPickerDisabled,
    setDeleteDialogOpen,
    setForwardDialogOpen,
  });

  return {
    ...actionMenuState,
    deleteDialogOpen,
    forwardDialogOpen,
    selectedReactionEmojis,
    setDeleteDialogOpen,
    setForwardDialogOpen,
  };
}

function MessageMenuSurface({
  menu,
  onRequestClose,
  onSelectReaction,
}: {
  menu: ReturnType<typeof useMessageActionMenu>;
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}) {
  return (
    <>
      <MessageReactionPicker
        canReact={menu.canReact}
        selectedReactionEmojis={menu.selectedReactionEmojis}
        onRequestClose={onRequestClose}
        onSelectReaction={onSelectReaction}
      />
      <div className={MENU_CARD_CLASS}>
        <MessageActionList actions={menu.primaryActions} />
        {menu.dangerActions.length > 0 && (
          <>
            <ContextMenuSeparator className={MENU_SEPARATOR_CLASS} />
            <MessageActionList actions={menu.dangerActions} />
          </>
        )}
      </div>
    </>
  );
}

interface MessageReactionPickerProps {
  canReact: boolean;
  selectedReactionEmojis: readonly string[];
  onRequestClose: () => void;
  onSelectReaction: (emoji: string) => void;
}

function MessageReactionPicker({
  canReact,
  selectedReactionEmojis,
  onRequestClose,
  onSelectReaction,
}: MessageReactionPickerProps) {
  const [expanded, setExpanded] = useState(false);

  if (!canReact) {
    return null;
  }

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
              <ContextMenuItem
                key={emoji}
                aria-label={`${
                  isSelected ? "Remove reaction" : "React with"
                } ${emoji}`}
                className={getEmojiItemClass(isSelected)}
                onSelect={() => onSelectReaction(emoji)}
                title={emoji}
              >
                <span aria-hidden="true">{emoji}</span>
              </ContextMenuItem>
            );
          })}
          <ContextMenuItem
            aria-label="More reactions"
            className="flex size-8 min-h-8 justify-center rounded-full border border-accent/35 bg-accent/12 p-0 text-accent text-base leading-none shadow-[0_0_0_2px_color-mix(in_srgb,var(--accent)_14%,transparent)] transition hover:bg-accent/18 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/35"
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
          </ContextMenuItem>
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
    isSelected && "bg-accent/18 shadow-sm ring-1 ring-accent/45",
  );
}

function MessageActionList({ actions }: { actions: MessageActionItem[] }) {
  return (
    <>
      {actions.map((action) => (
        <ContextMenuItem
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
        </ContextMenuItem>
      ))}
    </>
  );
}

function MessageActionRow({ action }: { action: MessageActionItem }) {
  const Icon = action.icon;

  return (
    <>
      <ActivityMenuIcon tone={action.tone === "danger" ? "danger" : "default"}>
        <Icon className="size-4" />
      </ActivityMenuIcon>
      <span className="min-w-0 flex-1 truncate font-bold text-xs">
        {action.label}
      </span>
    </>
  );
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
