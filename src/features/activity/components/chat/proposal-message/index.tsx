import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Reply, ThumbsUp } from "lucide-react";
import { memo, useMemo, useState } from "react";

import { AuthQueries } from "@/features/auth/api/auth.queries";
import { useSwipeToReply } from "@/features/activity/hooks/use-swipe-to-reply";
import { formatChatTime } from "@/features/activity/lib/chat-utils";
import type { UnifiedMessage } from "@/features/activity/lib/activity-contract";
import {
  buildProposalSummaryText,
  formatProposalDate,
  formatProposalValue,
} from "@/features/activity/lib/proposal-language";
import { ActivityApi } from "@/features/activity/api/activity.api";
import { getApiErrorMessage } from "@/shared/lib/api-error-message";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { ProposalActions } from "./proposal-actions";
import { ProposalComparison } from "./proposal-comparison";
import { ProposalHeader } from "./proposal-header";
import { ProposalVoters } from "./proposal-voters";

interface ProposalMessageProps {
  message: UnifiedMessage;
  showSender: boolean;
  kind: "dm" | "group";
}

export const ProposalMessage = memo(function ProposalMessage({
  message,
  showSender,
}: ProposalMessageProps) {
  const proposal = message.proposal ?? null;
  const [isExpanded, setIsExpanded] = useState(false);
  const queryClient = useQueryClient();
  const { data: currentUser } = AuthQueries.useCurrentUser();
  const { x, opacity, scale, handleDragEnd } = useSwipeToReply(
    message,
    message.isOwn,
  );

  const approveCount =
    proposal?.votes.filter((vote) => vote.vote === "APPROVE").length ?? 0;
  const rejectCount =
    proposal?.votes.filter((vote) => vote.vote === "REJECT").length ?? 0;
  const totalVotes = approveCount + rejectCount;
  const hasVoted =
    currentUser !== undefined &&
    proposal?.votes.some((vote) => vote.userId === currentUser.id) === true;
  const isPending = proposal?.status === "PENDING";
  const isProposer = currentUser?.id === proposal?.proposerId;
  const canVote = isPending && !isProposer && !hasVoted;
  const eligibleVoterCount = Math.max(
    message.proposalEligibleVoterCount ?? proposal?.votes.length ?? 0,
    proposal?.votes.length ?? 0,
    1,
  );
  const voteProgress = Math.min(
    100,
    Math.round((totalVotes / eligibleVoterCount) * 100),
  );
  const proposalVoters = message.proposalVoters ?? [];

  const summaryText = useMemo(
    () => (proposal ? buildProposalSummaryText(proposal) : ""),
    [proposal],
  );

  const invalidateProposalViews = async () => {
    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: ["activity-selection"],
      }),
      queryClient.invalidateQueries({
        queryKey: ["activity-feed"],
      }),
    ]);
  };

  const voteMutation = useMutation({
    mutationKey: [
      "activity",
      "proposal",
      "message-vote",
      proposal?.id ?? "missing",
    ],
    mutationFn: (vote: "APPROVE" | "REJECT") =>
      proposal
        ? ActivityApi.votePlanProposal(proposal.id, { vote })
        : Promise.reject(new Error("Missing proposal context")),
    onSuccess: async (_, vote) => {
      await invalidateProposalViews();
      toast.success(
        vote === "APPROVE" ? "Proposal approved." : "Proposal rejected.",
      );
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(error, "We couldn't submit your vote right now."),
      );
    },
  });

  const withdrawMutation = useMutation({
    mutationKey: [
      "activity",
      "proposal",
      "message-withdraw",
      proposal?.id ?? "missing",
    ],
    mutationFn: () =>
      proposal
        ? ActivityApi.withdrawPlanProposal(proposal.id)
        : Promise.reject(new Error("Missing proposal context")),
    onSuccess: async () => {
      await invalidateProposalViews();
      toast.success("Proposal withdrawn.");
    },
    onError: (error) => {
      toast.error(
        getApiErrorMessage(
          error,
          "We couldn't withdraw that proposal right now.",
        ),
      );
    },
  });

  if (!proposal) {
    return null;
  }

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
                  <div className="overflow-hidden px-3 pb-3">
                    <p className="mb-3 text-xs text-muted-foreground">
                      {summaryText}
                    </p>

                    <ProposalComparison
                      current={formatProposalValue(proposal.currentValue)}
                      proposed={formatProposalValue(proposal.proposedValue)}
                    />

                    <div className="mt-4 space-y-2">
                      <ProposalVoters
                        voters={proposalVoters}
                        score={`${totalVotes}/${eligibleVoterCount} votes`}
                        progress={voteProgress}
                      />

                      <div className="flex items-center justify-between gap-3 text-[11px] text-muted-foreground">
                        <span>{formatProposalDate(proposal.createdAt)}</span>
                        <span className="font-medium">
                          {approveCount} approve · {rejectCount} reject
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <ProposalActions
                        canVote={canVote}
                        hasVoted={hasVoted}
                        isPending={isPending}
                        isProposer={isProposer}
                        isSubmitting={
                          voteMutation.isPending || withdrawMutation.isPending
                        }
                        onApprove={() => {
                          void voteMutation.mutateAsync("APPROVE");
                        }}
                        onReject={() => {
                          void voteMutation.mutateAsync("REJECT");
                        }}
                        onWithdraw={() => {
                          void withdrawMutation.mutateAsync();
                        }}
                      />
                    </div>
                  </div>
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
