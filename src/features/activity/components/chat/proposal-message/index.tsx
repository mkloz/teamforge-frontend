import type { UnifiedMessage } from "@/features/activity/types/chat.types";
import { cn } from "@/shared/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Reply, ThumbsUp } from "lucide-react";
import { memo, useMemo, useState } from "react";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import { MessageReactions } from "../message-reactions";
import { ProposalHeader } from "./proposal-header";
import { ProposalComparison } from "./proposal-comparison";
import { ProposalVoters } from "./proposal-voters";
import { ProposalActions } from "./proposal-actions";

interface ProposalMessageProps {
  message: UnifiedMessage;
  showAvatar: boolean;
  showSender: boolean;
}

/**
 * ProposalMessage - Renders a change proposal message in a group chat.
 * Styled to match the message bubble system but uses spark-amber tokens.
 */
export const ProposalMessage = memo(function ProposalMessage({
  message,
  showAvatar,
  showSender,
}: ProposalMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { isOwn, sender, createdAt: timestamp, reactions, status } = message;
  const senderFullName = sender?.fullName || "System";
  const senderAvatar = sender?.avatar || "";

  // Swipe-to-reply logic
  const { x, opacity, scale, handleDragEnd } = useSwipeToReply(message, isOwn);

  // Mock proposal data as per project requirement (temporary)
  const proposalData = useMemo(
    () => ({
      field: "dateTime" as const,
      currentValue: "Friday, Mar 15",
      proposedValue: "Saturday, Mar 16",
      votes: {
        approve: 3,
        reject: 1,
        voters: [
          {
            id: "1",
            fullName: "Michal",
            avatar: "https://i.pravatar.cc/150?u=1",
            type: "approve",
          },
          {
            id: "2",
            fullName: "Alice",
            avatar: "https://i.pravatar.cc/150?u=2",
            type: "approve",
          },
          {
            id: "3",
            fullName: "Bob",
            avatar: "https://i.pravatar.cc/150?u=3",
            type: "reject",
          },
          {
            id: "4",
            fullName: "Sam",
            avatar: "https://i.pravatar.cc/150?u=4",
            type: "approve",
          },
        ],
      },
      requiredVotes: 5,
    }),
    [],
  );

  const progress =
    (proposalData.votes.approve / proposalData.requiredVotes) * 100;

  const reactionGroups = useMemo(() => {
    if (!reactions || !Array.isArray(reactions)) return [];

    const groups: Record<string, { count: number; isActive: boolean }> = {};
    reactions.forEach((r) => {
      if (!groups[r.emoji]) {
        groups[r.emoji] = { count: 0, isActive: false };
      }
      groups[r.emoji].count++;
      if (r.userId === "user-current") {
        groups[r.emoji].isActive = true;
      }
    });

    return Object.entries(groups).map(([emoji, data]) => ({
      emoji,
      count: data.count,
      isActive: data.isActive,
    }));
  }, [reactions]);

  return (
    <div className="relative group overflow-hidden">
      {/* Swipe state indicator */}
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
          "flex items-end gap-2 px-2 relative z-10 py-0.5",
          isOwn ? "flex-row-reverse" : "flex-row",
          showSender ? "mt-3" : "mt-0.5",
        )}
      >
        {/* Avatar */}
        {!isOwn && (
          <div className="w-7 shrink-0">
            {showAvatar && (
              <img
                src={senderAvatar}
                alt={senderFullName}
                className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-border shadow-sm transition-transform hover:scale-105"
              />
            )}
          </div>
        )}

        <div
          className={cn(
            "w-full sm:w-80 flex flex-col group/proposal",
            isOwn ? "items-end ml-auto" : "items-start mr-auto",
          )}
        >
          {!isOwn && showSender && (
            <p className="text-micro font-bold text-forge-teal mb-0.5 ml-1.5 tracking-tight opacity-90">
              {senderFullName}
            </p>
          )}

          <div
            className={cn(
              "relative rounded-xl border flex flex-col w-full transition-colors duration-300 shadow-xs backdrop-blur-md",
              isOwn
                ? "bg-secondary/80 border-primary/20 hover:border-primary/40 rounded-br-none text-foreground dark:text-primary"
                : "bg-white/20 dark:bg-muted/10 border-border hover:border-spark-amber/30 rounded-bl-none text-ink",
            )}
          >
            <div className="p-1">
              <div className="border-b border-spark-amber/10 overflow-hidden">
                <ProposalHeader
                  field={proposalData.field}
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded(!isExpanded)}
                />

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-3 pb-3 overflow-hidden"
                    >
                      <ProposalComparison
                        current={proposalData.currentValue}
                        proposed={proposalData.proposedValue}
                      />

                      <div className="mt-4 space-y-2">
                        <ProposalVoters
                          voters={proposalData.votes.voters}
                          score={`${proposalData.votes.approve}/${proposalData.requiredVotes}`}
                          progress={progress}
                        />
                      </div>

                      <div className="mt-4 flex gap-2">
                        <ProposalActions />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Footer Metadata */}
            <div className="px-3 py-1.5 flex items-center justify-end gap-3 border-t border-border/5">
              <MessageReactions reactions={reactionGroups} isOwn={isOwn} />

              <div className="flex items-center gap-2">
                <span className="text-nano font-bold text-slate-muted tabular-nums uppercase">
                  {formatChatTime(timestamp)}
                </span>
                {status === "READ" && (
                  <ThumbsUp size={10} className="text-spark-amber" />
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
