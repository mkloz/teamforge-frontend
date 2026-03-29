import type { Message } from "../../types/groups.types";
import { MessageItem } from "./message-item";
import { SystemMessage } from "./system-message";
import { ProposalMessage } from "./proposal-message";

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

function formatDateSeparator(isoString: string): string {
  const date = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function shouldShowDateSeparator(
  currentMsg: Message,
  prevMsg: Message | undefined,
): boolean {
  if (!prevMsg) return true;
  const currentDate = new Date(currentMsg.timestamp).toDateString();
  const prevDate = new Date(prevMsg.timestamp).toDateString();
  return currentDate !== prevDate;
}

function shouldShowSender(
  currentMsg: Message,
  prevMsg: Message | undefined,
): boolean {
  if (currentMsg.type === "SYSTEM") return false;
  if (!prevMsg) return true;
  if (prevMsg.type === "SYSTEM") return true;
  if (prevMsg.senderId !== currentMsg.senderId) return true;

  // Show sender if more than 5 minutes apart
  const timeDiff =
    new Date(currentMsg.timestamp).getTime() -
    new Date(prevMsg.timestamp).getTime();
  return timeDiff > 5 * 60 * 1000;
}

export function MessageList({ messages, messagesEndRef, containerRef }: MessageListProps) {
  return (
    <div ref={containerRef} className="h-full overflow-y-auto px-4 py-3">
      <div className="flex flex-col gap-1">
        {messages.map((message, index) => {
          const prevMessage = messages[index - 1];
          const showDateSeparator = shouldShowDateSeparator(message, prevMessage);
          const showSender = shouldShowSender(message, prevMessage);

          return (
            <div key={message.id}>
              {/* Date separator */}
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="px-3 py-1 rounded-full bg-muted text-xs text-muted-foreground font-medium">
                    {formatDateSeparator(message.timestamp)}
                  </span>
                </div>
              )}

              {/* Message by type */}
              {message.type === "SYSTEM" ? (
                <SystemMessage message={message} />
              ) : message.type === "PLAN_UPDATE" ? (
                <ProposalMessage message={message} />
              ) : (
                <MessageItem
                  message={message}
                  showSender={showSender}
                />
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
