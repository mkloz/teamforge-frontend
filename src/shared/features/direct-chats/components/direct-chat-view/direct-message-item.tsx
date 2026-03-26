import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import type { DirectMessage, MessageStatus } from "../../types/direct-chats.types";

interface DirectMessageItemProps {
  message: DirectMessage;
  showAvatar: boolean;
  participantAvatar: string;
  participantName: string;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function MessageStatusIcon({ status, isOwn }: { status: MessageStatus; isOwn: boolean }) {
  if (!isOwn) return null;
  
  switch (status) {
    case "SENDING":
      return <span className="w-3 h-3 rounded-full border border-primary-foreground/40 border-t-transparent animate-spin" />;
    case "SENT":
      return <Check size={14} className="text-primary-foreground/50" />;
    case "DELIVERED":
      return <CheckCheck size={14} className="text-primary-foreground/50" />;
    case "READ":
      return <CheckCheck size={14} className="text-primary-foreground/70" />;
  }
}

export function DirectMessageItem({ 
  message, 
  showAvatar,
  participantAvatar,
  participantName,
}: DirectMessageItemProps) {
  const isOwn = message.isOwn;

  return (
    <div
      className={cn(
        "flex items-end gap-2 px-2",
        isOwn ? "justify-end" : "justify-start",
        showAvatar ? "mt-3" : "mt-0.5",
      )}
    >
      {/* Avatar - only for others and when showing */}
      {!isOwn && showAvatar && (
        <img
          src={participantAvatar}
          alt={participantName}
          className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-border"
        />
      )}

      {/* Spacer when no avatar but aligned with avatars above */}
      {!isOwn && !showAvatar && <div className="w-7 flex-shrink-0" />}

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] sm:max-w-[70%] md:max-w-[60%] flex flex-col",
          isOwn ? "items-end" : "items-start",
        )}
      >
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
          {/* Time + read status */}
          <div className={cn(
            "flex items-center gap-1 mt-1",
            isOwn ? "justify-end" : "",
          )}>
            <span
              className={cn(
                "text-[10px] select-none",
                isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
              )}
            >
              {formatTime(message.timestamp)}
            </span>
            <MessageStatusIcon status={message.status} isOwn={isOwn} />
          </div>
        </div>
      </div>
    </div>
  );
}
