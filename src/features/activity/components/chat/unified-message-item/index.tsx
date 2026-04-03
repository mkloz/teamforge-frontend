import { useMessageLayout } from "@/features/activity/hooks/use-message-layout";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { cn } from "@/shared/lib/utils";
import { motion } from "framer-motion";
import { Reply } from "lucide-react";
import { memo } from "react";
import { MessageContent } from "./message-content";
import { MessageFooter } from "./message-footer";
import { MessageMedia } from "./message-media";
import { ReplyReference } from "./reply-reference";

interface UnifiedMessageItemProps {
  message: UnifiedMessage;
  showSender: boolean;
  showAvatar: boolean;
  kind: "dm" | "group";
  onAvatarClick?: (
    senderId: string,
    senderName: string,
    senderAvatar: string,
  ) => void;
}

/**
 * UnifiedMessageItem - Orchestrates the rendering of individual chat messages.
 */
export const UnifiedMessageItem = memo(function UnifiedMessageItem({
  message,
  showSender,
  showAvatar,
  kind,
  onAvatarClick,
}: UnifiedMessageItemProps) {
  const {
    isOwn,
    timestamp,
    status,
    content,
    attachments,
    replyTo,
    senderAvatar,
    senderName,
  } = message;
  const isGroup = kind === "group";

  // Gesture logic
  const { x, opacity, scale, handleDragEnd } = useSwipeToReply(message, isOwn);

  // Layout logic
  const { reactionGroups, galleryRounding, isReadByOthers } = useMessageLayout({
    message,
    isOwn,
  });

  return (
    <div className="relative group overflow-hidden">
      {/* Swipe to reply icon */}
      <motion.div
        style={{ opacity, scale, x: isOwn ? -20 : 20 }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full bg-forge-teal/20 text-forge-teal",
          isOwn ? "right-10" : "left-10",
        )}
      >
        <Reply size={16} strokeWidth={2.5} />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{ left: isOwn ? -100 : 0, right: isOwn ? 0 : 100 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "flex items-end gap-2 px-2 relative z-10",
          isOwn ? "justify-end" : "justify-start",
          showSender ? "mt-3" : "mt-0.5",
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="w-7 shrink-0">
            {showAvatar && (
              <button
                onClick={() =>
                  onAvatarClick?.(message.senderId, senderName, senderAvatar)
                }
                className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-forge-teal rounded-full"
                aria-label={`View ${senderName}'s profile`}
              >
                <img
                  src={senderAvatar}
                  alt={senderName}
                  className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-border hover:scale-110 hover:ring-forge-teal/60 transition-all duration-200 cursor-pointer"
                />
              </button>
            )}
          </div>
        )}

        <div
          className={cn(
            "max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col",
            isOwn ? "items-end ml-auto" : "items-start mr-auto",
          )}
        >
          {!isOwn && isGroup && showSender && (
            <p className="text-micro font-bold text-forge-teal mb-0.5 ml-1.5 tracking-tight opacity-90">
              {senderName}
            </p>
          )}

          <div className="flex flex-col gap-1 w-full">
            <div
              className={cn(
                "px-1 py-1 rounded-xl transition duration-300 flex flex-col relative w-fit shadow-xs",
                isOwn
                  ? "bg-secondary/80 backdrop-blur-md text-primary rounded-br-none"
                  : "bg-card/20 backdrop-blur-md border border-border text-ink rounded-bl-none shadow-xs",
                !content && "min-w-30",
              )}
            >
              <ReplyReference replyTo={replyTo} isOwn={isOwn} />

              <MessageMedia
                attachments={attachments}
                isOwn={isOwn}
                content={content}
                timestamp={timestamp}
                status={status}
                isReadByOthers={isReadByOthers}
                galleryRounding={galleryRounding}
                reactionGroupsLength={reactionGroups.length}
                replyTo={replyTo}
              />

              <MessageContent
                content={content}
                isOwn={isOwn}
                reactionGroupsLength={reactionGroups.length}
              />

              <MessageFooter
                attachments={attachments}
                content={content}
                reactionGroups={reactionGroups}
                isOwn={isOwn}
                timestamp={timestamp}
                status={status}
                isReadByOthers={isReadByOthers}
                isEdited={message.isEdited}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
