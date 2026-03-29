import { Button } from "@/shared/components/ui/button";
import { Clock, FileText, MapPin, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Message } from "@/features/activity/types/groups.types";
import { memo } from "react";
import { cn } from "@/shared/lib/utils";

interface ProposalMessageProps {
  message: Message;
}

const fieldIcons: Record<string, React.ReactNode> = {
  title: <FileText size={14} />,
  description: <FileText size={14} />,
  dateTime: <Clock size={14} />,
  location: <MapPin size={14} />,
};

const fieldLabels: Record<string, string> = {
  title: "Title",
  description: "Description",
  dateTime: "Date & Time",
  location: "Location",
};

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * ProposalMessage - Renders a change proposal message in a group chat.
 * Uses spark-amber and forge-teal design tokens.
 * Memoized to prevent redundant re-renders.
 */
export const ProposalMessage = memo(function ProposalMessage({
  message,
}: ProposalMessageProps) {
  // Parse proposal data from message content (in real app, this would be structured)
  // For now, we'll mock a proposal display based on the message
  const proposalData = {
    field: "dateTime" as const,
    currentValue: "Friday, Mar 15",
    proposedValue: "Saturday, Mar 16",
    votes: { approve: 1, reject: 0 },
    requiredVotes: 2,
  };

  const progress =
    (proposalData.votes.approve / proposalData.requiredVotes) * 100;

  return (
    <div className="flex justify-center my-3">
      <div className="max-w-[85%] sm:max-w-[75%]">
        {/* Proposal card */}
        <div className="rounded-xl border border-spark-amber/30 bg-spark-amber/5 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-spark-amber/10 border-b border-spark-amber/20">
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-5 h-5 rounded-full object-cover shrink-0 ring-1 ring-spark-amber/30"
            />
            <span className="text-xs text-foreground">
              <span className="font-bold">{message.senderName}</span>
              {" proposed a change to "}
              <span className="font-bold">
                {fieldLabels[proposalData.field]}
              </span>
            </span>
          </div>

          {/* Change visualization */}
          <div className="p-3 space-y-3">
            <div className="flex items-start gap-3 rounded-lg bg-canvas/60 p-2.5 ring-1 ring-border/40">
              <span className="shrink-0 mt-0.5 text-slate-muted">
                {fieldIcons[proposalData.field]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-muted line-through decoration-slate-muted/50 leading-tight">
                  {proposalData.currentValue}
                </p>
                <p className="text-sm font-bold text-ink leading-snug">
                  {proposalData.proposedValue}
                </p>
              </div>
            </div>

            {/* Voting progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-muted font-medium">
                  {proposalData.votes.approve} of {proposalData.requiredVotes}{" "}
                  votes needed
                </span>
                {proposalData.votes.reject > 0 && (
                  <span className="text-destructive font-black uppercase tracking-wider">
                    {proposalData.votes.reject} opposed
                  </span>
                )}
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-spark-amber transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 h-8 text-xs font-bold gap-1.5",
                  "border-forge-teal/20 text-forge-teal bg-forge-teal/5",
                  "hover:bg-forge-teal hover:text-white hover:border-forge-teal transition-all duration-200",
                )}
              >
                <ThumbsUp size={12} strokeWidth={2.5} />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "flex-1 h-8 text-xs font-bold gap-1.5",
                  "border-destructive/20 text-destructive bg-destructive/5",
                  "hover:bg-destructive hover:text-white hover:border-destructive transition-all duration-200",
                )}
              >
                <ThumbsDown size={12} strokeWidth={2.5} />
                Reject
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-3 pb-2 border-t border-spark-amber/10 pt-1.5">
            <p className="text-[9px] font-medium text-slate-muted text-right tabular-nums">
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
