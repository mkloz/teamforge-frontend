import { memo } from "react";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { SystemMessage } from "../system-message";
import { ProposalMessage } from "../proposal-message";
import { UnifiedMessageItem } from "../unified-message-item";

interface MessageRendererProps {
  message: UnifiedMessage;
  showAvatar: boolean;
  showSender: boolean;
  kind: "dm" | "group";
  onAvatarClick?: (
    senderId: string,
    senderName: string,
    senderAvatar: string,
  ) => void;
}

export const MessageRenderer = memo(
  ({
    message,
    showAvatar,
    showSender,
    kind,
    onAvatarClick,
  }: MessageRendererProps) => {
    if (message.type === "SYSTEM") return <SystemMessage message={message} />;
    if (message.type === "PLAN_UPDATE") {
      return (
        <ProposalMessage
          message={message}
          showAvatar={showAvatar}
          showSender={showSender}
        />
      );
    }
    return (
      <UnifiedMessageItem
        message={message}
        showSender={showSender}
        showAvatar={showAvatar}
        kind={kind}
        onAvatarClick={onAvatarClick}
      />
    );
  },
);
