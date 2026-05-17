import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ProposalMessage } from "./proposal-message";
import { SystemMessage } from "./system-message";
import { UnifiedMessageItem } from "./unified-message-item";

interface MessageRendererProps {
  message: UnifiedMessage;
  showSender: boolean;
  isHighlighted: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  isSelectionMode?: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  onStartSelection?: (message: UnifiedMessage) => void;
  onToggleSelected?: (message: UnifiedMessage) => void;
  searchQuery: string;
}

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
    if (message.type === "PLAN_UPDATE" && message.proposal) {
      return (
        <ProposalMessage
          message={message}
          showSender={showSender}
          isHighlighted={isHighlighted}
          isSelectable={isSelectable}
          isSelected={isSelected}
          isSelectionMode={isSelectionMode}
          kind={kind}
          onActivateReplyTarget={onActivateReplyTarget}
          onStartSelection={onStartSelection}
          onToggleSelected={onToggleSelected}
        />
      );
    }
    return (
      <UnifiedMessageItem
        message={message}
        showSender={showSender}
        isHighlighted={isHighlighted}
        isSelectable={isSelectable}
        isSelected={isSelected}
        isSelectionMode={isSelectionMode}
        kind={kind}
        onActivateReplyTarget={onActivateReplyTarget}
        onStartSelection={onStartSelection}
        onToggleSelected={onToggleSelected}
        searchQuery={searchQuery}
      />
    );
  },
);
