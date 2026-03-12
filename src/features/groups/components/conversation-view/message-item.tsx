import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { Message } from "../../types/groups.types";

interface MessageItemProps {
  message: Message;
  showSender: boolean;
  // Read receipts - for design purposes
  readByAvatars?: string[];
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageItem({ message, showSender, readByAvatars }: MessageItemProps) {
  const isOwn = message.isOwn;
  
  // Mock read status for design (would come from real data)
  const hasBeenRead = isOwn && message.readBy && message.readBy.length > 0;
  const hasBeenDelivered = isOwn;

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-2",
        isOwn ? "justify-end" : "justify-start",
        showSender ? "mt-3" : "mt-0.5",
      )}
    >
      {/* Avatar - only for others and when showing sender */}
      {!isOwn && showSender && (
        <img
          src={message.senderAvatar}
          alt={message.senderName}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-border"
        />
      )}

      {/* Spacer when no avatar but aligned with avatars above */}
      {!isOwn && !showSender && <div className="w-7 flex-shrink-0" />}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] md:max-w-[60%] flex flex-col",
          isOwn ? "items-end" : "items-start",
        )}
      >
        {/* Sender name - only show for others */}
        {!isOwn && showSender && (
          <p className="text-xs font-semibold text-primary mb-1 ml-2">
            {message.senderName}
          </p>
        )}

        {/* Bubble */}
        <div
          className={cn(
            "relative px-3 py-2 rounded-2xl shadow-sm",
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "bg-card border border-border text-foreground rounded-bl-md",
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
            {message.content}
          </p>
          <div className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "",
          )}>
            <p
              className={cn(
                "text-[10px] select-none",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {formatTime(message.timestamp)}
            </p>
            {/* Read receipt indicators for own messages */}
            {isOwn && (
              hasBeenRead ? (
                <CheckCheck size={12} className="text-primary-foreground/70" />
              ) : hasBeenDelivered ? (
                <Check size={12} className="text-primary-foreground/50" />
              ) : null
            )}
          </div>
        </div>

        {/* Read by avatars (shown for own messages when others have read) */}
        {isOwn && readByAvatars && readByAvatars.length > 0 && (
          <div className="flex -space-x-1 mt-1">
            {readByAvatars.slice(0, 4).map((avatar, i) => (
              <img
                key={i}
                src={avatar}
                alt="Read by"
                className="w-4 h-4 rounded-full object-cover ring-1 ring-background"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
