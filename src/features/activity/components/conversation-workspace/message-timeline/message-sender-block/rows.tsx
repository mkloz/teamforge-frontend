import { cn } from "@/shared/lib/utils";
import { MessageRenderer } from "../message-renderer";
import { getMessageRowRenderState } from "../message-row-render-state";
import { MessageSelectionToggle } from "./selection-toggle";
import { MessageRowSeparator } from "./separators";
import type {
  MessageRowContentProps,
  MessageSenderBlockRowProps,
  MessageSenderBlockRowsProps,
} from "./types";

export function MessageSenderBlockRows({
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
