import { cn } from "@/shared/lib/utils";
import type { Message, GroupMember } from "../../types/groups.types";

interface MessageItemProps {
  message: Message;
  showSender: boolean;
  // Read receipts - Instagram style
  groupMembers?: GroupMember[];
  isLastMessage?: boolean;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessageItem({ 
  message, 
  showSender, 
  groupMembers = [],
  isLastMessage = false,
}: MessageItemProps) {
  const isOwn = message.isOwn;
  
  // Get members who have read this message (excluding sender)
  const readByMembers = groupMembers.filter(
    m => message.readBy?.includes(m.id) && m.id !== message.senderId
  );

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
          <p
            className={cn(
              "text-[10px] select-none mt-1",
              isOwn ? "text-primary-foreground/70 text-right" : "text-muted-foreground",
            )}
          >
            {formatTime(message.timestamp)}
          </p>
        </div>

        {/* Instagram-style read receipts - small avatars below message */}
        {isLastMessage && readByMembers.length > 0 && (
          <div className="flex items-center gap-0.5 mt-1.5 mr-1">
            <span className="text-[9px] text-muted-foreground mr-1">Seen by</span>
            <div className="flex -space-x-1.5">
              {readByMembers.slice(0, 5).map((member) => (
                <img
                  key={member.id}
                  src={member.avatar}
                  alt={member.name}
                  title={member.name}
                  className="w-3.5 h-3.5 rounded-full object-cover ring-1 ring-background"
                />
              ))}
            </div>
            {readByMembers.length > 5 && (
              <span className="text-[9px] text-muted-foreground ml-0.5">
                +{readByMembers.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
