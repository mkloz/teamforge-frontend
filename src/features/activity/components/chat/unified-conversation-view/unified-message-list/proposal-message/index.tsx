import { motion } from "framer-motion";
import { Reply, ThumbsUp } from "lucide-react";
import { memo, useState } from "react";

import { usePlanProposalActions } from "@/features/activity/hooks/use-plan-proposal-actions";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import { buildProposalSummaryText } from "@/features/activity/lib/proposal-language";
import { useCurrentUserQuery } from "@/shared/api/current-user-query";
import { cn } from "@/shared/lib/utils";
import { ProposalHeader } from "./proposal-header";
import { ProposalMessageDetails } from "./proposal-message-details";
import { getProposalMessageViewState } from "./proposal-message-view-model";

interface ProposalMessageProps {
  message: UnifiedMessage;
  showSender: boolean;
  kind: "dm" | "group";
}

export const ProposalMessage = memo(function ProposalMessage({
  message,
  showSender,
}: ProposalMessageProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: currentUser } = useCurrentUserQuery();
  const viewState = getProposalMessageViewState(message, currentUser?.id);
  const { x, opacity, scale, handleDragEnd } = useSwipeToReply(
    message,
    message.isOwn,
  );
  const proposalActions = usePlanProposalActions({
    mutationKeyScope: `message-${viewState?.proposal.id ?? "missing"}`,
  });

  if (!viewState) {
    return null;
  }

  const proposal = viewState.proposal;
  const summaryText = buildProposalSummaryText(proposal);

  return (
    <div className="relative group overflow-hidden">
      <motion.div
        style={{ opacity, scale, x: message.isOwn ? -20 : 20 }}
        className={cn(
          "absolute top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-forge-teal/20 text-forge-teal",
          message.isOwn ? "right-10" : "left-10",
        )}
      >
        <Reply size={16} strokeWidth={2.5} />
      </motion.div>

      <motion.div
        drag="x"
        dragConstraints={{
          left: message.isOwn ? -100 : 0,
          right: message.isOwn ? 0 : 100,
        }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "flex items-end relative z-10 w-full",
          message.isOwn ? "justify-end" : "justify-start",
        )}
      >
        <div
          className={cn(
            "flex w-full flex-col group/proposal sm:w-80",
            message.isOwn ? "ml-auto items-end" : "mr-auto items-start",
          )}
        >
          {!message.isOwn && showSender && (
            <p className="text-micro font-bold text-forge-teal mb-0.5 ml-1.5 tracking-tight opacity-90">
              {message.sender?.name || proposal.proposer.name}
            </p>
          )}

          <div
            className={cn(
              "relative flex w-full flex-col rounded-xl border shadow-xs backdrop-blur-md transition-all duration-300",
              message.isOwn
                ? "rounded-br-none border-primary/20 bg-secondary/80 hover:border-primary/40"
                : "rounded-bl-none border-border bg-white/20 hover:border-spark-amber/30 dark:bg-muted/10",
            )}
          >
            <div className="p-0.5">
              <div className="overflow-hidden">
                <ProposalHeader
                  field={proposal.field}
                  isExpanded={isExpanded}
                  onToggle={() => setIsExpanded((value) => !value)}
                  status={proposal.status}
                />

                {isExpanded && (
                  <ProposalMessageDetails
                    isSubmitting={proposalActions.isSubmitting}
                    onApprove={() => {
                      void proposalActions.approveProposal(proposal.id);
                    }}
                    onReject={() => {
                      void proposalActions.rejectProposal(proposal.id);
                    }}
                    onWithdraw={() => {
                      void proposalActions.withdrawProposal(proposal.id);
                    }}
                    summaryText={summaryText}
                    viewState={viewState}
                  />
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-border/5 px-3 py-1.5">
              <span className="text-nano font-bold uppercase tabular-nums text-slate-muted">
                {formatChatTime(message.createdAt)}
              </span>
              {message.status === "READ" && (
                <ThumbsUp size={10} className="text-spark-amber" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
});
