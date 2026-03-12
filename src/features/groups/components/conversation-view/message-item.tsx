import { cn } from "@/shared/lib/utils";
import type { Message } from "../../types/groups.types";

interface MessageItemProps {
  message: Message;
  showSender: boolean;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageItem({ message, showSender }: MessageItemProps) {
  const isOwn = message.isOwn;

  return (
    <div
      className={cn(
        "flex items-end gap-2",
        isOwn ? "justify-end" : "justify-start",
        showSender ? "mt-3" : "mt-0.5",
      )}
    >
      {/* Avatar - only for others and when showing sender */}
      {!isOwn && showSender && (
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
        />
      )}

      {/* Spacer when no avatar but aligned with avatars above */}
      {!isOwn && !showSender && <div className="w-8 flex-shrink-0" />}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[75%] md:max-w-[60%]",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Sender name - only show for others */}
        {!isOwn && showSender && (
          <p className="text-xs font-medium text-primary mb-1 ml-1">
            {message.senderName}
          </p>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "px-3 py-2 rounded-2xl",
            isOwn
              ? "bg-primary/15 text-foreground rounded-br-sm"
              : "bg-muted text-foreground rounded-bl-sm",
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content}
          </p>
          <p
            className={cn(
              "text-[10px] mt-1",
              isOwn ? "text-primary/60 text-right" : "text-muted-foreground",
            )}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    </div>
  );
}
