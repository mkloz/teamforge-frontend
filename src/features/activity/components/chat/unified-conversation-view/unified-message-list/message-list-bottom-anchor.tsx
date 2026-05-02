import type { RefObject } from "react";

import { TypingPresence } from "./typing-presence";

interface MessageListBottomAnchorProps {
  messagesEndRef: RefObject<HTMLDivElement | null>;
  totalHeight: number;
  typingUsers: { name: string; avatar: string | null }[];
}

export function MessageListBottomAnchor({
  messagesEndRef,
  totalHeight,
  typingUsers,
}: MessageListBottomAnchorProps) {
  return (
    <>
      <div
        className="absolute left-0 right-0"
        style={{ top: `${totalHeight}px` }}
      >
        <TypingPresence typingUsers={typingUsers} />
      </div>
      <div
        ref={messagesEndRef}
        className="absolute left-0 h-0 w-full shrink-0"
        style={{
          top: `${Math.max(totalHeight + (typingUsers.length > 0 ? 44 : 0) - 1, 0)}px`,
        }}
      />
    </>
  );
}
