import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { ProposalMessage } from "../proposal-message";
import { SystemMessage } from "../system-message";
import { UnifiedMessageItem } from "../unified-message-item";

interface MessageRendererProps {
  message: UnifiedMessage;
  showSender: boolean;
  kind: "dm" | "group";
}

export const MessageRenderer = memo(
  ({ message, showSender, kind }: MessageRendererProps) => {
    if (message.type === "SYSTEM") return <SystemMessage message={message} />;
    if (message.type === "PLAN_UPDATE" && message.proposal) {
      return (
        <ProposalMessage
          message={message}
          showSender={showSender}
          kind={kind}
        />
      );
    }
    return (
      <UnifiedMessageItem
        message={message}
        showSender={showSender}
        kind={kind}
      />
    );
  },
);
