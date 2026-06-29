import { MessageItem } from "./message-item";
import type {
  MessageItemProps,
  MessageRendererProps,
  SharedMessageRendererProps,
} from "./message-renderer-props";
import { ProposalMessage } from "./proposal-message";
import { SystemMessage } from "./system-message";

export function MessageRenderer({
  message,
  renderState,
  kind,
  onActivateReplyTarget,
  onStartSelection,
  onToggleSelected,
  searchQuery,
}: MessageRendererProps) {
  const {
    isHighlighted = false,
    isSelectable = true,
    isSelected = false,
    isSelectionMode = false,
    showSender,
  } = renderState;

  if (message.type === "SYSTEM") {
    return <SystemMessage message={message} isHighlighted={isHighlighted} />;
  }

  const sharedMessageProps = {
    message,
    showSender,
    isHighlighted,
    isSelectable,
    isSelected,
    isSelectionMode,
    kind,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
  } satisfies SharedMessageRendererProps;

  if (message.type === "PLAN_UPDATE" && message.proposal) {
    return <ProposalMessage {...sharedMessageProps} />;
  }

  const messageItemProps = {
    kind,
    message,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    renderState: {
      ...renderState,
      showSender,
    },
  } satisfies Omit<MessageItemProps, "searchQuery">;

  return <MessageItem {...messageItemProps} searchQuery={searchQuery} />;
}
