import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ProposalMessage } from "./proposal-message";
import { SystemMessage } from "./system-message";
import { UnifiedMessageItem } from "./unified-message-item";

interface MessageRendererProps {
  message: UnifiedMessage;
  showSender: boolean;
  isHighlighted: boolean;
  kind: "dm" | "group";
  onActivateReplyTarget: (messageId: string) => void;
  searchQuery: string;
}

export const MessageRenderer = memo(
  ({
    message,
    showSender,
    isHighlighted,
    kind,
    onActivateReplyTarget,
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
          kind={kind}
          onActivateReplyTarget={onActivateReplyTarget}
        />
      );
    }
    return (
      <UnifiedMessageItem
        message={message}
        showSender={showSender}
        isHighlighted={isHighlighted}
        kind={kind}
        onActivateReplyTarget={onActivateReplyTarget}
        searchQuery={searchQuery}
      />
    );
  },
);
