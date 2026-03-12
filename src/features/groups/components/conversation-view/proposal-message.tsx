import { ThumbsUp, ThumbsDown, Clock, MapPin, FileText } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import type { Message } from "../../types/groups.types";

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

export function ProposalMessage({ message }: ProposalMessageProps) {
  // Parse proposal data from message content (in real app, this would be structured)
  // For now, we'll mock a proposal display based on the message
  const proposalData = {
    field: "dateTime" as const,
    currentValue: "Friday, Mar 15",
    proposedValue: "Saturday, Mar 16",
    votes: { approve: 1, reject: 0 },
    requiredVotes: 2,
  };

  const progress = (proposalData.votes.approve / proposalData.requiredVotes) * 100;

  return (
    <div className="flex justify-center my-3">
      <div className="max-w-[85%] sm:max-w-[75%]">
        {/* Proposal card */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border-b border-amber-500/20">
            <img
              src={message.senderAvatar}
              alt={message.senderName}
              className="w-5 h-5 rounded-full object-cover"
            />
            <span className="text-xs text-foreground">
              <span className="font-medium">{message.senderName}</span>
              {" proposed a change to "}
              <span className="font-medium">{fieldLabels[proposalData.field]}</span>
            </span>
          </div>

          {/* Change visualization */}
          <div className="p-3 space-y-2">
            <div className="flex items-start gap-2 rounded-lg bg-background/50 p-2.5">
              <span className="flex-shrink-0 mt-0.5 text-muted-foreground">
                {fieldIcons[proposalData.field]}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground line-through">
                  {proposalData.currentValue}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {proposalData.proposedValue}
                </p>
              </div>
            </div>

            {/* Voting progress */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted-foreground">
                  {proposalData.votes.approve} of {proposalData.requiredVotes} votes needed
                </span>
                {proposalData.votes.reject > 0 && (
                  <span className="text-red-500">
                    {proposalData.votes.reject} opposed
                  </span>
                )}
              </div>
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-600"
              >
                <ThumbsUp size={12} />
                Approve
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 h-7 text-xs gap-1 border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-500"
              >
                <ThumbsDown size={12} />
                Reject
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className="px-3 pb-2">
            <p className="text-[10px] text-muted-foreground text-right">
              {formatTime(message.timestamp)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
