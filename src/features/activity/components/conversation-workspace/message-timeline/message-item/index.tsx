import type { MessageItemProps } from "../message-renderer-props";
import { MessageContextMenu } from "./message-actions-menu";
import {
  MessageItemFrame,
  useMessageItemRenderController,
} from "./use-message-item-render-controller";

/**
 * MessageItem - Orchestrates the rendering of individual chat messages.
 */
export function MessageItem({
  message,
  renderState,
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery = "",
}: MessageItemProps) {
  const {
    isHighlighted = false,
    isSelectable = true,
    isSelected = false,
    isSelectionMode = false,
    showSender,
  } = renderState;
  const controller = useMessageItemRenderController({
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    kind,
    message,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
    showSender,
  });

  return (
    <MessageContextMenu {...controller.contextMenuProps}>
      <MessageItemFrame {...controller.frameProps} />
    </MessageContextMenu>
  );
}
