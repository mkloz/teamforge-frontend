import { memo } from "react";
import type {
  MessageRendererProps,
  SharedMessageRendererProps,
} from "./message-renderer-props";
import { ProposalMessage } from "./proposal-message";
import { SystemMessage } from "./system-message";
import { UnifiedMessageItem } from "./unified-message-item";

export const MessageRenderer = memo(
  ({
    message,
    showSender,
    isHighlighted,
    isSelectable = true,
    isSelected = false,
    isSelectionMode = false,
    kind,
    onActivateReplyTarget,
    onStartSelection,
    onToggleSelected,
    searchQuery,
  }: MessageRendererProps) => {
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
    return (
      <UnifiedMessageItem {...sharedMessageProps} searchQuery={searchQuery} />
    );
  },
);
