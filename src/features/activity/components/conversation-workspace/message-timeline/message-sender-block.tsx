import { getMessageSenderBlockRenderState } from "./message-row-render-state";
import { MessageSenderBlockFrame } from "./message-sender-block/frame";
import {
  getMessageSenderBlockRendererProps,
  getMessageSenderBlockSelectionState,
} from "./message-sender-block/render-state";
import type { MessageSenderBlockProps } from "./message-sender-block/types";

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
