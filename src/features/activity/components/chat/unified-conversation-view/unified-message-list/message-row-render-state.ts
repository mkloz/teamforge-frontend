import type { VirtualizedMessageBlock } from "@/features/activity/hooks/use-virtualized-message-blocks";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";

interface GetMessageSenderBlockRenderStateInput {
  block: VirtualizedMessageBlock;
  highlightedMessageId: string | null;
}

interface GetMessageRowRenderStateInput {
  block: Pick<VirtualizedMessageBlock, "newMessagesSeparatorBeforeId">;
  highlightedMessageId: string | null;
  isSelectionMode: boolean;
  message: UnifiedMessage;
  messageIndex: number;
  selectedMessageIds?: ReadonlySet<string>;
}

interface MessageKindRenderState {
  contentOwnershipClassName: string | undefined;
  isSelectable: boolean;
  messageAlignmentClassName: string;
}

interface MessageSelectionRenderState {
  isSelected: boolean;
  shouldIndentForSelection: boolean;
  shouldShowSelectionToggle: boolean;
}

type MessageBlockPositionInput = Pick<
  VirtualizedMessageBlock,
  "height" | "measuredHeight" | "start"
>;

export function getMessageBlockPositionStyle(block: MessageBlockPositionInput) {
  return {
    minHeight: block.measuredHeight === null ? `${block.height}px` : undefined,
    top: `${block.start}px`,
  };
}

export function getMessageSenderBlockRenderState({
  block,
  highlightedMessageId,
}: GetMessageSenderBlockRenderStateInput) {
  const isSystemBlock = block.senderGroup.items.every(isSystemMessage);
  const sender = block.senderGroup.sender;

  return {
    hasHighlightedMessage: block.senderGroup.items.some(
      (message) => highlightedMessageId === message.id,
    ),
    isSystemBlock,
    sender,
    shouldShowSenderAvatar:
      !isSystemBlock &&
      !block.isOwn &&
      block.senderGroup.senderId !== "system" &&
      Boolean(sender),
  };
}

export function getMessageRowRenderState({
  block,
  highlightedMessageId,
  isSelectionMode,
  message,
  messageIndex,
  selectedMessageIds,
}: GetMessageRowRenderStateInput) {
  const messageKindState = getMessageKindRenderState(message);
  const selectionState = getMessageSelectionRenderState({
    isSelectable: messageKindState.isSelectable,
    isSelectionMode,
    message,
    selectedMessageIds,
  });

  return {
    contentOwnershipClassName: messageKindState.contentOwnershipClassName,
    hasNewMessagesSeparator: block.newMessagesSeparatorBeforeId === message.id,
    isFirstInGroup: messageIndex === 0,
    isHighlighted: highlightedMessageId === message.id,
    isSelectable: messageKindState.isSelectable,
    isSelected: selectionState.isSelected,
    messageAlignmentClassName: messageKindState.messageAlignmentClassName,
    shouldIndentForSelection: selectionState.shouldIndentForSelection,
    shouldShowSelectionToggle: selectionState.shouldShowSelectionToggle,
  };
}

function getMessageKindRenderState(
  message: UnifiedMessage,
): MessageKindRenderState {
  const isSystem = isSystemMessage(message);

  return {
    contentOwnershipClassName: getMessageContentOwnershipClassName(
      message,
      isSystem,
    ),
    isSelectable: !isSystem,
    messageAlignmentClassName: getMessageAlignmentClassName(message, isSystem),
  };
}

function getMessageSelectionRenderState({
  isSelectable,
  isSelectionMode,
  message,
  selectedMessageIds,
}: Pick<
  GetMessageRowRenderStateInput,
  "isSelectionMode" | "message" | "selectedMessageIds"
> &
  Pick<MessageKindRenderState, "isSelectable">): MessageSelectionRenderState {
  const shouldShowSelectionControl = isSelectionMode && isSelectable;

  return {
    isSelected: selectedMessageIds?.has(message.id) ?? false,
    shouldIndentForSelection: shouldShowSelectionControl,
    shouldShowSelectionToggle: shouldShowSelectionControl,
  };
}

function isSystemMessage(message: UnifiedMessage) {
  return message.type === "SYSTEM";
}

function getMessageAlignmentClassName(
  message: UnifiedMessage,
  isSystem: boolean,
) {
  if (isSystem) {
    return "justify-center";
  }

  return message.isOwn ? "justify-end" : "justify-start";
}

function getMessageContentOwnershipClassName(
  message: UnifiedMessage,
  isSystem: boolean,
) {
  if (isSystem) {
    return undefined;
  }

  return message.isOwn ? "ml-auto" : "mr-auto";
}
