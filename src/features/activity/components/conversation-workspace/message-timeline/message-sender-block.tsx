import { Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type {
  ActivityParticipant,
  UnifiedMessage,
} from "@/features/activity/lib/activity-contract";
import { Avatar } from "@/shared/components/common/avatar";
import { cn } from "@/shared/lib/utils";
import { buildProfileNavigation } from "@/shared/navigation/profile-navigation";
import { DateSeparator } from "./date-separator";
import { MessageRenderer } from "./message-renderer";
import {
  getMessageBlockPositionStyle,
  getMessageRowRenderState,
  getMessageSenderBlockRenderState,
} from "./message-row-render-state";
import { NewMessagesSeparator } from "./new-messages-separator";
import {
  getParticipantDisplayName,
  getParticipantInitials,
} from "./participant-display";

interface MessageSenderBlockProps {
  block: VirtualizedMessageBlock;
  kind: "dm" | "group";
  highlightedMessageId: string | null;
  isSelectionMode?: boolean;
  selectedMessageIds?: ReadonlySet<string>;
  blockRef: (node: HTMLDivElement | null) => void;
  getMessageRef: (messageId: string) => (node: HTMLDivElement | null) => void;
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  onShowParticipantProfile?: (participant: ActivityParticipant) => void;
  searchQuery: string;
}

const spacingAfterClassName = {
  compact: "mb-1",
  normal: "mb-2.5",
  related: "mb-1.5",
  "system-boundary": "mb-4",
} satisfies Record<VirtualizedMessageBlock["spacingAfter"], string>;
const senderAvatarTriggerClassName =
  "inline-flex size-8 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

type MessageRowRenderState = ReturnType<typeof getMessageRowRenderState>;
type MessageSenderBlockRenderState = ReturnType<
  typeof getMessageSenderBlockRenderState
>;
type MessageSenderBlockKind = MessageSenderBlockProps["kind"];
type MessageRefGetter = MessageSenderBlockProps["getMessageRef"];

interface MessageSenderBlockFrameProps {
  block: VirtualizedMessageBlock;
  blockRef: MessageSenderBlockProps["blockRef"];
  getMessageRef: MessageRefGetter;
  highlightedMessageId: string | null;
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  rendererProps: MessageSenderBlockRendererProps;
  renderState: MessageSenderBlockRenderState;
  selectionState: MessageSenderBlockSelectionState;
}

interface MessageSenderBlockRendererProps {
  kind: MessageSenderBlockKind;
  onActivateReplyTarget: MessageSenderBlockProps["onActivateReplyTarget"];
  onStartSelection: MessageSenderBlockProps["onStartSelection"];
  onToggleSelected: MessageSenderBlockProps["onToggleSelected"];
  searchQuery: string;
}

interface MessageSenderBlockSelectionState {
  isSelectionMode: boolean;
  selectedMessageIds: MessageSenderBlockProps["selectedMessageIds"];
}

interface SenderAvatarSlotProps {
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  sender: ActivityParticipant | null | undefined;
  shouldShowSenderAvatar: boolean;
}

interface SenderProfileTriggerProps {
  onShowParticipantProfile: MessageSenderBlockProps["onShowParticipantProfile"];
  sender: ActivityParticipant;
}

interface MessageSenderBlockRowsProps {
  block: VirtualizedMessageBlock;
  getMessageRef: MessageRefGetter;
  highlightedMessageId: string | null;
  isSystemBlock: boolean;
  rendererProps: MessageSenderBlockRendererProps;
  selectionState: MessageSenderBlockSelectionState;
}

interface MessageSenderBlockRowProps extends MessageSenderBlockRowsProps {
  message: UnifiedMessage;
  messageIndex: number;
}

interface MessageRowSeparatorProps {
  block: VirtualizedMessageBlock;
  isSystemBlock: boolean;
  rowState: Pick<MessageRowRenderState, "hasNewMessagesSeparator">;
}

interface MessageRowContentProps {
  message: UnifiedMessage;
  rendererProps: MessageSenderBlockRendererProps;
  rowState: MessageRowRenderState;
  selectionState: Pick<MessageSenderBlockSelectionState, "isSelectionMode">;
}

interface MessageSelectionToggleProps {
  isSelected: boolean;
  onToggle: () => void;
}

interface MessageBlockDateSeparatorProps {
  block: Pick<VirtualizedMessageBlock, "date" | "showDateSeparator">;
}

interface SenderGroupClassNameInput {
  block: Pick<VirtualizedMessageBlock, "isOwn" | "spacingAfter">;
  isSystemBlock: boolean;
}

type MessageRowsClassNameInput = Pick<
  MessageSenderBlockRenderState,
  "hasHighlightedMessage" | "isSystemBlock"
>;

export function MessageSenderBlock({
  block,
  kind,
  highlightedMessageId,
  isSelectionMode = false,
  selectedMessageIds,
  blockRef,
  getMessageRef,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  onShowParticipantProfile,
  searchQuery,
}: MessageSenderBlockProps) {
  const renderState = getMessageSenderBlockRenderState({
    block,
    highlightedMessageId,
  });
  const rendererProps = getMessageSenderBlockRendererProps({
    kind,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
  });
  const selectionState = getMessageSenderBlockSelectionState({
    isSelectionMode,
    selectedMessageIds,
  });

  return (
    <MessageSenderBlockFrame
      block={block}
      blockRef={blockRef}
      getMessageRef={getMessageRef}
      highlightedMessageId={highlightedMessageId}
      onShowParticipantProfile={onShowParticipantProfile}
      rendererProps={rendererProps}
      renderState={renderState}
      selectionState={selectionState}
    />
  );
}

function getMessageSenderBlockRendererProps({
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery,
}: Pick<
  MessageSenderBlockProps,
  | "kind"
  | "onActivateReplyTarget"
  | "onStartSelection"
  | "onToggleSelected"
  | "searchQuery"
>): MessageSenderBlockRendererProps {
  return {
    kind,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
  };
}

function getMessageSenderBlockSelectionState({
  isSelectionMode,
  selectedMessageIds,
}: Pick<Required<MessageSenderBlockProps>, "isSelectionMode"> &
  Pick<MessageSenderBlockProps, "selectedMessageIds">) {
  return {
    isSelectionMode,
    selectedMessageIds,
  } satisfies MessageSenderBlockSelectionState;
}

function MessageSenderBlockFrame({
  block,
  blockRef,
  getMessageRef,
  highlightedMessageId,
  onShowParticipantProfile,
  rendererProps,
  renderState,
  selectionState,
}: MessageSenderBlockFrameProps) {
  const {
    hasHighlightedMessage,
    isSystemBlock,
    sender,
    shouldShowSenderAvatar,
  } = renderState;

  return (
    <div
      ref={blockRef}
      data-message-block-key={block.key}
      className="absolute right-0 left-0 flex min-w-0 max-w-full flex-col gap-0"
      style={getMessageBlockPositionStyle(block)}
    >
      <MessageBlockDateSeparator block={block} />

      <div
        className={getSenderGroupClassName({
          block,
          isSystemBlock,
        })}
      >
        <SenderAvatarSlot
          onShowParticipantProfile={onShowParticipantProfile}
          sender={sender}
          shouldShowSenderAvatar={shouldShowSenderAvatar}
        />

        <div
          className={getMessageRowsClassName({
            hasHighlightedMessage,
            isSystemBlock,
          })}
        >
          <MessageSenderBlockRows
            block={block}
            getMessageRef={getMessageRef}
            highlightedMessageId={highlightedMessageId}
            isSystemBlock={isSystemBlock}
            rendererProps={rendererProps}
            selectionState={selectionState}
          />
        </div>
      </div>
    </div>
  );
}

function MessageBlockDateSeparator({ block }: MessageBlockDateSeparatorProps) {
  if (!block.showDateSeparator) {
    return null;
  }

  return <DateSeparator date={block.date} />;
}

function getSenderGroupClassName({
  block,
  isSystemBlock,
}: SenderGroupClassNameInput) {
  return cn(
    "group/sender relative flex w-full min-w-0 max-w-full items-stretch",
    isSystemBlock ? "gap-0" : "gap-3",
    spacingAfterClassName[block.spacingAfter],
    block.isOwn ? "flex-row-reverse" : "flex-row",
  );
}

function getMessageRowsClassName({
  hasHighlightedMessage,
  isSystemBlock,
}: MessageRowsClassNameInput) {
  return cn(
    "flex min-w-0 flex-1 flex-col gap-1.5",
    hasHighlightedMessage ? "overflow-visible" : "overflow-x-hidden",
    isSystemBlock ? "items-center" : "items-stretch",
  );
}

function SenderAvatarSlot({
  onShowParticipantProfile,
  sender,
  shouldShowSenderAvatar,
}: SenderAvatarSlotProps) {
  if (!shouldShowSenderAvatar || !sender) {
    return null;
  }

  return (
    <div className="flex w-8 shrink-0 flex-col justify-end">
      <div className="sticky bottom-2 flex flex-col items-center">
        <SenderProfileTrigger
          onShowParticipantProfile={onShowParticipantProfile}
          sender={sender}
        />
      </div>
    </div>
  );
}

function SenderProfileTrigger({
  onShowParticipantProfile,
  sender,
}: SenderProfileTriggerProps) {
  const displayName = getParticipantDisplayName(sender);

  if (onShowParticipantProfile) {
    return (
      <button
        type="button"
        className={senderAvatarTriggerClassName}
        aria-label={`Open ${displayName} details`}
        onClick={() => onShowParticipantProfile(sender)}
      >
        <SenderAvatar sender={sender} />
      </button>
    );
  }

  return (
    <Link
      {...buildProfileNavigation(sender.id)}
      className={senderAvatarTriggerClassName}
      aria-label={`View ${displayName}'s profile`}
    >
      <SenderAvatar sender={sender} />
    </Link>
  );
}

function MessageSenderBlockRows({
  block,
  getMessageRef,
  highlightedMessageId,
  isSystemBlock,
  rendererProps,
  selectionState,
}: MessageSenderBlockRowsProps) {
  return block.senderGroup.items.map((message, messageIndex) => (
    <MessageSenderBlockRow
      block={block}
      getMessageRef={getMessageRef}
      highlightedMessageId={highlightedMessageId}
      isSystemBlock={isSystemBlock}
      key={message.id}
      message={message}
      messageIndex={messageIndex}
      rendererProps={rendererProps}
      selectionState={selectionState}
    />
  ));
}

function MessageSenderBlockRow({
  block,
  getMessageRef,
  highlightedMessageId,
  isSystemBlock,
  message,
  messageIndex,
  rendererProps,
  selectionState,
}: MessageSenderBlockRowProps) {
  const rowState = getMessageRowRenderState({
    block,
    highlightedMessageId,
    isSelectionMode: selectionState.isSelectionMode,
    message,
    messageIndex,
    selectedMessageIds: selectionState.selectedMessageIds,
  });

  return (
    <div ref={getMessageRef(message.id)} className="flex min-w-0 flex-col">
      <MessageRowSeparator
        block={block}
        isSystemBlock={isSystemBlock}
        rowState={rowState}
      />
      <MessageRowContent
        message={message}
        rendererProps={rendererProps}
        rowState={rowState}
        selectionState={selectionState}
      />
    </div>
  );
}

function MessageRowSeparator({
  block,
  isSystemBlock,
  rowState,
}: MessageRowSeparatorProps) {
  if (!rowState.hasNewMessagesSeparator) {
    return null;
  }

  return (
    <div className={cn(!isSystemBlock && !block.isOwn && "-ml-11")}>
      <NewMessagesSeparator />
    </div>
  );
}

function MessageRowContent({
  message,
  rendererProps,
  rowState,
  selectionState,
}: MessageRowContentProps) {
  return (
    <div
      className={cn(
        "relative flex w-full min-w-0 max-w-full",
        rowState.shouldIndentForSelection && "pl-9",
        rowState.messageAlignmentClassName,
      )}
    >
      <div
        className={cn(
          "w-full min-w-0 max-w-full",
          rowState.contentOwnershipClassName,
        )}
      >
        <MessageRenderer
          message={message}
          renderState={{
            isHighlighted: rowState.isHighlighted,
            isSelectable: rowState.isSelectable,
            isSelected: rowState.isSelected,
            isSelectionMode: selectionState.isSelectionMode,
            showSender: rowState.isFirstInGroup,
          }}
          kind={rendererProps.kind}
          onActivateReplyTarget={rendererProps.onActivateReplyTarget}
          onStartSelection={rendererProps.onStartSelection}
          onToggleSelected={rendererProps.onToggleSelected}
          searchQuery={rendererProps.searchQuery}
        />
      </div>
      {rowState.shouldShowSelectionToggle ? (
        <MessageSelectionToggle
          isSelected={rowState.isSelected}
          onToggle={() => rendererProps.onToggleSelected?.(message)}
        />
      ) : null}
    </div>
  );
}

function MessageSelectionToggle({
  isSelected,
  onToggle,
}: MessageSelectionToggleProps) {
  return (
    <button
      type="button"
      aria-label={isSelected ? "Unselect message" : "Select message"}
      aria-pressed={isSelected}
      className={cn(
        "absolute top-1/2 left-0 z-20 flex size-6 -translate-y-1/2 items-center justify-center rounded-full border text-primary transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25",
        isSelected
          ? "border-primary bg-primary text-primary-foreground shadow-sm"
          : "border-border/70 bg-canvas/90 text-slate-muted backdrop-blur-md hover:border-primary/45 hover:text-primary",
      )}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
    >
      {isSelected ? <Check className="size-3.5" strokeWidth={3} /> : null}
    </button>
  );
}

function SenderAvatar({ sender }: { sender: ActivityParticipant }) {
  return (
    <Avatar
      src={sender.avatar}
      name={getParticipantDisplayName(sender)}
      fallback={getParticipantInitials(sender)}
      className="size-8 bg-muted text-muted-foreground text-xs shadow-sm ring-1 ring-border"
      fallbackClassName="text-muted-foreground"
    />
  );
}
